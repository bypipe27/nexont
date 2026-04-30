const prisma = require('../../config/database');
const profileService = require('./profile.service');
const { BUDGET_RANGES, SURVEY_QUESTIONS } = require('./recommendation.constants');
const { normalizeCategory, getCategoryLabel } = require('../../shared/utils/category.utils');

const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:8000/chat';

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

const buildDeterministicFilter = (answers = {}) => {
  const presupuesto = answers.presupuesto || null;
  const priceRange = presupuesto ? BUDGET_RANGES[presupuesto] : null;
  const category = normalizeCategory(answers.categoria);
  const condicion = answers.condicionPreferida && answers.condicionPreferida !== 'CUALQUIERA'
    ? answers.condicionPreferida
    : null;

  const precio = {};
  if (priceRange?.min != null) precio.gte = priceRange.min;
  if (priceRange?.max != null && Number.isFinite(priceRange.max)) precio.lte = priceRange.max;

  return {
    categoria: category,
    condicion,
    precio_min: priceRange?.min ?? null,
    precio_max: priceRange?.max ?? null,
    where: {
      estaActivo: true,
      stock: { gt: 0 },
      ...(category ? { categoria: category } : {}),
      ...(condicion ? { condicion } : {}),
      ...(Object.keys(precio).length ? { precio } : {}),
    },
    razon: 'Coincide con tus respuestas de la encuesta',
  };
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

  if (!productIds.length) {
    throw new Error('La IA no devolvió IDs válidos');
  }

  return {
    productIds,
    razon: parsed.razon || 'Recomendado por IA según tu encuesta',
  };
};

/** Encuesta incompleta o sin datos: vacío. */
const deterministicRecommendationsOnly = async (usuarioId, limit) => {
  const preferences = await profileService.getPreferences(usuarioId);
  const answers = preferences.survey?.answers || {};
  if (!Object.keys(answers).length) return [];

  const fallbackFilter = buildDeterministicFilter(answers);
  const [totalMatches, products] = await Promise.all([
    prisma.producto.count({ where: fallbackFilter.where }),
    prisma.producto.findMany({
      where: fallbackFilter.where,
      include: {
        vendedor: { select: { id: true, nombres: true, apellidos: true } },
        imagenes: true,
      },
      orderBy: [{ promedioCalificacion: 'desc' }, { creadoEn: 'desc' }],
      take: limit,
    }),
  ]);

  return products.map((producto) => ({
    producto,
    razon: `${fallbackFilter.razon} · ${totalMatches} productos cumplen`,
    totalCoincidencias: totalMatches,
    filtrosAplicados: {
      categoria: fallbackFilter.categoria ? getCategoryLabel(fallbackFilter.categoria) : null,
      condicion: fallbackFilter.condicion || null,
      precioMin: fallbackFilter.precio_min,
      precioMax: fallbackFilter.precio_max,
    },
  }));
};

/**
 * Lectura solamente: usa caché guardado tras completar encuesta; si no hay caché, fallback determinístico (sin IA).
 * Usar desde GET setup y GET recomendaciones (no debe llamar al modelo).
 */
const getSurveyRecommendationsForDisplay = async ({ usuarioId, limit = 6 }) => {
  if (!usuarioId) throw new Error('usuarioId requerido');

  const preferences = await profileService.getPreferences(usuarioId);
  const answers = preferences.survey?.answers || {};
  if (!Object.keys(answers).length) return [];

  const cache = preferences.survey?.recommendationCache;
  if (cache?.productIds?.length) {
    const ids = cache.productIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0);
    if (ids.length) {
      const products = await prisma.producto.findMany({
        where: {
          id: { in: ids },
          estaActivo: true,
          stock: { gt: 0 },
        },
        include: {
          vendedor: { select: { id: true, nombres: true, apellidos: true } },
          imagenes: true,
        },
      });

      const ordered = mapProductsFromIds(
        products,
        ids,
        limit,
        cache.razon || 'Selección guardada de tu encuesta',
        ids.length,
        null,
      );
      if (ordered.length) return ordered;
    }
  }

  return deterministicRecommendationsOnly(usuarioId, limit);
};

/**
 * Una sola vez al completar la encuesta: llama a la IA, guarda IDs en perfil y devuelve el mismo formato que pantalla.
 */
const refreshSurveyRecommendationsFromAI = async ({ usuarioId, limit = 6 }) => {
  if (!usuarioId) throw new Error('usuarioId requerido');

  const preferences = await profileService.getPreferences(usuarioId);
  const answers = preferences.survey?.answers || {};
  if (!Object.keys(answers).length) return [];

  const sig = surveyAnswersSignature(answers);
  const cache = preferences.survey?.recommendationCache;
  if (
    cache?.productIds?.length
    && cache.answersSignature === sig
  ) {
    return getSurveyRecommendationsForDisplay({ usuarioId, limit });
  }

  let productIdsOrdered = [];
  let razon = 'Recomendado por IA según tu encuesta';

  try {
    const aiSelection = await resolveAIProductSelection({ answers, limit, usuarioId });
    const ids = aiSelection.productIds.slice(0, Math.max(limit, 12));

    await profileService.updatePreferences(usuarioId, {
      survey: {
        recommendationCache: {
          productIds: ids,
          razon: aiSelection.razon,
          answersSignature: sig,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    productIdsOrdered = ids;
    razon = aiSelection.razon;
  } catch (_) {
    const fallbackFilter = buildDeterministicFilter(answers);
    const products = await prisma.producto.findMany({
      where: fallbackFilter.where,
      select: { id: true },
      orderBy: [{ promedioCalificacion: 'desc' }, { creadoEn: 'desc' }],
      take: limit,
    });
    productIdsOrdered = products.map((p) => p.id);
    await profileService.updatePreferences(usuarioId, {
      survey: {
        recommendationCache: {
          productIds: productIdsOrdered,
          razon: fallbackFilter.razon,
          answersSignature: sig,
          generatedAt: new Date().toISOString(),
        },
      },
    });
    razon = fallbackFilter.razon;
  }

  const prefsAfter = await profileService.getPreferences(usuarioId);
  const cacheIds = prefsAfter.survey?.recommendationCache?.productIds || productIdsOrdered;
  const cachedRazon = prefsAfter.survey?.recommendationCache?.razon || razon;

  const aiProducts = await prisma.producto.findMany({
    where: {
      id: { in: cacheIds },
      estaActivo: true,
      stock: { gt: 0 },
    },
    include: {
      vendedor: { select: { id: true, nombres: true, apellidos: true } },
      imagenes: true,
    },
  });

  return mapProductsFromIds(
    aiProducts,
    cacheIds,
    limit,
    cachedRazon,
    cacheIds.length,
    null,
  );
};

const getRecommendations = async ({ usuarioId, limit = 6 }) =>
  getSurveyRecommendationsForDisplay({ usuarioId, limit });

module.exports = {
  getRecommendations,
  getSurveyRecommendationsForDisplay,
  refreshSurveyRecommendationsFromAI,
};
