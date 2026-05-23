import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useHybridCart } from '../hooks/useHybridCart';
import { useTheme } from '../context/ThemeContext';
import AssistedTopBar from '../components/assisted/AssistedTopBar';
import './SellerProfile.css';

// Colores para avatares de iniciales
const AVATAR_COLORS = [
  { bg: '#F0F4FF', color: '#3B5BDB' },
  { bg: '#FFF0F6', color: '#C2255C' },
  { bg: '#F3FCF0', color: '#2F9E44' },
  { bg: '#FFF9DB', color: '#E67700' },
  { bg: '#F8F0FC', color: '#7950F2' },
  { bg: '#E8FAF0', color: '#0CA678' },
];

function getAvatarColor(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(nombres = '', apellidos = '') {
  return `${(nombres[0] || '').toUpperCase()}${(apellidos[0] || '').toUpperCase()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });
}

export default function SellerProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0, recentReviews: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qtys, setQtys] = useState({});

  const token = localStorage.getItem('token');
  const { cart, error: cartErr, success: cartOk, addToCart, setError: setCartErr } = useHybridCart();

  const stars = n => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  useEffect(() => {
    if (!sellerId) return;
    setLoading(true);
    api.get(`/products/seller/${sellerId}`)
      .then(({ data }) => {
        setSeller(data.seller);
        setProducts(data.products || []);
        setReviewSummary(data.reviewSummary || data.seller?.reviewSummary || { averageRating: 0, totalReviews: 0, recentReviews: [] });
      })
      .catch(err => setError(err.response?.data?.error || 'No se pudo cargar el perfil del vendedor'))
      .finally(() => setLoading(false));
  }, [sellerId]);

  const doAddToCart = (p, e) => {
    e.stopPropagation();
    const qty = Number(qtys[p.id] || 1);
    if (!Number.isInteger(qty) || qty < 1) { setCartErr('Cantidad inválida'); return; }
    addToCart(p.id, qty, { name: p.titulo, price: p.precio });
    setQtys(prev => ({ ...prev, [p.id]: 1 }));
  };

  // --- LOADING ---
  if (loading) return (
    <div className="sp-root" data-theme={theme}>
      <AssistedTopBar active="tienda" />
      <div className="sp-skel-hero">
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
          <div className="sp-skel-circle" />
          <div style={{ flex: 1 }}>
            <div className="sp-skel-line" style={{ width: '30%' }} />
            <div className="sp-skel-line" style={{ width: '55%', height: 32 }} />
            <div className="sp-skel-line" style={{ width: '40%' }} />
          </div>
        </div>
      </div>
      <div className="sp-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 0, borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ aspectRatio: '1', background: 'linear-gradient(90deg, var(--cream-dark) 25%, var(--cream) 50%, var(--cream-dark) 75%)', backgroundSize: '200% 100%', animation: 'sp-shim 1.4s infinite' }} />
              <div style={{ padding: '1rem' }}>
                <div className="sp-skel-line" style={{ width: '75%' }} />
                <div className="sp-skel-line" style={{ width: '45%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- ERROR ---
  if (error) return (
    <div className="sp-root" data-theme={theme}>
      <AssistedTopBar active="tienda" />
      <div className="sp-error-wrap">
        <div className="sp-error-title">Vendedor no encontrado</div>
        <p className="sp-error-text">{error}</p>
        <button onClick={() => navigate('/')} className="sp-error-btn">
          Ir al inicio →
        </button>
      </div>
    </div>
  );

  const initials = getInitials(seller?.nombres, seller?.apellidos);
  const avatarColor = getAvatarColor(seller?.nombres || '');

  return (
    <div className="sp-root" data-theme={theme}>

      <AssistedTopBar active="tienda" />

      {/* HERO DEL VENDEDOR */}
      <section className="sp-hero">
        <div className="sp-hero-inner">

          {/* Avatar */}
          <div className="sp-avatar-wrap">
            <div className="sp-avatar">
              {seller?.fotoPerfil ? (
                <img src={seller.fotoPerfil} alt={seller.nombres} />
              ) : (
                <div
                  className="sp-avatar-initials"
                  style={{ background: avatarColor.bg, color: avatarColor.color }}
                >
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="sp-info">
            <div className="sp-eyebrow">Perfil de vendedor</div>
            <div className="sp-seller-name">
              {seller?.nombres} {seller?.apellidos}
            </div>
            <div className="sp-meta">
              <div className="sp-meta-item">
                ⌨  Miembro desde <strong style={{ marginLeft: 4 }}>{formatDate(seller?.creadoEn)}</strong>
              </div>
              <div className="sp-meta-item">
                ✔ <strong style={{ marginLeft: 4 }}>{products.length}</strong>&nbsp;productos activos
              </div>
            </div>

            {/* Stats */}
            <div className="sp-stats">
              <div className="sp-stat">
                <span className="sp-stat-val">{products.length}</span>
                <span className="sp-stat-lbl">Publicaciones</span>
              </div>
              <div className="sp-stat">
                <span className="sp-stat-val">
                  {reviewSummary.totalReviews > 0 ? reviewSummary.averageRating.toFixed(1) : '—'}
                </span>
                <span className="sp-stat-lbl">Cal. promedio</span>
              </div>
              <div className="sp-stat">
                <span className="sp-stat-val">
                  {reviewSummary.totalReviews}
                </span>
                <span className="sp-stat-lbl">Reseñas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="sp-section">
        <div className="sp-section-head">
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: '0.4rem' }}>
              Catálogo
            </div>
            <div className="sp-section-title">Productos del vendedor</div>
          </div>
          <div className="sp-count">{products.length} resultado{products.length !== 1 ? 's' : ''}</div>
        </div>

        {cartErr && <div className="sp-alert-err">{cartErr}</div>}
        {cartOk && <div className="sp-alert-ok">{cartOk}</div>}

        {products.length === 0 ? (
          <div className="sp-empty">
            <div className="sp-empty-title">Sin productos por ahora</div>
            <p className="sp-empty-txt">Este vendedor aún no tiene productos publicados.</p>
          </div>
        ) : (
          <div className="sp-pgrid">
            {products.map(p => (
              <div key={p.id} className="sp-pcard">
                <div className="sp-pcard-img">
                  <img
                    src={p.imagenes?.[0]?.url || `https://via.placeholder.com/300/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`}
                    alt={p.titulo}
                    onError={e => { e.target.src = `https://via.placeholder.com/300/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`; }}
                  />
                  <span className="sp-pcard-badge">{p.condicion || 'NUEVO'}</span>
                </div>
                <div className="sp-pcard-body">
                  <div className="sp-pcard-name">{p.titulo}</div>
                  <div className="sp-pcard-price">${(parseFloat(p.precio) || 0).toFixed(2)}</div>
                  <div className="sp-pcard-stars">{stars(p.promedioCalificacion)}</div>
                  <div className="sp-pcard-add-row" onClick={e => e.stopPropagation()}>
                    <input
                      type="number" min="1" className="sp-qty"
                      value={qtys[p.id] || 1}
                      onChange={e => setQtys(prev => ({ ...prev, [p.id]: e.target.value }))}
                    />
                    <button
                      className={`sp-add-btn ${p.stock === 0 ? 'out' : 'ok'}`}
                      disabled={p.stock === 0}
                      onClick={e => doAddToCart(p, e)}
                    >
                      {p.stock === 0 ? 'Agotado' : '+ Agregar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="sp-section">
        <div className="sp-section-head">
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: '0.4rem' }}>
              Opiniones
            </div>
            <div className="sp-section-title">Reseñas de compradores</div>
          </div>
          <div className="sp-count">{reviewSummary.totalReviews} reseña{reviewSummary.totalReviews !== 1 ? 's' : ''}</div>
        </div>

        <div className="sp-review-section">
          <div className="sp-review-head">
            <div>
              <div className="sp-review-sub">
                {reviewSummary.totalReviews > 0
                  ? 'Comentarios recientes sobre la experiencia de compra.'
                  : 'Aún no hay reseñas para este vendedor.'}
              </div>
            </div>
            {reviewSummary.totalReviews > 0 && (
              <div style={{ color: 'var(--amber)', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                {stars(reviewSummary.averageRating)}
              </div>
            )}
          </div>

          {reviewSummary.recentReviews?.length > 0 ? (
            <div className="sp-review-list">
              {reviewSummary.recentReviews.map((review) => (
                <div key={review.id} className="sp-review-card">
                  <div className="sp-review-row">
                    <div className="sp-review-name">{review.reviewerName}</div>
                    <div className="sp-review-date">{new Date(review.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </div>
                  <div className="sp-review-stars">{stars(review.rating)}</div>
                  <div className="sp-review-comment">{review.comment || 'Sin comentario'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sp-review-empty">Todavía no hay comentarios visibles para este vendedor.</div>
          )}
        </div>
      </section>
    </div>
  );
}