const prisma = require('../../config/database');
const profileService = require('./profile.service');
const { BUDGET_RANGES, SURVEY_QUESTIONS } = require('./recommendation.constants');
const { normalizeCategory } = require('../../shared/utils/category.utils');

const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:8000/chat';
const RECOMMENDATION_DEDUPE_TTL_MS = 2 * 60 * 1000;
const inMemoryDedupe = new Map();

const extractJsonObject = (text = '') => {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return null;
  try {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  } catch (_) {
    return null;
  }
};

const surveyAnswersSignature = (answers = {}) =>
  SURVEY_QUESTIONS.map((q) => answers[q.id] ?? '').join('|');

const mapProductsFromIds = (products, ids, limit, razon, totalCoincidencias, filtrosAplicados) => {
  const byId = new Map(products.map((p) => [p.id, p]));
  return ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .slice(0, limit)
    .map((producto) => ({
      producto,
      razon,
      totalCoincidencias,
      filtrosAplicados,
    }));
};

const getValidProductsFromIds = async ({ ids, limit, whereExtra = {} }) => {
  if (!ids.length) return [];
  const products = await prisma.producto.findMany({
    where: {
      id: { in: ids },
      estaActivo: true,
      stock: { gt: 0 },
      ...whereExtra,
    },
    include: {
      vendedor: { select: { id: true, nombres: true, apellidos: true } },
      imagenes: true,
    },
  });

  const validIdSet = new Set(products.map((p) => p.id));
  const validIds = ids.filter((id) => validIdSet.has(id)).slice(0, limit);

  return {
    products,
    validIds,
  };
};

const resolveAIProductSelection = async ({ answers, limit, usuarioId }) => {
  const prompt = [
    'Necesito recomendaciones de productos para una encuesta de ecommerce.',
    'Usa tus tools para buscar productos reales en la base y devuelve IDs.',
    'Devuelve SOLO JSON con esta forma exacta:',
    '{"product_ids":[1,2,3],"razon":"string corta"}',
    'product_ids debe tener entre 1 y 12 ids enteros únicos.',
    'Prioriza que cumplan encuesta y también productos similares relevantes.',
    `Respuestas: ${JSON.stringify(answers)}`,
    `Cantidad objetivo visible: ${limit}`,
  ].join('\n');

  const response = await fetch(CHATBOT_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rol: 'comprador',
      mensaje: prompt,
      contexto: { usuario_id: usuarioId },
    }),
  });

  if (!response.ok) {
    throw new Error(`chatbot service error ${response.status}`);
  }

  const payload = await response.json();
  const parsed = extractJsonObject(payload?.respuesta || '');
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('No se pudo parsear respuesta JSON del chatbot');
  }

  const aiIds = Array.isArray(parsed.product_ids) ? parsed.product_ids : [];
  const productIds = Array.from(
    new Set(
      aiIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ).slice(0, 12);

  return {
    productIds,
    razon: parsed.razon || 'Recomendado por IA según tu encuesta',
  };
};

/**
 * Al completar la encuesta: llama a la IA y guarda solo el ultimo resultado para evitar llamados duplicados.
 */
const refreshSurveyRecommendationsFromAI = async ({ usuarioId, limit = 6 }) => {
  if (!usuarioId) throw new Error('usuarioId requerido');

  const preferences = await profileService.getPreferences(usuarioId);
  const answers = preferences.survey?.answers || {};
  if (!Object.keys(answers).length) return [];

  const presupuesto = answers.presupuesto || null;
  const priceRange = presupuesto ? BUDGET_RANGES[presupuesto] : null;
  const categoria = normalizeCategory(answers.categoria);
  const condicion = answers.condicionPreferida && answers.condicionPreferida !== 'CUALQUIERA'
    ? answers.condicionPreferida
    : null;
  const precio = {};
  if (priceRange?.min != null) precio.gte = priceRange.min;
  if (priceRange?.max != null && Number.isFinite(priceRange.max)) precio.lte = priceRange.max;
  const whereExtra = {
    ...(categoria ? { categoria } : {}),
    ...(condicion ? { condicion } : {}),
    ...(Object.keys(precio).length ? { precio } : {}),
  };

  const sig = surveyAnswersSignature(answers);
  const dedupeKey = `${usuarioId}:${sig}`;
  const cached = inMemoryDedupe.get(dedupeKey);
  if (cached && Date.now() - cached.at < RECOMMENDATION_DEDUPE_TTL_MS) {
    return cached.recommendations;
  }

  let productIdsOrdered = [];
  let razon = 'Recomendado por IA según tu encuesta';

  try {
    const aiSelection = await resolveAIProductSelection({ answers, limit, usuarioId });
    const ids = aiSelection.productIds.slice(0, Math.max(limit, 12));

    productIdsOrdered = ids;
    razon = aiSelection.razon;
  } catch (error) {
    throw error;
  }

  if (!productIdsOrdered.length) {
    inMemoryDedupe.set(dedupeKey, { at: Date.now(), recommendations: [] });
    return [];
  }

  const { products, validIds } = await getValidProductsFromIds({
    ids: productIdsOrdered,
    limit,
    whereExtra,
  });
  if (!validIds.length) {
    inMemoryDedupe.set(dedupeKey, { at: Date.now(), recommendations: [] });
    return [];
  }

  const recommendations = mapProductsFromIds(
    products,
    validIds,
    limit,
    razon,
    validIds.length,
    null,
  );
  inMemoryDedupe.set(dedupeKey, { at: Date.now(), recommendations });
  return recommendations;
};

module.exports = {
  refreshSurveyRecommendationsFromAI,
};
