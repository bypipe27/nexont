import { useEffect, useState } from 'react';
import api from '../api/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0 });
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cartError, setCartError] = useState('');
  const [cartSuccess, setCartSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [vistaUsuario, setVistaUsuario] = useState(false); // <-- NUEVO

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSeller = user.isVerifiedSeller === true;
  const canUseCart = !isSeller || vistaUsuario;

  const fetchProducts = async (forceAll = false) => {
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

  const applyCartResponse = (data) => {
    setCart({
      items: data.items || [],
      totalItems: data.totalItems || 0,
      subtotal: Number(data.subtotal || 0),
    });
  };

  const fetchCart = async () => {
    if (!canUseCart) {
      setCart({ items: [], totalItems: 0, subtotal: 0 });
      return;
    }

    try {
      setCartLoading(true);
      const { data } = await api.get('/cart');
      applyCartResponse(data);
    } catch (err) {
      setCartError(err.response?.data?.error || 'No se pudo obtener el carrito');
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [canUseCart]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const numericStock = Number(form.stock);

    if (!Number.isInteger(numericStock)) {
      setError('El stock debe ser un número entero.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/products', {
        name: form.name,
        description: form.description,
        price: numericPrice,
        stock: numericStock,
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

  const handleQuantityInput = (productId, value) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const addToCart = async (productId) => {
    try {
      setCartError('');
      setCartSuccess('');
      const quantity = Number(quantities[productId] || 1);

      if (!Number.isInteger(quantity) || quantity < 1) {
        setCartError('La cantidad a agregar debe ser un entero mayor o igual a 1');
        return;
      }

      const { data } = await api.post('/cart/items', { productId, quantity });
      applyCartResponse(data);
      setCartSuccess('Producto agregado al carrito');
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
    } catch (err) {
      setCartError(err.response?.data?.error || 'No se pudo agregar al carrito');
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      setCartError('');
      setCartSuccess('');
      const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
      applyCartResponse(data);
      setCartSuccess('Cantidad actualizada');
    } catch (err) {
      setCartError(err.response?.data?.error || 'No se pudo actualizar la cantidad');
    }
  };

  const removeCartItem = async (productId) => {
    try {
      setCartError('');
      setCartSuccess('');
      const { data } = await api.delete(`/cart/items/${productId}`);
      applyCartResponse(data);
      setCartSuccess('Producto removido del carrito');
    } catch (err) {
      setCartError(err.response?.data?.error || 'No se pudo remover el producto');
    }
  };

  const clearCart = async () => {
    try {
      setCartError('');
      setCartSuccess('');
      const { data } = await api.delete('/cart');
      applyCartResponse(data);
      setCartSuccess('Carrito limpiado');
    } catch (err) {
      setCartError(err.response?.data?.error || 'No se pudo limpiar el carrito');
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
            <label htmlFor="product-name">Nombre *</label><br />
            <input id="product-name" name="name" value={form.name} onChange={handleChange} required
              style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="product-description">Descripción</label><br />
            <textarea id="product-description" name="description" value={form.description} onChange={handleChange} rows={3}
              style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="product-price">Precio * (mayor a 0)</label><br />
              <input id="product-price" type="number" name="price" value={form.price} onChange={handleChange}
                step="0.01" min="0.01" required
                style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="product-stock">Cantidad disponible *</label><br />
              <input id="product-stock" type="number" name="stock" value={form.stock} onChange={handleChange}
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
        <h2>{isSeller && !vistaUsuario ? 'Mis productos' : 'Listado de productos'}</h2>
        {canUseCart && (
          <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Mi carrito</h3>

            {cartLoading ? <p>Cargando carrito...</p> : null}
            {cartError && <p style={{ color: 'red' }}>{cartError}</p>}
            {cartSuccess && <p style={{ color: 'green' }}>{cartSuccess}</p>}

            {!cartLoading && cart.items.length === 0 ? (
              <p>Tu carrito está vacío.</p>
            ) : (
              <>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem 0' }}>
                  {cart.items.map((item) => (
                    <li key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      borderBottom: '1px solid #eee',
                      padding: '0.5rem 0',
                    }}>
                      <span style={{ flex: 1 }}>
                        {item.product.name} · ${parseFloat(item.product.price).toFixed(2)}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={() => updateCartQuantity(item.productId, Math.max(0, item.quantity - 1))}
                          style={{ padding: '0.2rem 0.45rem', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <strong>{item.quantity}</strong>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          style={{ padding: '0.2rem 0.45rem', cursor: 'pointer' }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeCartItem(item.productId)}
                          style={{ padding: '0.2rem 0.45rem', cursor: 'pointer' }}
                        >
                          Quitar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>
                    Items: {cart.totalItems} · Subtotal: ${cart.subtotal.toFixed(2)}
                  </strong>
                  <button
                    onClick={clearCart}
                    style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                  >
                    Limpiar carrito
                  </button>
                </div>
              </>
            )}
          </section>
        )}

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

                  {canUseCart && (
                    <div
                      style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        min="1"
                        value={quantities[p.id] || 1}
                        onChange={(e) => handleQuantityInput(p.id, e.target.value)}
                        style={{ width: 58, padding: '0.25rem', boxSizing: 'border-box' }}
                      />
                      <button
                        onClick={() => addToCart(p.id)}
                        style={{ padding: '0.3rem 0.6rem', cursor: 'pointer' }}
                      >
                        Agregar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const th = { textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ddd' };
const td = { padding: '0.5rem', borderBottom: '1px solid #eee' };

export default Products;

