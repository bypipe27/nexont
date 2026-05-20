import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useHybridCart } from '../hooks/useHybridCart';
import { useTheme } from '../context/ThemeContext';
import AssistedTopBar from '../components/assisted/AssistedTopBar';
import DarkVeil from '../components/animations/DarkVeil';
import CountUp from '../components/animations/CountUp';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@200..700&display=swap');

  :root {
    --ar-bg: #f7f9fd;
    --ar-surface: #ffffff;
    --ar-surface-low: #f2f4f8;
    --ar-surface-container: #eceef2;
    --ar-on-surface: #191c1f;
    --ar-on-surface-variant: #45464c;
    --ar-outline-variant: #c6c6cd;
    --ar-primary: #000000;
    --ar-primary-contrast: #ffffff;
    --ar-secondary: #5c5f60;
    --ar-error: #ba1a1a;
    --ar-success: #157f3b;
    --ar-shadow: rgba(0, 0, 0, 0.08);
  }

  [data-theme='dark'] {
    --ar-bg: #2d3134;
    --ar-surface: #191c1e;
    --ar-surface-low: #2d3134;
    --ar-surface-container: #191c1e;
    --ar-on-surface: #eff1f5;
    --ar-on-surface-variant: #c6c6cd;
    --ar-outline-variant: #45464c;
    --ar-primary: #c0c6db;
    --ar-primary-contrast: #191c1f;
    --ar-secondary: #e1e3e4;
    --ar-shadow: rgba(0, 0, 0, 0.35);
  }

  .nx-root {
    min-height: 100vh;
    background: var(--ar-bg);
    color: var(--ar-on-surface);
    font-family: 'Inter', sans-serif;
    transition: background-color 0.25s ease;
  }

  .ar-icon {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 20px;
    line-height: 1;
    vertical-align: middle;
  }

  /* ── HERO ── */
  .nx-hero {
    padding: 120px 32px;
    text-align: center;
    background: var(--ar-surface);
    border-bottom: 1px solid var(--ar-outline-variant);
    position: relative;
    overflow: hidden;
    color: var(--ar-on-surface);
  }
  .nx-hero-left { 
    max-width: 800px; 
    margin: 0 auto; 
    position: relative; 
    z-index: 2; 
  }
  .nx-hero-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0.6;
  }
  .nx-hero-h1 {
    font-size: clamp(3.5rem, 8vw, 5rem);
    font-weight: 800;
    line-height: 1.1;
    color: var(--ar-on-surface);
    margin-bottom: 24px;
    letter-spacing: -0.02em;
  }
  .nx-hero-h1 em { font-style: normal; color: var(--ar-primary); }
  .nx-hero-p {
    font-size: 1.25rem;
    line-height: 1.6;
    color: var(--ar-on-surface-variant);
    max-width: 600px;
    margin: 0 auto 40px;
  }
  .nx-hero-actions { display: flex; gap: 16px; justify-content: center; }
  
  .nx-btn-primary {
    border: none;
    background: var(--ar-primary);
    color: var(--ar-primary-contrast);
    font-size: 14px;
    font-weight: 600;
    padding: 14px 28px;
    border-radius: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  .nx-btn-primary:hover { transform: translateY(-2px); opacity: 0.9; }
  
  .nx-btn-outline {
    border: 1px solid var(--ar-outline-variant);
    background: transparent;
    color: var(--ar-on-surface);
    font-size: 14px;
    font-weight: 600;
    padding: 14px 28px;
    border-radius: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    transition: background 0.2s ease;
  }
  .nx-btn-outline:hover { background: var(--ar-surface-low); }

  .nx-hero-stats {
    display: flex;
    gap: 48px;
    margin-top: 64px;
    justify-content: center;
    padding-top: 40px;
    border-top: 1px solid var(--ar-outline-variant);
  }
  .nx-hstat { text-align: center; }
  .nx-hstat-val {
    font-size: 32px;
    font-weight: 800;
    color: var(--ar-on-surface);
    display: block;
    margin-bottom: 4px;
  }
  .nx-hstat-lbl {
    font-size: 11px;
    color: var(--ar-on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  /* ── SECCIONES ── */
  .nx-section { padding: 80px 32px; max-width: 1280px; margin: 0 auto; }
  .nx-assist-hero-card {
    background: var(--ar-surface);
    border: 1px solid var(--ar-outline-variant);
    border-radius: 24px;
    padding: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    box-shadow: 0 20px 40px var(--ar-shadow);
  }
  .nx-assist-kicker {
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ar-secondary);
    margin-bottom: 12px;
    display: block;
  }
  .nx-assist-title {
    font-size: 36px;
    font-weight: 700;
    color: var(--ar-on-surface);
    margin-bottom: 16px;
  }
  .nx-assist-desc {
    color: var(--ar-on-surface-variant);
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 500px;
  }

  /* ── CATÁLOGO ── */
  .nx-catalog { display: flex; gap: 40px; padding: 0 32px 100px; max-width: 1280px; margin: 0 auto; }
  .nx-sidebar {
    width: 280px;
    flex-shrink: 0;
    background: var(--ar-surface);
    border: 1px solid var(--ar-outline-variant);
    border-radius: 20px;
    padding: 24px;
    height: fit-content;
    position: sticky;
    top: 100px;
  }
  .nx-sb-head { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--ar-outline-variant); }
  .nx-sb-title { font-size: 18px; font-weight: 700; }
  .nx-sb-sec { margin-bottom: 24px; }
  .nx-sb-sec-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--ar-secondary);
    margin-bottom: 12px;
    display: block;
  }
  .nx-sb-radio {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    cursor: pointer;
    font-size: 14px;
    color: var(--ar-on-surface-variant);
  }
  .nx-sb-radio input { accent-color: var(--ar-primary); }
  .nx-sb-range { width: 100%; accent-color: var(--ar-primary); margin-bottom: 8px; }
  .nx-sb-range-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--ar-secondary); }
  .nx-sb-apply {
    width: 100%;
    padding: 12px;
    background: var(--ar-primary);
    color: var(--ar-primary-contrast);
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 16px;
  }
  .nx-sb-clear {
    width: 100%;
    padding: 10px;
    background: transparent;
    color: var(--ar-secondary);
    border: 1px solid var(--ar-outline-variant);
    border-radius: 10px;
    font-size: 13px;
    margin-top: 8px;
    cursor: pointer;
  }

  .nx-cat-main { flex: 1; }
  .nx-cat-header-sticky {
    position: sticky;
    top: 64px;
    background: var(--ar-bg);
    z-index: 90;
    padding-top: 16px;
    margin-bottom: 24px;
  }
  .nx-cat-heading { margin-bottom: 20px; }
  .nx-section-eyebrow { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ar-secondary); }
  .nx-section-title { font-size: 32px; font-weight: 700; margin-top: 8px; }

  .nx-cat-searchbar { display: flex; gap: 12px; margin-bottom: 32px; }
  .nx-cat-searchbar input {
    flex: 1;
    height: 48px;
    padding: 0 16px;
    border-radius: 12px;
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-surface);
    color: var(--ar-on-surface);
    font-family: inherit;
    font-size: 15px;
  }
  .nx-cat-searchbar button {
    padding: 0 24px;
    background: var(--ar-primary);
    color: var(--ar-primary-contrast);
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .nx-cat-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    font-size: 14px;
    color: var(--ar-on-surface-variant);
  }
  .nx-view-toggle { display: flex; border: 1px solid var(--ar-outline-variant); border-radius: 8px; overflow: hidden; }
  .nx-vbtn {
    width: 36px; height: 36px;
    background: var(--ar-surface);
    border: none;
    color: var(--ar-secondary);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .nx-vbtn.on { background: var(--ar-primary); color: var(--ar-primary-contrast); }
  .nx-sortsel {
    height: 36px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-surface);
    color: var(--ar-on-surface);
    font-family: inherit;
  }

  .nx-pgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
  .nx-pgrid.list { grid-template-columns: 1fr; }

  .nx-pcard {
    background: var(--ar-surface);
    border: 1px solid var(--ar-outline-variant);
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    position: relative;
  }
  .nx-pcard:hover { transform: translateY(-4px); box-shadow: 0 20px 40px var(--ar-shadow); }
  .nx-pcard-img { height: 200px; background: var(--ar-surface-low); position: relative; }
  .nx-pcard-img img { width: 100%; height: 100%; object-fit: cover; }
  .nx-pcard-badge {
    position: absolute; top: 12px; left: 12px;
    background: var(--ar-surface);
    border: 1px solid var(--ar-outline-variant);
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    border-radius: 4px;
  }
  .nx-fav {
    position: absolute; top: 12px; right: 12px;
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-surface);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: transform 0.2s;
  }
  .nx-fav:hover { transform: scale(1.1); }
  .nx-pcard-body { padding: 20px; }
  .nx-pcard-name { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--ar-on-surface); }
  .nx-pcard-price { font-size: 20px; font-weight: 700; color: var(--ar-primary); margin-bottom: 8px; }
  .nx-pcard-stars { color: #facc15; font-size: 13px; margin-bottom: 16px; }
  .nx-pcard-add-row { display: flex; gap: 8px; }
  .nx-qty {
    width: 50px;
    height: 36px;
    border: 1px solid var(--ar-outline-variant);
    border-radius: 8px;
    text-align: center;
    background: var(--ar-surface);
    color: var(--ar-on-surface);
  }
  .nx-add-btn {
    flex: 1;
    height: 36px;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
  }
  .nx-add-btn.ok { background: var(--ar-primary); color: var(--ar-primary-contrast); }
  .nx-add-btn.out { background: var(--ar-surface-container); color: var(--ar-secondary); cursor: not-allowed; }
  .nx-pcard-seller { font-size: 12px; color: var(--ar-on-surface-variant); margin-top: 12px; }

  .nx-pages { display: flex; justify-content: center; gap: 8px; margin-top: 48px; }
  .nx-pg {
    width: 40px; height: 40px;
    border-radius: 8px;
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-surface);
    color: var(--ar-on-surface);
    font-weight: 600;
    cursor: pointer;
  }
  .nx-pg.on { background: var(--ar-primary); color: var(--ar-primary-contrast); border-color: var(--ar-primary); }
  .nx-pg:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── MODALES ── */
  .nx-overlay {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; z-index: 2000;
  }
  .nx-modal {
    background: var(--ar-surface);
    border: 1px solid var(--ar-outline-variant);
    border-radius: 20px;
    width: 100%;
    max-width: 520px;
    overflow: hidden;
    box-shadow: 0 24px 48px var(--ar-shadow);
    position: relative;
  }
  .nx-modal-x {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-surface);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
  }
  .nx-modal-img { width: 100%; height: 260px; object-fit: cover; }
  .nx-modal-noimg { height: 260px; display: flex; align-items: center; justify-content: center; background: var(--ar-surface-low); color: var(--ar-secondary); }
  .nx-modal-body { padding: 32px; }
  .nx-modal-title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
  .nx-modal-desc { color: var(--ar-on-surface-variant); font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
  .nx-modal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .nx-modal-stat { border: 1px solid var(--ar-outline-variant); border-radius: 12px; padding: 16px; }
  .nx-ms-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ar-secondary); margin-bottom: 4px; display: block; }
  .nx-ms-val { font-size: 18px; font-weight: 700; }

  .nx-seller-card {
    margin-top: 24px;
    padding: 20px;
    border-radius: 16px;
    background: var(--ar-surface-low);
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .nx-seller-av {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: var(--ar-surface-container);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
    overflow: hidden;
  }
  .nx-seller-av img { width: 100%; height: 100%; object-fit: cover; }
  .nx-seller-info { flex: 1; }
  .nx-seller-name { font-weight: 600; font-size: 16px; display: block; }
  .nx-seller-date { font-size: 12px; color: var(--ar-secondary); margin-top: 2px; }
  .nx-seller-link {
    font-size: 12px;
    font-weight: 600;
    color: var(--ar-primary);
    background: none;
    border: none;
    cursor: pointer;
    text-transform: uppercase;
  }

  /* ── ALERTAS ── */
  .nx-alert-err { background: rgba(186, 26, 26, 0.08); color: var(--ar-error); border: 1px solid rgba(186, 26, 26, 0.3); padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; }
  .nx-alert-ok { background: rgba(21, 127, 59, 0.1); color: var(--ar-success); border: 1px solid rgba(21, 127, 59, 0.3); padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; }

  @media (max-width: 960px) {
    .nx-catalog { flex-direction: column; }
    .nx-sidebar { width: 100%; position: static; }
    .nx-assist-hero-card { flex-direction: column; text-align: center; padding: 32px; }
    .nx-assist-desc { max-width: 100%; }
  }
`;

if (!document.getElementById('nx-main-styles')) {
  const el = document.createElement('style');
  el.id = 'nx-main-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

const AVATAR_COLORS = [
  { bg: '#F0F4FF', color: '#3B5BDB' },
  { bg: '#FFF0F6', color: '#C2255C' },
  { bg: '#F3FCF0', color: '#2F9E44' },
  { bg: '#FFF9DB', color: '#E67700' },
  { bg: '#F8F0FC', color: '#7950F2' },
  { bg: '#E8FAF0', color: '#0CA678' },
];

function getAvatarColor(name = '') {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ── Modal detalle ─────────────────────────────────────────────────────────────
function ProductDetailModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
  const goToSeller = (sellerId) => { onClose(); navigate(`/seller/${sellerId}`); };

  return (
    <div className="nx-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nx-modal">
        <button className="nx-modal-x" onClick={onClose}><span className="ar-icon">close</span></button>
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ar-on-surface-variant)', fontSize: '0.85rem' }}>Cargando…</div>}
        {error && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ar-error)', fontSize: '0.85rem' }}>{error}</div>}
        {!loading && !error && product && (
          <>
            {product.imagenes?.[0]?.url
              ? <img src={product.imagenes[0].url} alt={product.titulo} className="nx-modal-img" />
              : <div className="nx-modal-noimg">Sin imagen</div>
            }
            <div className="nx-modal-body">
              <div className="nx-modal-title">{product.titulo}</div>
              {product.descripcion && <div className="nx-modal-desc">{product.descripcion}</div>}
              <div className="nx-modal-grid">
                <div className="nx-modal-stat">
                  <span className="nx-ms-lbl">Precio</span>
                  <span className="nx-ms-val">${parseFloat(product.precio).toFixed(2)}</span>
                </div>
                <div className="nx-modal-stat">
                  <span className="nx-ms-lbl">Stock</span>
                  <span className="nx-ms-val">{product.stock} uds.</span>
                </div>
                <div className="nx-modal-stat">
                  <span className="nx-ms-lbl">Estado</span>
                  <span className="nx-ms-val" style={{ textTransform: 'capitalize' }}>{product.condition || 'nuevo'}</span>
                </div>
                <div className="nx-modal-stat">
                  <span className="nx-ms-lbl">Calificación</span>
                  <span className="nx-ms-val" style={{ fontSize: '0.85rem' }}>{stars(product.rating)}</span>
                </div>
              </div>
              {product.seller && (() => {
                const v = product.seller;
                const initials = `${(v.nombres?.[0] || '').toUpperCase()}${(v.apellidos?.[0] || '').toUpperCase()}`;
                const sellerRating = v.reviewSummary?.totalReviews > 0 ? v.reviewSummary.averageRating : 0;
                return (
                  <div className="nx-seller-card">
                    <div className="nx-seller-av">
                      {v.fotoPerfil ? <img src={v.fotoPerfil} alt={v.nombres} /> : initials}
                    </div>
                    <div className="nx-seller-info">
                      <span className="nx-seller-name">{v.nombres} {v.apellidos}</span>
                      <div className="nx-seller-date">Vendedor verificado</div>
                      <div style={{ marginTop: '0.35rem', fontSize: '0.76rem', color: 'var(--ar-on-surface-variant)' }}>
                        {v.reviewSummary?.totalReviews > 0
                          ? <>Calificación del vendedor: <span style={{ color: 'var(--amber)' }}>{stars(sellerRating)}</span> <span style={{ marginLeft: 6 }}>{sellerRating.toFixed(1)} · {v.reviewSummary.totalReviews} reseñas</span></>
                          : 'Aún no tiene reseñas'}
                      </div>
                    </div>
                    <button className="nx-seller-link" onClick={() => goToSeller(v.id)}>Ver tienda</button>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationForm, setVerificationForm] = useState({ fullName: '', documentNumber: '', ciudad: '' });
  const [verificationFormError, setVerificationFormError] = useState('');
  const docRef = useRef(null);
  const personalRef = useRef(null);
  const [docSelected, setDocSelected] = useState(false);
  const [personalSelected, setPersonalSelected] = useState(false);
  const [submittingVerificationForm, setSubmittingVerificationForm] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState('');
  const [searchTerm, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setView] = useState('grid');
  const [currentPage, setPage] = useState(1);
  const [favorites, setFavs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [fCond, setFCond] = useState('');
  const [fMaxPrice, setFMaxPrice] = useState(1000);
  const [fMinRating, setFMinRating] = useState(0);
  const [qtys, setQtys] = useState({});

  // ── user como estado reactivo ──
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const PER_PAGE = 12;
  const initials = user ? `${(user.nombres || '')[0] || ''}${(user.apellidos || '')[0] || ''}`.toUpperCase() : '';
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { cart, error: cartErr, success: cartOk, addToCart, setError: setCartErr } = useHybridCart();

  // ── Escuchar cambios de perfil desde Profile.jsx ──
  useEffect(() => {
    const handler = () => {
      const updated = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(updated);
    };
    window.addEventListener('user-updated', handler);
    return () => window.removeEventListener('user-updated', handler);
  }, []);


  const fetchAssistedRecommendations = useCallback(async (answers = {}) => {
    try {
      setAssistLoad(true); setAssistErr('');
      const { data } = await api.post('/products/recommendations-assisted?limit=6', { answers });
      setRecommendedProducts((data.products || []).slice(0, 6));
      setAssistFallback(Boolean(data.usedFallback));
    } catch {
      setAssistErr('No se pudieron cargar recomendaciones en este momento');
      setRecommendedProducts([]); setAssistFallback(true);
    } finally { setAssistLoad(false); }
  }, []);

  const fetchProducts = useCallback(async (params = {}) => {
    try { setLoading(true); const { data } = await api.get('/products', { params }); setProducts(data.products || []); }
    catch { setError('Error al cargar productos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const handleGlobalSearch = (e) => {
      const query = e.detail;
      setSearch(query);
      setPage(1);
      fetchProducts({ search: query || undefined, condition: fCond || undefined, maxPrice: fMaxPrice, minRating: fMinRating > 0 ? fMinRating : undefined });
      scrollTo('catalogo');
    };
    window.addEventListener('nx-search', handleGlobalSearch);
    return () => window.removeEventListener('nx-search', handleGlobalSearch);
  }, [fetchProducts, fCond, fMaxPrice, fMinRating]);


  const doSearch = () => { setPage(1); fetchProducts({ search: searchTerm || undefined, condition: fCond || undefined, maxPrice: fMaxPrice, minRating: fMinRating > 0 ? fMinRating : undefined }); };
  const doAddToCart = (p, e) => { e.stopPropagation(); const qty = Number(qtys[p.id] || 1); if (!Number.isInteger(qty) || qty < 1) { setCartErr('Cantidad inválida'); return; } addToCart(p.id, qty, { name: p.titulo, price: p.precio }); setQtys(prev => ({ ...prev, [p.id]: 1 })); };
  const handleAssistChange = (field, value) => setAssistAnswers(prev => ({ ...prev, [field]: value }));
  const runAssistedSurvey = async () => {
    const isComplete = Object.values(assistAnswers).every(v => typeof v === 'string' && v.trim() !== '');
    if (!isComplete) { setAssistErr('Debes responder exactamente las 5 preguntas para personalizar recomendaciones'); return; }
    await fetchAssistedRecommendations(assistAnswers);
  };

  const sorted = [...products].sort((a, b) => { if (sortBy === 'price-low') return (a.precio || 0) - (b.precio || 0); if (sortBy === 'price-high') return (b.precio || 0) - (a.precio || 0); if (sortBy === 'rating') return (b.promedioCalificacion || 0) - (a.promedioCalificacion || 0); return 0; });
  const totalPgs = Math.ceil(sorted.length / PER_PAGE);
  const start = (currentPage - 1) * PER_PAGE;
  const shown = sorted.slice(start, start + PER_PAGE);
  const toggleFav = id => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const stars = n => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  return (
    <div className="nx-root">

      <AssistedTopBar active="tienda" />

      {/* ── HERO ── */}
      <section className="nx-hero">
        <div className="nx-hero-bg">
          <DarkVeil
            hueShift={isDark ? 0 : 210}
            noiseIntensity={0}
            scanlineIntensity={0}
            speed={0.4}
            scanlineFrequency={0}
            warpAmount={0.2}
            isDark={isDark}
          />
        </div>
        <div className="nx-hero-left">
          <h1 className="nx-hero-h1">Descubre lo<br /><em>extraordinario</em> en cada objeto</h1>
          <p className="nx-hero-p">Vendedores verificados, productos únicos y la experiencia de compra más refinada de Colombia.</p>
          <div className="nx-hero-actions">
            <button className="nx-btn-primary" onClick={() => scrollTo('catalogo')}>
              Explorar catálogo <span className="ar-icon">arrow_forward</span>
            </button>
            {!token && <Link to="/register" className="nx-btn-outline">Vender aquí</Link>}
            {token && user?.esVendedorVerificado && (
              <button className="nx-btn-outline" onClick={() => navigate('/my-products')}>
                Publicar producto <span className="ar-icon">add</span>
              </button>
            )}
          </div>
          <div className="nx-hero-stats">
            <div className="nx-hstat">
              <span className="nx-hstat-val">
                {products.length > 0 ? <CountUp to={products.length} duration={1.5} /> : '—'}
              </span>
              <span className="nx-hstat-lbl">Productos activos</span>
            </div>
            <div className="nx-hstat">
              <span className="nx-hstat-val">
                <CountUp to={100} duration={2} />%
              </span>
              <span className="nx-hstat-lbl">Vendedores verificados</span>
            </div>
            <div className="nx-hstat">
              <span className="nx-hstat-val">
                <CountUp to={24} duration={2} />h
              </span>
              <span className="nx-hstat-lbl">Soporte disponible</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECOMENDADOS ── */}
      <section className="nx-section" style={{ borderTop: '1px solid var(--ar-outline-variant)' }}>
        <div className="nx-assist-hero">
          <div className="nx-assist-hero-card">
            <div>
              <span className="nx-assist-kicker">Compra asistida</span>
              <h2 className="nx-assist-title">Recomendados para ti</h2>
              <p className="nx-assist-desc">
                Responde una encuesta corta y recibe una seleccion personalizada de productos.
                Puedes volver cuando quieras a revisar los resultados.
              </p>
            </div>
            <div className="nx-assist-cta">
              <button
                className="nx-btn-primary"
                onClick={() => navigate('/recomendados')}
              >
                Iniciar encuesta <span className="ar-icon">quiz</span>
              </button>
            </div>
          </div>
        </div>
      </section>




      {/* ── CATÁLOGO COMPLETO ── */}
      <div id="catalogo" className="nx-catalog">
        <aside className="nx-sidebar">
          <div className="nx-sb-head"><span className="nx-sb-title">Filtros</span></div>
          <div className="nx-sb-sec">
            <span className="nx-sb-sec-title">Estado</span>
            {['', 'NUEVO', 'USADO', 'REACONDICIONADO'].map(c => (
              <label key={c} className="nx-sb-radio">
                <input type="radio" name="cond" value={c} checked={fCond === c} onChange={() => setFCond(c)} />
                <span>{c === '' ? 'Todos' : c.charAt(0) + c.slice(1).toLowerCase()}</span>
              </label>
            ))}
          </div>
          <div className="nx-sb-sec">
            <span className="nx-sb-sec-title">Precio máximo</span>
            <input type="range" min="0" max="1000" step="10" value={fMaxPrice} onChange={e => setFMaxPrice(Number(e.target.value))} className="nx-sb-range" />
            <div className="nx-sb-range-row"><span>$0</span><span className="nx-sb-range-val">${fMaxPrice}</span><span>$1000+</span></div>
          </div>
          <div className="nx-sb-sec">
            <span className="nx-sb-sec-title">Calificación mín.</span>
            {[0, 1, 2, 3, 4, 5].map(r => (
              <label key={r} className="nx-sb-radio">
                <input type="radio" name="rat" value={r} checked={fMinRating === r} onChange={() => setFMinRating(r)} />
                <span style={{ color: r === 0 ? 'var(--ar-on-surface-variant)' : '#facc15' }}>{r === 0 ? 'Todas' : stars(r)}</span>
              </label>
            ))}
          </div>
          <div className="nx-sb-btns">
            <button className="nx-sb-apply" onClick={doSearch}>Aplicar filtros</button>
            <button className="nx-sb-clear" onClick={() => { setFCond(''); setFMaxPrice(1000); setFMinRating(0); setSearch(''); fetchProducts(); }}>Limpiar</button>
          </div>
        </aside>

        <div className="nx-cat-main">
          <div className="nx-cat-header-sticky">
            <div className="nx-cat-heading"><span className="nx-section-eyebrow">Catálogo completo</span><h2 className="nx-section-title">Todos los productos</h2></div>
            {cartErr && <div className="nx-alert-err">{cartErr}</div>}
            {cartOk && <div className="nx-alert-ok">{cartOk}</div>}
            <div className="nx-cat-searchbar">
              <input placeholder="Buscar productos…" value={searchTerm} onChange={e => { setSearch(e.target.value); setPage(1); }} onKeyDown={e => e.key === 'Enter' && doSearch()} />
              <button onClick={doSearch}>Buscar</button>
            </div>
            <div className="nx-cat-toolbar">
              <div className="nx-cat-count"><b>{start + 1}–{Math.min(start + PER_PAGE, sorted.length)}</b> de <b>{sorted.length}</b> productos</div>
              <div className="nx-toolbar-r">
                <div className="nx-view-toggle">
                  <button className={`nx-vbtn ${viewMode === 'grid' ? 'on' : ''}`} onClick={() => setView('grid')}>
                    <span className="ar-icon">grid_view</span>
                  </button>
                  <button className={`nx-vbtn ${viewMode === 'list' ? 'on' : ''}`} onClick={() => setView('list')}>
                    <span className="ar-icon">list</span>
                  </button>
                </div>
                <select className="nx-sortsel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">Más reciente</option>
                  <option value="price-low">Precio: Menor a Mayor</option>
                  <option value="price-high">Precio: Mayor a Menor</option>
                  <option value="rating">Mejor calificación</option>
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-ghost)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cargando productos…</div>
          ) : error ? (
            <div className="nx-alert-err">{error}</div>
          ) : shown.length === 0 ? (
            <div className="nx-empty"><div className="nx-empty-title">Sin resultados</div><p className="nx-empty-txt">No encontramos productos con esos criterios.</p></div>
          ) : (
            <div className={`nx-pgrid ${viewMode === 'list' ? 'list' : ''}`} style={{ borderTop: '1px solid var(--ar-outline-variant)', borderLeft: '1px solid var(--ar-outline-variant)' }}>
              {shown.map(p => (
                <div key={p.id} className="nx-pcard" onClick={() => setSelectedId(p.id)}>
                  <div className="nx-pcard-img">
                    <img src={p.imagenes?.[0]?.url || `https://via.placeholder.com/300/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`} alt={p.titulo} onError={e => { e.target.src = `https://via.placeholder.com/300/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`; }} />
                    <span className="nx-pcard-badge">{p.condicion || 'NUEVO'}</span>
                    <button className="nx-fav" onClick={e => { e.stopPropagation(); toggleFav(p.id); }}>
                      <span className="ar-icon" style={{ color: favorites.includes(p.id) ? '#ba1a1a' : 'inherit' }}>
                        {favorites.includes(p.id) ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>
                  </div>
                  <div className="nx-pcard-body">
                    <div className="nx-pcard-name">{p.titulo}</div>
                    <div className="nx-pcard-price">${(parseFloat(p.precio) || 0).toFixed(2)}</div>
                    <div className="nx-pcard-stars">{stars(p.promedioCalificacion)}</div>
                    <div className="nx-pcard-add-row" onClick={e => e.stopPropagation()}>
                      <input type="number" min="1" className="nx-qty" value={qtys[p.id] || 1} onChange={e => setQtys(prev => ({ ...prev, [p.id]: e.target.value }))} />
                      <button className={`nx-add-btn ${p.stock === 0 ? 'out' : 'ok'}`} disabled={p.stock === 0} onClick={e => doAddToCart(p, e)}>{p.stock === 0 ? 'Agotado' : '+ Agregar'}</button>
                    </div>
                    <div className="nx-pcard-seller">{p.vendedor?.nombres} {p.vendedor?.apellidos}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPgs > 1 && (
            <div className="nx-pages">
              <button className="nx-pg" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}>
                <span className="ar-icon">chevron_left</span>
              </button>
              {Array.from({ length: totalPgs }, (_, i) => i + 1).map(pg => (
                <button key={pg} className={`nx-pg ${pg === currentPage ? 'on' : ''}`} onClick={() => setPage(pg)}>{pg}</button>
              ))}
              <button className="nx-pg" disabled={currentPage === totalPgs} onClick={() => setPage(p => p + 1)}>
                <span className="ar-icon">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedId && <ProductDetailModal productId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

export default Home;