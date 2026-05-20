import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useHybridCart } from '../hooks/useHybridCart';
import { useTheme } from '../context/ThemeContext';
import AssistedTopBar from '../components/assisted/AssistedTopBar';

const SELLER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;0,700;1,200;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sp-root {
    min-height: 100vh;
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
  }

  /* NAV */
  .sp-nav {
    position: sticky; top: 0; z-index: 200;
    height: 68px;
    background: rgba(245,240,232,0.94);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 3rem; gap: 1.5rem;
  }
  [data-theme="dark"] .sp-nav {
    background: rgba(14,12,10,0.94);
  }
  .sp-nav-brand {
    display: flex; align-items: center; gap: 0.75rem;
    text-decoration: none; flex-shrink: 0;
  }
  .sp-nav-brand img { height: 28px; }
  .sp-nav-wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem; font-weight: 600;
    color: var(--ink); letter-spacing: 0.06em;
  }
  .sp-nav-back {
    display: flex; align-items: center; gap: 0.4rem;
    height: 36px; padding: 0 1rem;
    background: transparent; border: 1px solid var(--border);
    color: var(--ink-soft); font-size: 0.75rem;
    font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; cursor: pointer;
    transition: all 0.18s; font-family: 'DM Sans', sans-serif;
    text-decoration: none;
  }
  .sp-nav-back:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }

  /* SELLER HERO */
  .sp-hero {
    border-bottom: 1px solid var(--border);
    padding: 3.5rem 3rem;
    background: var(--cream-dark);
  }
  .sp-hero-inner {
    max-width: 860px;
    display: flex; align-items: flex-start; gap: 2.5rem;
    flex-wrap: wrap;
  }

  /* AVATAR */
  .sp-avatar-wrap { flex-shrink: 0; }
  .sp-avatar {
    width: 88px; height: 88px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem; font-weight: 400;
    border: 2px solid var(--border);
    overflow: hidden; flex-shrink: 0;
  }
  .sp-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .sp-avatar-initials {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem;
  }

  /* SELLER INFO */
  .sp-info { flex: 1; }
  .sp-eyebrow {
    font-size: 0.6rem; font-weight: 600; letter-spacing: 0.25em;
    text-transform: uppercase; color: var(--ink-soft);
    margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.6rem;
  }
  .sp-eyebrow::before {
    content: ''; display: block; width: 24px; height: 1px; background: var(--ink-soft);
  }
  .sp-seller-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.8rem; font-weight: 200;
    color: var(--ink); line-height: 1.05;
    letter-spacing: -0.02em; margin-bottom: 1rem;
  }
  .sp-meta {
    display: flex; gap: 2rem; flex-wrap: wrap;
  }
  .sp-meta-item {
    display: flex; align-items: center; gap: 0.45rem;
    font-size: 0.78rem; color: var(--ink-soft);
  }
  .sp-meta-item strong { color: var(--ink); font-weight: 600; }

  /* STATS BAR */
  .sp-stats {
    display: flex; gap: 0;
    border: 1px solid var(--border);
    margin-top: 2rem; max-width: 460px;
    background: var(--white);
  }
  .sp-stat {
    flex: 1; padding: 1rem 1.25rem;
    border-right: 1px solid var(--border);
  }
  .sp-stat:last-child { border-right: none; }
  .sp-stat-val {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem; font-weight: 200; color: var(--ink);
    display: block; line-height: 1; margin-bottom: 0.25rem;
  }
  .sp-stat-lbl {
    font-size: 0.58rem; color: var(--ink-ghost);
    text-transform: uppercase; letter-spacing: 0.14em; display: block;
  }

  .sp-review-section {
    margin-top: 1.5rem;
    border: 1px solid var(--border);
    background: var(--white);
    padding: 1.25rem;
  }
  .sp-review-head {
    display: flex; justify-content: space-between; align-items: flex-end;
    gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;
  }
  .sp-review-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.35rem; font-weight: 300; color: var(--ink);
  }
  .sp-review-sub { font-size: 0.72rem; color: var(--ink-soft); }
  .sp-review-list { display: grid; gap: 0.75rem; }
  .sp-review-card {
    padding: 0.95rem 1rem;
    border: 1px solid var(--border);
    background: var(--cream);
  }
  .sp-review-row { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 0.35rem; flex-wrap: wrap; }
  .sp-review-name { font-size: 0.82rem; font-weight: 600; color: var(--ink); }
  .sp-review-date { font-size: 0.68rem; color: var(--ink-ghost); text-transform: uppercase; letter-spacing: 0.12em; }
  .sp-review-stars { color: var(--amber); font-size: 0.72rem; margin-bottom: 0.45rem; }
  .sp-review-comment { font-size: 0.84rem; color: var(--ink-mid); line-height: 1.75; }
  .sp-review-empty { font-size: 0.85rem; color: var(--ink-soft); line-height: 1.8; }

  /* PRODUCTS SECTION */
  .sp-section { padding: 3rem; }
  .sp-section-head {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 2.5rem; padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--border);
  }
  .sp-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem; font-weight: 200; color: var(--ink);
    letter-spacing: -0.01em;
  }
  .sp-count {
    font-size: 0.75rem; color: var(--ink-ghost); letter-spacing: 0.06em;
  }

  /* PRODUCT GRID */
  .sp-pgrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 0;
    border-top: 1px solid var(--border);
    border-left: 1px solid var(--border);
  }
  .sp-pcard {
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background 0.15s;
    display: flex; flex-direction: column;
  }
  .sp-pcard:hover { background: var(--cream-dark); }
  .sp-pcard-img {
    aspect-ratio: 1; overflow: hidden;
    background: var(--cream-dark); position: relative;
  }
  .sp-pcard-img img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.5s;
  }
  .sp-pcard:hover .sp-pcard-img img { transform: scale(1.05); }
  .sp-pcard-badge {
    position: absolute; top: 0.6rem; left: 0.6rem;
    background: var(--white); color: var(--ink);
    font-size: 0.52rem; font-weight: 600; letter-spacing: 0.14em;
    text-transform: uppercase; padding: 0.2rem 0.5rem;
    border: 1px solid var(--border);
  }
  .sp-pcard-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; }
  .sp-pcard-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.05rem; font-weight: 300; color: var(--ink);
    margin-bottom: 0.25rem; line-height: 1.25;
  }
  .sp-pcard-price {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.2rem; font-weight: 300; color: var(--amber);
    margin-bottom: 0.35rem;
  }
  .sp-pcard-stars { color: var(--amber); font-size: 0.65rem; margin-bottom: 0.6rem; }
  .sp-pcard-add-row { display: flex; gap: 0.3rem; }
  .sp-qty {
    width: 44px; height: 30px; text-align: center;
    background: var(--white); border: 1px solid var(--border);
    color: var(--ink); font-size: 0.78rem; outline: none;
    font-family: 'DM Sans', sans-serif;
  }
  .sp-add-btn {
    flex: 1; height: 30px; border: none;
    font-size: 0.65rem; font-weight: 500; cursor: pointer;
    letter-spacing: 0.1em; text-transform: uppercase;
    font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .sp-add-btn.ok { background: var(--ink); color: var(--cream); }
  .sp-add-btn.ok:hover { background: var(--ink-mid); }
  .sp-add-btn.out { background: var(--cream-dark); color: var(--ink-ghost); cursor: not-allowed; }

  /* EMPTY */
  .sp-empty {
    padding: 4rem 2rem; text-align: center;
    border: 1px solid var(--border);
  }
  .sp-empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.8rem; font-weight: 200; color: var(--ink);
    margin-bottom: 0.6rem;
  }
  .sp-empty-txt { font-size: 0.85rem; color: var(--ink-soft); line-height: 1.8; }

  /* ALERTS */
  .sp-alert-err { background: #FEF2F2; border: 1px solid #FCA5A5; padding: 0.7rem 1rem; margin-bottom: 1rem; color: #DC2626; font-size: 0.82rem; }
  .sp-alert-ok  { background: #F0FDF4; border: 1px solid #86EFAC; padding: 0.7rem 1rem; margin-bottom: 1rem; color: #16A34A; font-size: 0.82rem; }

  /* LOADING SKELETON */
  .sp-skel-hero { padding: 3.5rem 3rem; border-bottom: 1px solid var(--border); background: var(--cream-dark); }
  .sp-skel-line {
    height: 12px; border-radius: 0; margin-bottom: 0.75rem;
    background: linear-gradient(90deg, var(--cream-dark) 25%, var(--cream) 50%, var(--cream-dark) 75%);
    background-size: 200% 100%; animation: sp-shim 1.4s infinite;
  }
  .sp-skel-circle {
    width: 88px; height: 88px; border-radius: 50%;
    background: linear-gradient(90deg, var(--cream-dark) 25%, var(--cream) 50%, var(--cream-dark) 75%);
    background-size: 200% 100%; animation: sp-shim 1.4s infinite;
    flex-shrink: 0;
  }
  @keyframes sp-shim { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

  @media (max-width: 768px) {
    .sp-hero { padding: 2.5rem 1.5rem; }
    .sp-section { padding: 2rem 1.5rem; }
    .sp-nav { padding: 0 1.5rem; }
    .sp-seller-name { font-size: 2rem; }
    .sp-pgrid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  }
`;

// Inyectar estilos una sola vez
if (!document.getElementById('sp-styles')) {
  const el = document.createElement('style');
  el.id = 'sp-styles';
  el.textContent = SELLER_STYLES;
  document.head.appendChild(el);
}

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
      <nav className="sp-nav">
        <Link to="/" className="sp-nav-brand">
          <img src="/resources/icon.png" alt="Nexont" />
          <span className="sp-nav-wordmark">Nexont</span>
        </Link>
        <button className="sp-nav-back" onClick={() => navigate(-1)}>← Volver</button>
      </nav>
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
      <nav className="sp-nav">
        <Link to="/" className="sp-nav-brand">
          <img src="/resources/icon.png" alt="Nexont" />
          <span className="sp-nav-wordmark">Nexont</span>
        </Link>
        <button className="sp-nav-back" onClick={() => navigate(-1)}>← Volver</button>
      </nav>
      <div style={{ padding: '4rem 3rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 200, color: 'var(--ink)', marginBottom: '0.75rem' }}>Vendedor no encontrado</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '2rem' }}>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--ink)', color: 'var(--cream)', border: 'none', padding: '0 2rem', height: '44px', cursor: 'pointer', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}
        >
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

            <div className="sp-review-section">
              <div className="sp-review-head">
                <div>
                  <div className="sp-review-title">Opiniones de compradores</div>
                  <div className="sp-review-sub">
                    {reviewSummary.totalReviews > 0
                      ? `${reviewSummary.totalReviews} reseña${reviewSummary.totalReviews !== 1 ? 's' : ''} registradas`
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
    </div>
  );
}