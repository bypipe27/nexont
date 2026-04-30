import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/api';
import { useHybridCart } from '../hooks/useHybridCart';

const ASSISTED_STYLESHEET = `@import url('/styles/assisted-recommendations-styles.css');`;


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
    <div className="nx-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nx-modal">
        <button className="nx-modal-x" onClick={onClose}>✕</button>
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-ghost)', fontSize: '0.85rem' }}>Cargando…</div>}
        {error   && <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626', fontSize: '0.85rem' }}>{error}</div>}
        {!loading && !error && product && <>
          {product.imagenes?.[0]?.url
            ? <img src={product.imagenes[0].url} alt={product.titulo} className="nx-modal-img" />
            : <div className="nx-modal-noimg">Sin imagen</div>}
          <div className="nx-modal-body">
            <div className="nx-modal-title">{product.titulo}</div>
            {product.descripcion && <div className="nx-modal-desc">{product.descripcion}</div>}
            <div className="nx-modal-grid">
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Precio</span>
                <span className="nx-ms-val" style={{ color: 'var(--amber)' }}>${parseFloat(product.precio).toFixed(2)}</span>
              </div>
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Stock</span>
                <span className="nx-ms-val">{product.stock} uds.</span>
              </div>
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Estado</span>
                <span className="nx-ms-val" style={{ textTransform: 'capitalize' }}>{product.condicion || 'nuevo'}</span>
              </div>
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Calificación</span>
                <span className="nx-ms-val" style={{ fontSize: '0.85rem', color: 'var(--amber)' }}>{stars(product.promedioCalificacion)}</span>
              </div>
            </div>
            {product.vendedor && (
              <div className="nx-modal-seller">
                <span className="nx-ms-lbl" style={{ display: 'block', marginBottom: '0.3rem' }}>Vendedor</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--ink)', fontWeight: 500 }}>{product.vendedor.nombres} {product.vendedor.apellidos}</div>
                {product.vendedor.correo && <div style={{ fontSize: '0.75rem', color: 'var(--ink-ghost)', marginTop: '0.15rem' }}>{product.vendedor.correo}</div>}
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
  const [assistOpen, setAssistOpen] = useState(true);

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

      setSurveyQuestions(data.questions || []);
      setSurveyAnswers({});
      setSurveyCurrentIndex(0);
      setSelectedAnswer('');
      setSurveyProgress(data.progress || { current: 0, total: 0 });
      setSurveyDone(data.done || false);
      setRecommendations(data.recommendations || []);

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

  return (
    <div className="nx-root">
      <style>{ASSISTED_STYLESHEET}</style>
      <nav className="nx-nav">
        <Link to="/" className="nx-nav-brand">
          <img src="/resources/icon.png" alt="Nexont" />
          <span className="nx-nav-wordmark">Nexont</span>
        </Link>
        <div className="nx-nav-gap" />
        <Link to="/" className="nx-btn-outline" style={{ height: 38, fontSize: '0.75rem' }}>
          Volver al inicio
        </Link>
      </nav>

      <section className="nx-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="nx-section-head">
          <div>
            <span className="nx-section-eyebrow">Compra asistida</span>
            <h2 className="nx-section-title">Encuesta y recomendaciones</h2>
          </div>
          {surveyDone && (
            <button 
              className="nx-section-link" 
              onClick={() => document.getElementById('assist-results')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver resultados →
            </button>
          )}
        </div>

        {/* ── ENCUESTA ── */}
        <div id="assist-survey" className="nx-assist-wrap">
          <div className="nx-assist-head">
            <div className="nx-assist-meta">
              Pregunta {questionNumber} de {surveyProgress.total || 0} ({surveyProgress.total || 0} preguntas)
            </div>
            <button 
              className="nx-assist-btn" 
              onClick={() => setAssistOpen(v => !v)}
            >
              {surveyDone ? 'Encuesta completada ✓' : 'Encuesta para compra asistida'}
            </button>
          </div>

          {assistOpen && (
            <div className="nx-assist-form">
              {surveyLoading && (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: 'var(--ink-ghost)', 
                  fontSize: '0.85rem' 
                }}>
                  Cargando encuesta…
                </div>
              )}

              {surveyError && (
                <div className="nx-alert-err" style={{ marginBottom: '1rem' }}>
                  {surveyError}
                </div>
              )}

              {!surveyLoading && surveyDone && (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  background: 'var(--bg-soft)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                  <div style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 500, 
                    color: 'var(--ink)', 
                    marginBottom: '0.5rem' 
                  }}>
                    ¡Encuesta completada!
                  </div>
                  <div style={{ 
                    fontSize: '0.82rem', 
                    color: 'var(--ink-soft)', 
                    marginBottom: '1.5rem' 
                  }}>
                    Tus recomendaciones están listas
                  </div>
                  <button 
                    className="nx-btn-outline" 
                    onClick={resetSurvey}
                    style={{ fontSize: '0.8rem' }}
                  >
                    Reiniciar encuesta
                  </button>
                </div>
              )}

              {!surveyLoading && !surveyDone && activeQuestion && (
                <>
                  <div className="nx-assist-field full">
                    <label>
                      {questionNumber}. {activeQuestion?.title}
                    </label>
                    <select 
                      value={selectedAnswer} 
                      onChange={e => {
                        setSelectedAnswer(e.target.value);
                        setSurveyError('');
                      }}
                    >
                      <option value="">Selecciona una opción</option>
                      {activeQuestion?.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="nx-assist-actions">
                    <button 
                      className="nx-btn-primary" 
                      onClick={submitAnswer}
                      disabled={!selectedAnswer || surveyLoading}
                    >
                      {surveyCurrentIndex + 1 === surveyQuestions.length
                        ? 'Finalizar encuesta →' 
                        : 'Siguiente pregunta →'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── ALERTAS ── */}
        {cartErr && (
          <div className="nx-alert-err" style={{ marginBottom: '1rem' }}>
            {cartErr}
          </div>
        )}
        {cartOk && (
          <div className="nx-alert-ok" style={{ marginBottom: '1rem' }}>
            {cartOk}
          </div>
        )}

        {/* ── RESULTADOS ── */}
        <div id="assist-results" style={{ marginTop: '2rem' }}>
          {recommendationsLoading ? (
            <div style={{ 
              padding: '3rem', 
              textAlign: 'center', 
              color: 'var(--ink-ghost)', 
              fontSize: '0.78rem', 
              letterSpacing: '0.12em', 
              textTransform: 'uppercase' 
            }}>
              Calculando recomendaciones…
            </div>
          ) : recommendationsError ? (
            <div className="nx-alert-err">
              {recommendationsError}
            </div>
          ) : !surveyDone ? (
            <div className="nx-empty">
              <div className="nx-empty-title">Completa la encuesta</div>
              <p className="nx-empty-txt">
                Responde las preguntas de arriba para recibir recomendaciones personalizadas.
              </p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="nx-empty">
              <div className="nx-empty-title">Sin recomendaciones disponibles</div>
              <p className="nx-empty-txt">
                No encontramos productos que coincidan con tus preferencias. 
                Intenta ajustar tus respuestas.
              </p>
              <button 
                className="nx-btn-outline" 
                onClick={resetSurvey}
                style={{ marginTop: '1rem' }}
              >
                Reiniciar encuesta
              </button>
            </div>
          ) : (
            <>
              <div style={{ 
                fontSize: '0.72rem', 
                color: 'var(--ink-soft)', 
                marginBottom: '1rem', 
                letterSpacing: '0.08em', 
                textTransform: 'uppercase' 
              }}>
                Productos recomendados según tu encuesta
              </div>

              <div 
                className="nx-pgrid" 
                style={{ 
                  borderTop: '1px solid var(--border)', 
                  borderLeft: '1px solid var(--border)' 
                }}
              >
                {recommendations.map(rec => {
                  const p = rec.producto;
                  return (
                    <div 
                      key={p.id} 
                      className="nx-pcard" 
                      onClick={() => setSelectedId(p.id)}
                    >
                      <div className="nx-pcard-img">
                        <img
                          src={p.imagenes?.[0]?.url || `https://via.placeholder.com/300/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`}
                          alt={p.titulo}
                          onError={e => { 
                            e.target.src = `https://via.placeholder.com/300/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`; 
                          }}
                        />
                        <span className="nx-pcard-badge">
                          {p.condicion || 'NUEVO'}
                        </span>
                        <button 
                          className="nx-fav" 
                          onClick={e => { 
                            e.stopPropagation(); 
                            toggleFav(p.id); 
                          }}
                        >
                          {favorites.includes(p.id) ? '❤️' : '♡'}
                        </button>
                      </div>

                      <div className="nx-pcard-body">
                        <div className="nx-pcard-name">{p.titulo}</div>
                        
                        {rec.razon && (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            color: 'var(--ink-soft)', 
                            marginBottom: '0.5rem',
                            fontStyle: 'italic'
                          }}>
                            {rec.razon}
                          </div>
                        )}

                        <div className="nx-pcard-price">
                          ${(parseFloat(p.precio) || 0).toFixed(2)}
                        </div>
                        
                        <div className="nx-pcard-stars">
                          {stars(p.promedioCalificacion)}
                        </div>

                        <div 
                          className="nx-pcard-add-row" 
                          onClick={e => e.stopPropagation()}
                        >
                          <input 
                            type="number" 
                            min="1" 
                            className="nx-qty" 
                            value={qtys[p.id] || 1} 
                            onChange={e => setQtys(prev => ({ 
                              ...prev, 
                              [p.id]: e.target.value 
                            }))} 
                          />
                          <button 
                            className={`nx-add-btn ${p.stock === 0 ? 'out' : 'ok'}`} 
                            disabled={p.stock === 0} 
                            onClick={e => doAddToCart(rec, e)}
                          >
                            {p.stock === 0 ? 'Agotado' : '+ Agregar'}
                          </button>
                        </div>

                        <div className="nx-pcard-seller">
                          {p.vendedor?.nombres} {p.vendedor?.apellidos}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

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

