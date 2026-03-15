import { useEffect, useState } from 'react';
import api from '../api/api';

/* ─── Modal: Detalle de producto ─── */
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
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 8, padding: '1.5rem',
        width: '100%', maxWidth: 480, position: 'relative',
        fontFamily: 'sans-serif', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem',
          background: 'none', border: 'none', fontSize: '1.2rem',
          cursor: 'pointer', color: '#888',
        }}>✕</button>

        {loading && <p style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>Cargando…</p>}
        {error && <p style={{ color: 'red', textAlign: 'center', padding: '1rem 0' }}>{error}</p>}

        {!loading && !error && product && (
          <>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name}
                style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 6, marginBottom: '1rem' }} />
            ) : (
              <div style={{
                width: '100%', height: 220, background: '#f5f5f5', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#bbb', fontSize: '0.85rem', marginBottom: '1rem',
              }}>Sin imagen</div>
            )}
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{product.name}</h2>
            {product.description && (
              <p style={{ color: '#555', marginBottom: '1rem', lineHeight: 1.6 }}>{product.description}</p>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 6, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Precio</div>
                <div style={{ fontWeight: 600 }}>${parseFloat(product.price).toFixed(2)}</div>
              </div>
              <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 6, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Stock disponible</div>
                <div style={{ fontWeight: 600 }}>{product.stock} unidades</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 6, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Estado</div>
                <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{product.condition || 'nuevo'}</div>
              </div>
              <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 6, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Calificación</div>
                <div style={{ fontWeight: 600 }}>{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))} ({product.rating || 0})</div>
              </div>
            </div>
            {product.seller && (
              <div style={{ background: '#f5f5f5', borderRadius: 6, padding: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Vendedor</div>
                <div style={{ fontWeight: 500 }}>{product.seller.firstName} {product.seller.lastName}</div>
                {product.seller.email && <div style={{ fontSize: '0.85rem', color: '#666' }}>{product.seller.email}</div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Catalog() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState(1000);
  const [filterMinRating, setFilterMinRating] = useState(0);

  const fetchProducts = async (params = {}) => {
    try {
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
    } catch (err) {
      console.error('Error al cargar los productos', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    fetchProducts({
      search: search || undefined,
      condition: filterCondition || undefined,
      maxPrice: filterMaxPrice,
      minRating: filterMinRating > 0 ? filterMinRating : undefined,
    });
  };

  return (
    <div style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ margin: '0 0 1.5rem 0' }}>Productos</h1>

      {/* ─── Barra de búsqueda ─── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="Buscar por nombre o descripción…"
          style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
        <button onClick={handleSearch}
          style={{ padding: '0.4rem 1rem', cursor: 'pointer', borderRadius: 6, border: '1px solid #ddd' }}>
          Buscar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* ─── Listado ─── */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Listado de productos</h2>
          {products.length === 0 ? (
            <p>No se encontraron productos.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden',
                    cursor: 'pointer', background: '#fff', transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name}
                      style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: 140, background: '#f5f5f5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#bbb', fontSize: '0.8rem',
                    }}>Sin imagen</div>
                  )}
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{p.name}</div>
                    <div style={{ fontSize: '1rem', color: '#222', marginBottom: '0.3rem' }}>
                      ${parseFloat(p.price).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '0.3rem' }}>
                      Stock: {p.stock}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#666', marginBottom: '0.3rem', textTransform: 'capitalize' }}>
                      {p.condition || 'nuevo'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#f5a623', marginBottom: '0.3rem' }}>
                      {'★'.repeat(Math.round(p.rating || 0))}{'☆'.repeat(5 - Math.round(p.rating || 0))}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#555', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                      {p.seller?.firstName} {p.seller?.lastName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '0.4rem' }}>
                      Ver detalle →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Panel de filtros derecho ─── */}
        <div style={{
          width: 200, flexShrink: 0, border: '1px solid #ddd', borderRadius: 8,
          padding: '1rem', background: '#fafafa',
        }}>
          <h3 style={{ marginTop: 0, fontSize: '0.95rem' }}>Filtros</h3>

          {/* Rango de precio */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Rango de Precio</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#555', margin: '0.25rem 0' }}>
              <span>$0</span>
              <span style={{ fontWeight: 600, color: '#222' }}>${filterMaxPrice}</span>
              <span>$1000+</span>
            </div>
            <input type="range" min="0" max="1000" step="10"
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Estado */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Estado</label>
            {['', 'nuevo', 'usado', 'reacondicionado'].map((c) => (
              <div key={c} style={{ marginTop: '0.3rem' }}>
                <label style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input type="radio" name="filterCondition" value={c}
                    checked={filterCondition === c}
                    onChange={() => setFilterCondition(c)}
                    style={{ marginRight: '0.4rem' }}
                  />
                  {c === '' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
                </label>
              </div>
            ))}
          </div>

          {/* Calificación mínima */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Calificación mínima</label>
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <div key={r} style={{ marginTop: '0.3rem' }}>
                <label style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input type="radio" name="filterRating" value={r}
                    checked={filterMinRating === r}
                    onChange={() => setFilterMinRating(r)}
                    style={{ marginRight: '0.4rem' }}
                  />
                  {r === 0 ? 'Todas' : '★'.repeat(r) + '☆'.repeat(5 - r)}
                </label>
              </div>
            ))}
          </div>

          <button onClick={handleSearch}
            style={{ width: '100%', padding: '0.4rem', cursor: 'pointer', borderRadius: 6, border: '1px solid #ddd' }}>
            Aplicar filtros
          </button>
          <button
            onClick={() => {
              setFilterCondition('');
              setFilterMaxPrice(1000);
              setFilterMinRating(0);
              setSearch('');
              fetchProducts();
            }}
            style={{ width: '100%', padding: '0.4rem', cursor: 'pointer', borderRadius: 6, border: '1px solid #ddd', marginTop: '0.5rem', background: '#fff' }}>
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* ─── Modal detalle ─── */}
      {selectedId && (
        <ProductDetailModal
          productId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

export default Catalog;