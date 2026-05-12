import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/api';
import AssistedTopBar from '../components/assisted/AssistedTopBar';
import { useHybridCart } from '../hooks/useHybridCart';

const SURVEY_RECO_CACHE_KEY = 'survey_recommendations_cache_v1';
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@200..700&display=swap');
  :root { --ar-bg: #f7f9fd; --ar-surface: #ffffff; --ar-surface-low: #f2f4f8; --ar-surface-container: #eceef2; --ar-on-surface: #191c1f; --ar-on-surface-variant: #45464c; --ar-outline-variant: #c6c6cd; --ar-primary: #000000; --ar-primary-contrast: #ffffff; --ar-secondary: #5c5f60; --ar-error: #ba1a1a; --ar-success: #157f3b; --ar-shadow: rgba(0, 0, 0, 0.08); }
  [data-theme='dark'] .ar-root { --ar-bg: #2d3134; --ar-surface: #191c1e; --ar-surface-low: #2d3134; --ar-surface-container: #191c1e; --ar-on-surface: #eff1f5; --ar-on-surface-variant: #c6c6cd; --ar-outline-variant: #45464c; --ar-primary: #c0c6db; --ar-primary-contrast: #191c1f; --ar-secondary: #e1e3e4; --ar-shadow: rgba(0, 0, 0, 0.35); }
  .ar-root { min-height: 100vh; background: var(--ar-bg); color: var(--ar-on-surface); font-family: 'Inter', sans-serif; }
  .ar-icon { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-size: 20px; line-height: 1; }
  .ar-option .ar-icon { font-size: 26px; }
  .ar-nav { position: sticky; top: 0; z-index: 20; background: var(--ar-surface); border-bottom: 1px solid var(--ar-outline-variant); }
  .ar-nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .ar-brand { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 900; color: var(--ar-on-surface); text-decoration: none; letter-spacing: -0.02em; }
  .ar-brand img { width: 28px; height: 28px; }
  .ar-nav-links { display: flex; align-items: center; gap: 24px; }
  .ar-nav-link { text-decoration: none; font-size: 14px; font-weight: 500; color: var(--ar-on-surface-variant); padding-bottom: 4px; border-bottom: 2px solid transparent; transition: color 0.2s ease, border-color 0.2s ease; }
  .ar-nav-link.active { color: var(--ar-on-surface); border-bottom-color: var(--ar-on-surface); }
  .ar-nav-link:hover { color: var(--ar-on-surface); }
  .ar-nav-actions { display: flex; align-items: center; gap: 12px; }
  .ar-icon-btn { width: 40px; height: 40px; border-radius: 999px; border: 1px solid var(--ar-outline-variant); background: transparent; color: var(--ar-on-surface); display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none; transition: background 0.2s ease, color 0.2s ease; }
  .ar-icon-btn:hover { background: var(--ar-surface-low); }
  [data-theme='dark'] .ar-icon-btn { background: #202226; }
  [data-theme='dark'] .ar-icon-btn:hover { background: #2a2e33; }
  .ar-main { padding: 64px 0 96px; }
  .ar-shell { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
  .ar-quiz { background: var(--ar-surface); border: 1px solid var(--ar-outline-variant); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px var(--ar-shadow); }
  .ar-progress { height: 4px; background: var(--ar-surface-container); }
  .ar-progress-bar { height: 100%; background: var(--ar-primary); transition: width 0.4s ease; }
  .ar-quiz-body { padding: 40px; }
  .ar-quiz-head { text-align: center; margin-bottom: 32px; }
  .ar-quiz-step { display: inline-block; font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--ar-secondary); margin-bottom: 12px; }
  .ar-quiz-title { font-size: 44px; font-weight: 600; margin-bottom: 12px; }
  .ar-quiz-sub { font-size: 18px; color: var(--ar-on-surface-variant); max-width: 640px; margin: 0 auto; }
  .ar-options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }
  .ar-option { border: 1px solid var(--ar-outline-variant); border-radius: 16px; padding: 24px; text-align: center; background: var(--ar-surface); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; }
  .ar-option:hover { border-color: var(--ar-primary); background: var(--ar-surface-low); }
  .ar-option.selected { border-color: var(--ar-primary); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); background: var(--ar-surface-low); }
  .ar-option-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--ar-surface-container); display: flex; align-items: center; justify-content: center; color: var(--ar-primary); font-weight: 600; }
  .ar-option-title { font-size: 20px; font-weight: 600; color: var(--ar-on-surface); }
  .ar-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid var(--ar-outline-variant); }
  .ar-btn-ghost { border: none; background: transparent; color: var(--ar-secondary); font-size: 14px; font-weight: 500; padding: 10px 16px; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
  .ar-btn-primary { border: none; background: var(--ar-primary); color: var(--ar-primary-contrast); font-size: 14px; font-weight: 600; padding: 12px 20px; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; }
  .ar-btn-ghost:disabled, .ar-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .ar-alert { margin: 24px 0; padding: 14px 18px; border-radius: 12px; font-size: 14px; }
  .ar-alert.error { background: rgba(186, 26, 26, 0.08); color: var(--ar-error); border: 1px solid rgba(186, 26, 26, 0.3); }
  .ar-alert.success { background: rgba(21, 127, 59, 0.1); color: var(--ar-success); border: 1px solid rgba(21, 127, 59, 0.3); }
  .ar-results { margin-top: 48px; }
  .ar-results-kicker { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ar-secondary); margin-bottom: 16px; }
  .ar-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
  .ar-card { border: 1px solid var(--ar-outline-variant); border-radius: 16px; background: var(--ar-surface); overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .ar-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px var(--ar-shadow); }
  .ar-card-media { position: relative; height: 190px; background: var(--ar-surface-low); }
  .ar-card-media img { width: 100%; height: 100%; object-fit: cover; }
  .ar-card-badge { position: absolute; top: 12px; left: 12px; background: var(--ar-surface); border: 1px solid var(--ar-outline-variant); padding: 4px 8px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
  .ar-card-fav { position: absolute; top: 12px; right: 12px; border: 1px solid var(--ar-outline-variant); background: var(--ar-surface); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .ar-card-body { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
  .ar-card-title { font-size: 18px; font-weight: 600; }
  .ar-card-price { font-size: 18px; font-weight: 600; }
  .ar-card-stars { font-size: 12px; color: var(--ar-secondary); }
  .ar-card-actions { display: flex; gap: 8px; }
  .ar-qty { width: 52px; height: 36px; border: 1px solid var(--ar-outline-variant); border-radius: 10px; text-align: center; font-size: 14px; background: var(--ar-surface); color: var(--ar-on-surface); }
  .ar-add-btn { flex: 1; height: 36px; border: none; border-radius: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; background: var(--ar-primary); color: var(--ar-primary-contrast); cursor: pointer; }
  .ar-add-btn:disabled { background: var(--ar-surface-container); color: var(--ar-on-surface-variant); cursor: not-allowed; }
  .ar-card-seller { font-size: 12px; color: var(--ar-on-surface-variant); }
  .ar-empty { padding: 48px 24px; border: 1px dashed var(--ar-outline-variant); border-radius: 16px; text-align: center; background: var(--ar-surface); }
  .ar-empty h3 { font-size: 22px; margin-bottom: 8px; }
  .ar-empty p { color: var(--ar-on-surface-variant); margin: 0; }
  .ar-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 50; }
  .ar-modal { background: var(--ar-surface); border: 1px solid var(--ar-outline-variant); border-radius: 16px; width: 100%; max-width: 520px; overflow: hidden; box-shadow: 0 24px 48px var(--ar-shadow); position: relative; }
  .ar-modal-x { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--ar-outline-variant); background: var(--ar-surface); cursor: pointer; }
  .ar-modal-img { width: 100%; height: 220px; object-fit: cover; }
  .ar-modal-noimg { height: 220px; display: flex; align-items: center; justify-content: center; background: var(--ar-surface-low); color: var(--ar-on-surface-variant); }
  .ar-modal-body { padding: 24px; display: grid; gap: 12px; }
  .ar-modal-title { font-size: 22px; font-weight: 600; }
  .ar-modal-desc { color: var(--ar-on-surface-variant); font-size: 14px; line-height: 1.6; }
  .ar-modal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .ar-modal-stat { border: 1px solid var(--ar-outline-variant); border-radius: 12px; padding: 12px; }
  .ar-modal-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ar-secondary); display: block; margin-bottom: 4px; }
  .ar-modal-val { font-size: 16px; font-weight: 600; }
  .ar-modal-seller { padding: 12px; border-radius: 12px; background: var(--ar-surface-low); }
  @media (max-width: 720px) { .ar-nav-links { display: none; } .ar-quiz-body { padding: 28px; } .ar-quiz-title { font-size: 32px; } .ar-actions { flex-direction: column; gap: 12px; align-items: stretch; } }
`;

const buildSurveySignature = (answers = {}, questions = []) => {
  const ids = questions?.length ? questions.map((q) => q.id) : Object.keys(answers).sort();
  return ids.map((id) => answers[id] ?? '').join('|');
};

const getOptionIcon = (label = '') => {
  const text = label.toLowerCase();

  // Iconos de uso/condición
  if (text.includes('nuevo')) return 'box';
  if (text.includes('usado')) return 'recycling';
  if (text.includes('reacondicion')) return 'build';
  if (text.includes('cualquiera')) return 'search';

  // Iconos de ordenamiento/filtros
  if (text.includes('menor precio') || text.includes('precio bajo')) return 'arrow_downward';
  if (text.includes('mayor calidad') || text.includes('mejor calificacion')) return 'emoji_events';
  if (text.includes('disponibilid')) return 'bar_chart';
  if (text.includes('mas reciente') || text.includes('reciente')) return 'access_time';

  // Iconos generales por categoría
  if (text.includes('trabajo') || text.includes('profesional')) return 'work';
  if (text.includes('creativ') || text.includes('arte') || text.includes('diseno')) return 'palette';
  if (text.includes('hogar') || text.includes('casa') || text.includes('casual') || text.includes('diario')) return 'home';
  if (text.includes('viaje') || text.includes('viajar')) return 'flight_takeoff';
  if (text.includes('juego') || text.includes('gaming') || text.includes('juguete') || text.includes('bebe') || text.includes('bebes')) return 'sports_esports';
  if (text.includes('libro')) return 'menu_book';
  if (text.includes('musica')) return 'music_note';
  if (text.includes('alimento') || text.includes('bebida') || text.includes('comida')) return 'restaurant';
  if (text.includes('tecnolog') || text.includes('tecnologia') || text.includes('tech')) return 'laptop';
  if (text.includes('estudio') || text.includes('academ')) return 'school';
  if (text.includes('negocio') || text.includes('empresa')) return 'business';
  if (text.includes('salud') || text.includes('bienestar')) return 'favorite';
  if (text.includes('moda') || text.includes('ropa')) return 'checkroom';
  if (text.includes('foto') || text.includes('camara')) return 'photo_camera';
  if (text.includes('audio')) return 'headphones';
  if (text.includes('deporte')) return 'fitness_center';
  if (text.includes('mascota')) return 'pets';
  if (text.includes('cocina')) return 'restaurant';
  if (text.includes('auto') || text.includes('carro')) return 'directions_car';

  // Rango de precios: sin icono específico (usa default)
  if (text.includes('$') || text.match(/\d+.*\d+/)) return 'monetization_on';

  return 'tune';
};


// ── Modal detalle ─────────────────────────────────────────────────────────────
function ProductDetailModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/products/${productId}`)
      .then(({ data }) => setProduct(data.product))
      .catch(err => setError(err.response?.data?.error || 'No encontrado'))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const stars = n => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  return (
    <div className="ar-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ar-modal">
        <button className="ar-modal-x" onClick={onClose}>✕</button>
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ar-on-surface-variant)', fontSize: '0.85rem' }}>Cargando…</div>}
        {error && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ar-error)', fontSize: '0.85rem' }}>{error}</div>}
        {!loading && !error && product && <>
          {product.imagenes?.[0]?.url
            ? <img src={product.imagenes[0].url} alt={product.titulo} className="ar-modal-img" />
            : <div className="ar-modal-noimg">Sin imagen</div>}
          <div className="ar-modal-body">
            <div className="ar-modal-title">{product.titulo}</div>
            {product.descripcion && <div className="ar-modal-desc">{product.descripcion}</div>}
            <div className="ar-modal-grid">
              <div className="ar-modal-stat">
                <span className="ar-modal-lbl">Precio</span>
                <span className="ar-modal-val">${parseFloat(product.precio).toFixed(2)}</span>
              </div>
              <div className="ar-modal-stat">
                <span className="ar-modal-lbl">Stock</span>
                <span className="ar-modal-val">{product.stock} uds.</span>
              </div>
              <div className="ar-modal-stat">
                <span className="ar-modal-lbl">Estado</span>
                <span className="ar-modal-val" style={{ textTransform: 'capitalize' }}>{product.condicion || 'nuevo'}</span>
              </div>
              <div className="ar-modal-stat">
                <span className="ar-modal-lbl">Calificación</span>
                <span className="ar-modal-val" style={{ fontSize: '0.85rem' }}>{stars(product.promedioCalificacion)}</span>
              </div>
            </div>
            {product.vendedor && (
              <div className="ar-modal-seller">
                <span className="ar-modal-lbl" style={{ display: 'block', marginBottom: '0.3rem' }}>Vendedor</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--ar-on-surface)', fontWeight: 600 }}>{product.vendedor.nombres} {product.vendedor.apellidos}</div>
                {product.vendedor.correo && <div style={{ fontSize: '0.75rem', color: 'var(--ar-on-surface-variant)', marginTop: '0.15rem' }}>{product.vendedor.correo}</div>}
              </div>
            )}
          </div>
        </>}
      </div>
    </div>
  );
}

function AssistedRecommendations() {
  // Estado de la encuesta
  const [surveyLoading, setSurveyLoading] = useState(true);
  const [surveyError, setSurveyError] = useState('');
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [surveyCurrentIndex, setSurveyCurrentIndex] = useState(0);
  const [surveyProgress, setSurveyProgress] = useState({ current: 0, total: 0 });
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [surveyDone, setSurveyDone] = useState(false);

  // Estado de las recomendaciones
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // Estado de UI
  const [favorites, setFavs] = useState([]);
  const [qtys, setQtys] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const location = useLocation();
  const { error: cartErr, success: cartOk, addToCart, setError: setCartErr } = useHybridCart();
  const submittingCompleteRef = useRef(false);

  // ── Cargar setup de encuesta (una sola llamada) ──
  const fetchSurveySetup = useCallback(async () => {
    try {
      setSurveyLoading(true);
      setSurveyError('');
      const { data } = await api.get('/recommendations/survey/setup');
      const total = data.questions?.length || data.progress?.total || 0;

      const storedCacheRaw = localStorage.getItem(SURVEY_RECO_CACHE_KEY);
      const storedCache = storedCacheRaw ? JSON.parse(storedCacheRaw) : null;
      const storedSig = storedCache?.answersSignature || '';
      const currentSig = buildSurveySignature(data.answers || {}, data.questions || []);
      const cachedRecommendations = storedSig && storedSig === currentSig
        ? storedCache?.recommendations || []
        : [];

      setSurveyQuestions(data.questions || []);
      setSurveyAnswers({});
      setSurveyCurrentIndex(0);
      setSelectedAnswer('');
      setSurveyProgress(data.progress || { current: 0, total: 0 });
      setSurveyDone(data.done || false);
      setRecommendations((data.recommendations && data.recommendations.length)
        ? data.recommendations
        : cachedRecommendations);

      // Si ya completó la encuesta previamente, cargar recomendaciones
      if (!data.done) {
        setSurveyProgress({ current: 0, total });
      }
    } catch (err) {
      setSurveyError(err.response?.data?.error || 'No se pudo cargar la encuesta');
    } finally {
      setSurveyLoading(false);
    }
  }, []);

  // ── Cargar recomendaciones ──
  const fetchRecommendations = useCallback(async () => {
    try {
      setRecommendationsLoading(true);
      setRecommendationsError('');
      const { data } = await api.get('/recommendations?limit=6');
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setRecommendationsError(err.response?.data?.error || 'No se pudieron cargar recomendaciones');
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  }, []);

  // ── Inicialización ──
  useEffect(() => {
    fetchSurveySetup();
  }, [fetchSurveySetup]);

  // ── Manejo de hash navigation ──
  useEffect(() => {
    if (location.hash === '#assist-survey') {
      setAssistOpen(true);
    }

    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [location.hash]);

  // ── Enviar respuesta de la encuesta ──
  const submitAnswer = async () => {
    const currentQuestion = surveyQuestions[surveyCurrentIndex];
    if (!currentQuestion) return;

    if (!selectedAnswer) {
      setSurveyError('Selecciona una opción para continuar');
      return;
    }

    const nextAnswers = {
      ...surveyAnswers,
      [currentQuestion.id]: selectedAnswer,
    };
    const isLastQuestion = surveyCurrentIndex + 1 >= surveyQuestions.length;

    if (!isLastQuestion) {
      setSurveyAnswers(nextAnswers);
      setSurveyCurrentIndex((idx) => idx + 1);
      setSurveyProgress({ current: surveyCurrentIndex + 1, total: surveyQuestions.length });
      setSelectedAnswer('');
      setSurveyError('');
      return;
    }

    if (submittingCompleteRef.current) return;
    submittingCompleteRef.current = true;

    try {
      setSurveyLoading(true);
      setSurveyError('');
      const { data } = await api.post('/recommendations/survey/complete', {
        answers: nextAnswers,
      });

      setSurveyAnswers(nextAnswers);
      setSelectedAnswer('');
      setSurveyProgress(data.progress || { current: 0, total: 0 });
      setSurveyDone(data.done || false);
      setRecommendations(data.recommendations || []);

      const signature = buildSurveySignature(nextAnswers, surveyQuestions);
      localStorage.setItem(SURVEY_RECO_CACHE_KEY, JSON.stringify({
        answersSignature: signature,
        answers: nextAnswers,
        recommendations: data.recommendations || [],
        savedAt: new Date().toISOString(),
      }));

    } catch (err) {
      setSurveyError(err.response?.data?.error || 'No se pudo guardar la respuesta');
    } finally {
      submittingCompleteRef.current = false;
      setSurveyLoading(false);
    }
  };

  // ── Reiniciar encuesta ──
  const resetSurvey = async () => {
    try {
      setSurveyLoading(true);
      setSurveyError('');
      await api.post('/recommendations/survey/reset');
      localStorage.removeItem(SURVEY_RECO_CACHE_KEY);
      setSurveyAnswers({});
      setSurveyQuestions([]);
      setSurveyCurrentIndex(0);
      setSurveyDone(false);
      setSelectedAnswer('');
      setRecommendations([]);
      await fetchSurveySetup();
    } catch (err) {
      setSurveyError(err.response?.data?.error || 'No se pudo reiniciar la encuesta');
    } finally {
      setSurveyLoading(false);
    }
  };

  // ── Agregar al carrito ──
  const doAddToCart = (p, e) => {
    e.stopPropagation();
    const qty = Number(qtys[p.producto?.id || p.id] || 1);

    if (!Number.isInteger(qty) || qty < 1) {
      setCartErr('Cantidad inválida');
      return;
    }

    const productData = p.producto || p;
    addToCart(productData.id, qty, {
      name: productData.titulo,
      price: productData.precio
    });

    setQtys(prev => ({ ...prev, [productData.id]: 1 }));
  };

  // ── Toggle favorito ──
  const toggleFav = (id) => {
    setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };

  // ── Renderizar estrellas ──
  const stars = n => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));
  const activeQuestion = surveyQuestions[surveyCurrentIndex] || null;
  const questionNumber = surveyDone
    ? surveyProgress.total
    : Math.min(surveyCurrentIndex + 1, surveyQuestions.length || 1);
  const progressPercent = surveyProgress.total
    ? Math.round((questionNumber / surveyProgress.total) * 100)
    : 0;
  const isLastQuestion = surveyCurrentIndex + 1 >= surveyQuestions.length;

  const goBack = () => {
    if (surveyCurrentIndex === 0) return;
    const prevIndex = surveyCurrentIndex - 1;
    const prevQuestion = surveyQuestions[prevIndex];
    setSurveyCurrentIndex(prevIndex);
    setSelectedAnswer(prevQuestion ? (surveyAnswers[prevQuestion.id] || '') : '');
    setSurveyError('');
    setSurveyProgress({ current: prevIndex, total: surveyQuestions.length });
  };

  return (
    <div className="ar-root">
      <style>{STYLES}</style>
      <AssistedTopBar active="recomendados" />
      <main className="ar-main">
        <div className="ar-shell">
          <section className="ar-quiz" id="assist-survey">
            <div className="ar-progress">
              <div className="ar-progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="ar-quiz-body">
              <div className="ar-quiz-head">
                <span className="ar-quiz-step">Paso {questionNumber} / {surveyProgress.total || 0}</span>
                <h1 className="ar-quiz-title">{activeQuestion?.title || 'Cargando encuesta'}</h1>
                <p className="ar-quiz-sub">Selecciona la opcion que mejor se ajuste a tus preferencias.</p>
              </div>

              {surveyLoading && (
                <div className="ar-alert">Cargando encuesta...</div>
              )}

              {surveyError && (
                <div className="ar-alert error">{surveyError}</div>
              )}

              {!surveyLoading && surveyDone && (
                <div className="ar-empty">
                  <h3>Encuesta completada</h3>
                  <p>Tus recomendaciones estan listas para revisar.</p>
                  <div style={{ marginTop: '16px' }}>
                    <button className="ar-btn-primary" onClick={resetSurvey}>
                      Reiniciar encuesta
                    </button>
                  </div>
                </div>
              )}

              {!surveyLoading && !surveyDone && activeQuestion && (
                <>
                  <div className="ar-options-grid">
                    {activeQuestion?.options?.map((opt, idx) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`ar-option${selectedAnswer === opt.value ? ' selected' : ''}`}
                        onClick={() => {
                          setSelectedAnswer(opt.value);
                          setSurveyError('');
                        }}
                        aria-pressed={selectedAnswer === opt.value}
                      >
                        <div className="ar-option-icon">
                          <span className="ar-icon">{getOptionIcon(opt.label)}</span>
                        </div>
                        <div className="ar-option-title">{opt.label}</div>
                      </button>
                    ))}
                  </div>

                  <div className="ar-actions">
                    <button
                      className="ar-btn-ghost"
                      onClick={goBack}
                      disabled={surveyCurrentIndex === 0 || surveyLoading}
                    >
                      <span className="ar-icon">arrow_back</span>
                      Volver
                    </button>
                    <button
                      className="ar-btn-primary"
                      onClick={submitAnswer}
                      disabled={!selectedAnswer || surveyLoading}
                    >
                      {isLastQuestion ? 'Finalizar encuesta' : 'Siguiente pregunta'}
                      <span className="ar-icon">arrow_forward</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>

          {cartErr && <div className="ar-alert error">{cartErr}</div>}
          {cartOk && <div className="ar-alert success">{cartOk}</div>}

          <section className="ar-results" id="assist-results">
            {recommendationsLoading ? (
              <div className="ar-alert">Calculando recomendaciones...</div>
            ) : recommendationsError ? (
              <div className="ar-alert error">{recommendationsError}</div>
            ) : !surveyDone ? (
              <div className="ar-empty">
                <h3>Completa la encuesta</h3>
                <p>Responde las preguntas para ver recomendaciones personalizadas.</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="ar-empty">
                <h3>Sin recomendaciones disponibles</h3>
                <p>No encontramos productos que coincidan con tus respuestas.</p>
                <div style={{ marginTop: '16px' }}>
                  <button className="ar-btn-primary" onClick={resetSurvey}>Reiniciar encuesta</button>
                </div>
              </div>
            ) : (
              <>
                <div className="ar-results-kicker">Productos recomendados segun tu encuesta</div>
                <div className="ar-grid">
                  {recommendations.map(rec => {
                    const p = rec.producto;
                    return (
                      <article
                        key={p.id}
                        className="ar-card"
                        onClick={() => setSelectedId(p.id)}
                      >
                        <div className="ar-card-media">
                          <img
                            src={p.imagenes?.[0]?.url || `https://via.placeholder.com/300/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`}
                            alt={p.titulo}
                            onError={e => {
                              e.target.src = `https://via.placeholder.com/300/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`;
                            }}
                          />
                          <span className="ar-card-badge">{p.condicion || 'NUEVO'}</span>
                          <button
                            className="ar-card-fav"
                            onClick={e => {
                              e.stopPropagation();
                              toggleFav(p.id);
                            }}
                          >
                            {favorites.includes(p.id) ? '❤️' : '♡'}
                          </button>
                        </div>
                        <div className="ar-card-body">
                          <div className="ar-card-title">{p.titulo}</div>
                          <div className="ar-card-price">${(parseFloat(p.precio) || 0).toFixed(2)}</div>
                          <div className="ar-card-stars">{stars(p.promedioCalificacion)}</div>
                          <div className="ar-card-actions" onClick={e => e.stopPropagation()}>
                            <input
                              type="number"
                              min="1"
                              className="ar-qty"
                              value={qtys[p.id] || 1}
                              onChange={e => setQtys(prev => ({
                                ...prev,
                                [p.id]: e.target.value,
                              }))}
                            />
                            <button
                              className="ar-add-btn"
                              disabled={p.stock === 0}
                              onClick={e => doAddToCart(rec, e)}
                            >
                              {p.stock === 0 ? 'Agotado' : '+ Agregar'}
                            </button>
                          </div>
                          <div className="ar-card-seller">{p.vendedor?.nombres} {p.vendedor?.apellidos}</div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {selectedId && (
        <ProductDetailModal
          productId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}


export default AssistedRecommendations;

