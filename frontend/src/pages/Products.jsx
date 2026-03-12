import { useEffect, useState } from 'react';
import api from '../api/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products);
    } catch (err) {
      console.error('Error al cargar los productos', err);
      setError('Error al cargar los productos. Inténtalo de nuevo más tarde.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/products', {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      });
      setSuccess('Producto publicado correctamente');
      setForm({ name: '', description: '', price: '', stock: '' });
      fetchProducts();
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
      <h1>Productos</h1>

      {/* ─── Formulario publicar producto ─── */}
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
          <button type="submit" disabled={loading}
            style={{ padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      </section>

      {/* ─── Listado de productos ─── */}
      <section>
        <h2>Listado de productos</h2>
        {products.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={th}>Nombre</th>
                <th style={th}>Precio</th>
                <th style={th}>Stock</th>
                <th style={th}>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={td}>{p.name}</td>
                  <td style={td}>${parseFloat(p.price).toFixed(2)}</td>
                  <td style={td}>{p.stock}</td>
                  <td style={td}>{p.seller?.firstName} {p.seller?.lastName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const th = { textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ddd' };
const td = { padding: '0.5rem', borderBottom: '1px solid #eee' };

export default Products;

