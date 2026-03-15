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
            {/* ─── Condición y rating en detalle ─── */}
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

function Products() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0 });
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', condition: 'nuevo', rating: '0' }); // <-- MODIFICADO
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
  const [selectedId, setSelectedId] = useState(null);

  // ─── Estado de búsqueda y filtros (N12) ─── // <-- NUEVO
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState(1000);
  const [filterMinRating, setFilterMinRating] = useState(0);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSeller = user.isVerifiedSeller === true;

  const fetchProducts = async (params = {}) => {
    try {
      const endpoint = isSeller ? '/products/my' : '/products';
      const { data } = await api.get(endpoint, { params }); // <-- MODIFICADO
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

  // ─── Ejecutar búsqueda/filtros ─── // <-- NUEVO
  const handleSearch = () => {
    fetchProducts({
      search: search || undefined,
      condition: filterCondition || undefined,
      maxPrice: filterMaxPrice,
      minRating: filterMinRating > 0 ? filterMinRating : undefined,
    });
  };

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

  
    const numericStock = Number(form.stock);
    
    if (!Number.isInteger(numericStock)) {
      setError('El stock debe ser un número entero.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', parseFloat(form.price));
      formData.append('stock', parseInt(form.stock));
      formData.append('condition', form.condition); // <-- NUEVO
      formData.append('rating', parseFloat(form.rating)); // <-- NUEVO
      if (imageFile) formData.append('image', imageFile);

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Producto publicado correctamente');
      setForm({ name: '', description: '', price: '', stock: '', condition: 'nuevo', rating: '0' });
      setImageFile(null);
      setImagePreview(null);
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
    <div style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>

      <h1 style={{ margin: '0 0 1.5rem 0' }}>{isSeller ? 'Mis Productos' : 'Productos'}</h1>

      {/* ─── Formulario publicar (solo vendedor) ─── */}
      {isSeller && (
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
            {/* ─── Condición ─── */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label>Estado del producto</label><br />
                <select name="condition" value={form.condition} onChange={handleChange}
                  style={{ width: '100%', padding: '0.4rem', boxSizing: 'border-box' }}>
                  <option value="nuevo">Nuevo</option>
                  <option value="usado">Usado</option>
                  <option value="reacondicionado">Reacondicionado</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Calificación inicial (0-5)</label><br />
                <input type="number" name="rating" value={form.rating} onChange={handleChange}
                  min="0" max="5" step="0.1"
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

      {/* ─── Layout: listado + filtros ─── */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* ─── Listado ─── */}
        <div style={{ flex: 1 }}>

          {/* ─── Barra de búsqueda (N12) ─── */}
          {!isSeller && (
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
          )}

          <h2 style={{ marginTop: 0 }}>{isSeller ? 'Tus productos publicados' : 'Listado de productos'}</h2>
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

        {/* ─── Panel de filtros derecho (solo usuario) ─── */}
        {!isSeller && (
          <div style={{
            width: 200, flexShrink: 0, border: '1px solid #ddd', borderRadius: 8,
            padding: '1rem', background: '#fafafa',
          }}>
            <h3 style={{ marginTop: 0, fontSize: '0.95rem' }}>Filtros</h3>

            {/* Precio máximo */}
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
        )}
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

const th = { textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #ddd' };
const td = { padding: '0.5rem', borderBottom: '1px solid #eee' };

export default Products;

