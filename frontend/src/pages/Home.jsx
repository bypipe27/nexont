import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useHybridCart } from '../hooks/useHybridCart';
import { useTheme } from '../context/ThemeContext'; // <-- NUEVO

function ProductDetailModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setProduct(data.product);
      } catch (err) {
        setError(err.response?.data?.error || 'Producto no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [productId]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}
    >
      <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '1.5rem', width: '100%', maxWidth: 480, position: 'relative', fontFamily: 'sans-serif', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>

        {loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Cargando…</p>}
        {error && <p style={{ color: 'red', textAlign: 'center', padding: '1rem 0' }}>{error}</p>}

        {!loading && !error && product && (
          <>
            {product.imagenes && product.imagenes.length > 0 && product.imagenes[0].url ? (
              <img src={product.imagenes[0].url} alt={product.titulo}
                style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 6, marginBottom: '1rem' }} />
            ) : (
              <div style={{ width: '100%', height: 220, background: 'var(--bg-primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>Sin imagen</div>
            )}
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{product.titulo}</h2>
            {product.descripcion && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>{product.descripcion}</p>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 6, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Precio</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${parseFloat(product.precio).toFixed(2)}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 6, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock disponible</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.stock} unidades</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 6, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estado</div>
                <div style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{product.condicion || 'NUEVO'}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 6, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calificación</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{'★'.repeat(Math.round(product.promedioCalificacion || 0))}{'☆'.repeat(5 - Math.round(product.promedioCalificacion || 0))} ({product.promedioCalificacion || 0})</div>
              </div>
            </div>
            {product.vendedor && (
              <div style={{ background: 'var(--bg-primary)', borderRadius: 6, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vendedor</div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{product.vendedor.nombres} {product.vendedor.apellidos}</div>
                {product.vendedor.correo && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{product.vendedor.correo}</div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filterCondition, setFilterCondition] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState(1000);
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [quantities, setQuantities] = useState({});

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const productsPerPage = 12;
  const { theme, toggleTheme } = useTheme(); // <-- NUEVO

  const { cart, error: cartError, success: cartSuccess, addToCart, setError: setCartError } = useHybridCart();


  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest('div[style*="position: relative"]')) setDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);


  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts({
      search: searchTerm || undefined,
      condition: filterCondition || undefined,
      maxPrice: filterMaxPrice,
      minRating: filterMinRating > 0 ? filterMinRating : undefined,
    });
  };

  const handleQuantityInput = (productId, value) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const handleAddToCart = (product) => {
    const quantity = Number(quantities[product.id] || 1);
    if (!Number.isInteger(quantity) || quantity < 1) {
      setCartError('La cantidad debe ser un entero mayor o igual a 1');
      return;
    }
    addToCart(product.id, quantity, { name: product.titulo, price: product.precio });
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const filteredProducts = products.sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return (a.precio || 0) - (b.precio || 0);
      case 'price-high': return (b.precio || 0) - (a.precio || 0);
      case 'rating': return (b.promedioCalificacion || 0) - (a.promedioCalificacion || 0);
      default: return 0;
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIdx = (currentPage - 1) * productsPerPage;
  const displayedProducts = filteredProducts.slice(startIdx, startIdx + productsPerPage);

  const toggleFavorite = (productId) => {
    setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--navbar-bg)', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #333' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/resources/icone.png" alt="Nexont" style={{ height: '32px', width: 'auto' }} />
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.3rem', cursor: 'pointer', fontWeight: '700', letterSpacing: '0.5px' }}>Nexont</h1>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* ─── Toggle modo oscuro/claro ─── */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.6rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {token && user && (
            <button onClick={() => navigate('/cart')} style={{ background: 'rgba(102, 126, 234, 0.9)', color: 'white', border: '1px solid rgba(102, 126, 234, 1)', padding: '0.6rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
              🛒 Carrito ({cart.totalItems || 0})
            </button>
          )}

          <div style={{ position: 'relative' }}>
            {token && user ? (
              <>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: '500' }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  👤 {user.nombres}
                  <span style={{ fontSize: '0.8rem' }}>▼</span>
                </button>
                {dropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--bg-card)', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', minWidth: '220px', marginTop: '0.5rem', zIndex: 1000 }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>👤 Mi perfil</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={() => { setDropdownOpen(false); navigate('/orders'); }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>📦 Mis órdenes</span>
                    </div>
                    {user.esVendedorVerificado && (
                      <>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={() => { setDropdownOpen(false); navigate('/my-products'); }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>📦 Mis productos</span>
                        </div>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={() => { setDropdownOpen(false); navigate('/my-products'); }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>➕ Agregar producto</span>
                        </div>
                      </>
                    )}
                    {!user.esVendedorVerificado && (
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: '#fef3c7' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fed7aa'} onMouseLeave={(e) => e.currentTarget.style.background = '#fef3c7'}>
                        <span style={{ color: '#92400e', fontWeight: '600' }}>⭐ Verificarse como vendedor</span>
                      </div>
                    )}
                    <div style={{ padding: '0.75rem 1rem', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); }}>
                      <span style={{ color: '#991b1b', fontWeight: '500' }}>🚪 Cerrar sesión</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/login" style={{ color: 'white', textDecoration: 'none', padding: '0.6rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', display: 'inline-block' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.15)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.1)'; }}>Iniciar sesión</Link>
                <Link to="/register" style={{ color: 'white', textDecoration: 'none', padding: '0.6rem 1rem', backgroundColor: 'rgba(102, 126, 234, 0.9)', border: '1px solid rgba(102, 126, 234, 1)', borderRadius: '6px', fontWeight: '600', display: 'inline-block' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(102, 126, 234, 1)'; }} onMouseLeave={(e) => { e.target.style.background = 'rgba(102, 126, 234, 0.9)'; }}>Registrarse</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Catálogo de Productos</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Explora nuestros productos de calidad</p>
          {cartError && <p style={{ color: '#b91c1c', marginTop: '0.5rem', marginBottom: 0 }}>{cartError}</p>}
          {cartSuccess && <p style={{ color: '#166534', marginTop: '0.5rem', marginBottom: 0 }}>{cartSuccess}</p>}
        </div>


        <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
          <input type="text" placeholder="Buscar productos..." value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-input)', fontSize: '1rem', boxSizing: 'border-box', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
          />
          <button onClick={handleSearch} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#667eea', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>Buscar</button>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>

          <aside style={{ width: '250px', flexShrink: 0 }}>
            <div style={{ background: 'var(--bg-sidebar)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>Filtros</h3>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Estado</h4>
                {['', 'NUEVO', 'USADO', 'REACONDICIONADO'].map((c) => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="filterCondition" value={c} checked={filterCondition === c} onChange={() => setFilterCondition(c)} style={{ marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{c === '' ? 'Todos' : c.charAt(0) + c.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Rango de Precio</h4>
                <input type="range" min="0" max="1000" step="10" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  <span>$0</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>${filterMaxPrice}</span>
                  <span>$1000+</span>
                </div>
              </div>


              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Calificación mínima</h4>
                {[0, 1, 2, 3, 4, 5].map((r) => (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="filterRating" value={r} checked={filterMinRating === r} onChange={() => setFilterMinRating(r)} style={{ marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '0.9rem', color: r === 0 ? 'var(--text-secondary)' : '#f5a623' }}>{r === 0 ? 'Todas' : '★'.repeat(r) + '☆'.repeat(5 - r)}</span>
                  </label>
                ))}
              </div>
              <button onClick={handleSearch} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: 'none', background: '#667eea', color: 'white', fontWeight: '600', cursor: 'pointer', marginBottom: '0.5rem' }}>Aplicar filtros</button>
              <button onClick={() => { setFilterCondition(''); setFilterMaxPrice(1000); setFilterMinRating(0); setSearchTerm(''); fetchProducts(); }} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-input)', background: 'var(--bg-input)', color: 'var(--text-primary)', cursor: 'pointer' }}>Limpiar filtros</button>
            </div>

          </aside>


          <div style={{ flex: 1 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Mostrando <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{startIdx + 1}-{Math.min(startIdx + productsPerPage, filteredProducts.length)}</span> de <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{filteredProducts.length}</span>
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', border: '1px solid var(--border-input)', borderRadius: '6px', overflow: 'hidden' }}>
                  <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem 0.75rem', background: viewMode === 'grid' ? '#667eea' : 'var(--bg-input)', color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>⊞</button>
                  <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem 0.75rem', background: viewMode === 'list' ? '#667eea' : 'var(--bg-input)', color: viewMode === 'list' ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>≡</button>
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-input)', fontSize: '0.9rem', cursor: 'pointer', background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                  <option value="newest">Más reciente</option>
                  <option value="price-low">Menor precio</option>
                  <option value="price-high">Mayor precio</option>
                  <option value="rating">Mejor calificación</option>
                </select>
              </div>
            </div>


            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><p style={{ color: 'var(--text-secondary)' }}>Cargando productos...</p></div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#991b1b' }}><p>{error}</p></div>
            ) : displayedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><p style={{ color: 'var(--text-secondary)' }}>No se encontraron productos</p></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(250px, 1fr))' : '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {displayedProducts.map(product => (
                  <div key={product.id} onClick={() => setSelectedId(product.id)}
                    style={{ background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow)', transition: 'box-shadow 0.3s, transform 0.3s', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--bg-primary)', overflow: 'hidden' }}>
                      <img
                        src={product.imagenes && product.imagenes.length > 0 && product.imagenes[0]?.url ? product.imagenes[0].url : 'https://via.placeholder.com/300?text=' + encodeURIComponent(product.titulo)}
                        alt={product.titulo}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: '#667eea', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>⭐ Destacado</span>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                        style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.9)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                        onMouseEnter={(e) => e.target.style.background = 'white'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.9)'}
                      >
                        {favorites.includes(product.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#667eea', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>{product.condicion || 'NUEVO'}</p>
                      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{product.titulo}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <div>
                          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>${(parseFloat(product.precio) || 0).toFixed(2)}</p>
                          <p style={{ fontSize: '0.78rem', color: '#f5a623', margin: 0 }}>{'★'.repeat(Math.round(product.promedioCalificacion || 0))}{'☆'.repeat(5 - Math.round(product.promedioCalificacion || 0))}</p>
                        </div>
                        {product.stock !== undefined && (
                          <span style={{ fontSize: '0.75rem', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                            {product.stock > 0 ? `En stock: ${product.stock}` : 'Agotado'}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                        <input type="number" min="1" value={quantities[product.id] || 1}
                          onChange={(e) => { e.stopPropagation(); handleQuantityInput(product.id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: 60, padding: '0.3rem', borderRadius: 4, border: '1px solid var(--border-input)', fontSize: '0.85rem', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                        />
                        <button onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }} disabled={product.stock === 0}
                          style={{ flex: 1, padding: '0.3rem 0.6rem', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', background: product.stock === 0 ? '#ccc' : '#28a745', color: '#fff', border: 'none', borderRadius: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                          {product.stock === 0 ? 'Sin stock' : 'Agregar'}
                        </button>
                      </div>
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {product.vendedor?.nombres} {product.vendedor?.apellidos}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Ver detalle →</div>
                    </div>
                  </div>
                ))}
              </div>
            )}


            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border-input)', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', background: currentPage === 1 ? 'var(--bg-primary)' : 'var(--bg-input)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: '0.9rem' }}>← Anterior</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border-input)', borderRadius: '6px', cursor: 'pointer', background: page === currentPage ? '#667eea' : 'var(--bg-input)', color: page === currentPage ? 'white' : 'var(--text-primary)', fontWeight: page === currentPage ? 'bold' : 'normal', fontSize: '0.9rem' }}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border-input)', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', background: currentPage === totalPages ? 'var(--bg-primary)' : 'var(--bg-input)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: '0.9rem' }}>Siguiente →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedId && (
        <ProductDetailModal productId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

export default Home;
