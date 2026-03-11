import { useEffect, useState } from 'react';
import api from '../api/api';

/* ─── Modal: Detalle de producto (N7) ─── */
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

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [vistaUsuario, setVistaUsuario] = useState(false); // <-- NUEVO

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSeller = user.isVerifiedSeller === true;

  const fetchProducts = async (forceAll = false) => {
    try {
      // Si es vendedor y NO está en vista usuario, trae sus productos
      const endpoint = (isSeller && !forceAll) ? '/products/my' : '/products'; // <-- MODIFICADO
      const { data } = await api.get(endpoint);
      setProducts(data.products);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    fetchProducts(vistaUsuario);
  }, [vistaUsuario]); // <-- MODIFICADO: se re-ejecuta al cambiar vista

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', parseFloat(form.price));
      formData.append('stock', parseInt(form.stock));
      if (imageFile) formData.append('image', imageFile);

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Producto publicado correctamente');
      setForm({ name: '', description: '', price: '', stock: '' });
      setImageFile(null);
      setImagePreview(null);
      fetchProducts(vistaUsuario);
    } catch (err) {
      const msg = err.response?.data?.details
        ? err.response.data.details.join(', ')
        : err.response?.data?.error || 'Error al publicar el producto';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>

      {/* ─── Header con botón toggle (solo vendedor) ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Productos</h1>
        {isSeller && ( // <-- NUEVO
          <button
            onClick={() => setVistaUsuario(!vistaUsuario)}
            style={{
              padding: '0.4rem 1rem', cursor: 'pointer', borderRadius: 6,
              border: '1px solid #007bff', background: vistaUsuario ? '#007bff' : '#fff',
              color: vistaUsuario ? '#fff' : '#007bff', fontSize: '0.88rem',
            }}
          >
            {vistaUsuario ? '← Volver a mis productos' : 'Ver como usuario →'}
          </button>
        )}
      </div>

      {/* ─── Formulario publicar (solo vendedor en vista vendedor) ─── */}
      {isSeller && !vistaUsuario && (
        <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>Publicar producto</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label>Nombre *</label><br />
              <input name="name" value={form.name} onChange={handleChange} required
                style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label>Descripción</label><br />
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label>Precio * (mayor a 0)</label><br />
                <input type="number" name="price" value={form.price} onChange={handleChange}
                  step="0.01" min="0.01" required
                  style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Cantidad disponible *</label><br />
                <input type="number" name="stock" value={form.stock} onChange={handleChange}
                  min="0" required
                  style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label>Imagen del producto</label><br />
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange}
                style={{ marginTop: '0.25rem' }} />
              {imagePreview && (
                <img src={imagePreview} alt="preview"
                  style={{ marginTop: '0.5rem', width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 6 }} />
              )}
            </div>
            <button type="submit" disabled={loading}
              style={{ padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </form>
        </section>
      )}

      {/* ─── Listado ─── */}
      <section>
        <h2>{isSeller && !vistaUsuario ? 'Mis productos' : 'Listado de productos'}</h2>
        {products.length === 0 ? (
          <p>No hay productos disponibles.</p>
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
                  <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '0.5rem' }}>
                    Stock: {p.stock}
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
      </section>

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

const th = { textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ddd' };
const td = { padding: '0.5rem', borderBottom: '1px solid #eee' };

export default Products;

