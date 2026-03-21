import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function PublishProductModal({ isOpen, onClose, onProductPublished }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'NUEVO', promedioCalificacion: '0' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

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
      setError('El stock debe ser un numero entero.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('descripcion', form.descripcion);
      formData.append('precio', parseFloat(form.precio));
      formData.append('stock', parseInt(form.stock));
      formData.append('condicion', form.condicion);
      formData.append('promedioCalificacion', parseFloat(form.promedioCalificacion));
      if (imageFile) formData.append('imagen', imageFile);

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Producto publicado correctamente');
      setForm({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'nuevo', promedioCalificacion: '0' });
      setImageFile(null);
      setImagePreview(null);
      if (onProductPublished) onProductPublished();
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.details
        ? err.response.data.details.join(', ')
        : err.response?.data?.error || 'Error al publicar el producto';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      onClick={() => onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3000, padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 8, padding: '2rem',
          width: '100%', maxWidth: 600, position: 'relative',
          fontFamily: 'sans-serif', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <button
          onClick={() => onClose()}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', fontSize: '1.5rem',
            cursor: 'pointer', color: '#888',
          }}
        >
          X
        </button>

        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Publicar nuevo producto</h2>

        {error && <p style={{ color: 'red', marginBottom: '0.75rem', background: '#fee2e2', padding: '0.75rem', borderRadius: 4 }}>{error}</p>}
        {success && <p style={{ color: 'green', marginBottom: '0.75rem', background: '#dcfce7', padding: '0.75rem', borderRadius: 4 }}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Nombre *</label>
            <input name="titulo" value={form.titulo} onChange={handleChange} required
              style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: 4, border: '1px solid #ddd', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Descripcion</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
              style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: 4, border: '1px solid #ddd', fontFamily: 'sans-serif', fontSize: '1rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Precio * (mayor a 0)</label>
              <input type="number" name="precio" value={form.precio} onChange={handleChange}
                step="0.01" min="0.01" required
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: 4, border: '1px solid #ddd', fontSize: '1rem' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Stock *</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange}
                min="0" required
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: 4, border: '1px solid #ddd', fontSize: '1rem' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Estado</label>
              <select name="condicion" value={form.condicion} onChange={handleChange}
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: 4, border: '1px solid #ddd', fontSize: '1rem' }}>
                <option value="NUEVO">Nuevo</option>
                <option value="USADO">Usado</option>
                <option value="REACONDICIONADO">Reacondicionado</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Calificacion inicial 0-5</label>
              <input type="number" name="promedioCalificacion" value={form.promedioCalificacion} onChange={handleChange}
                min="0" max="5" step="0.1"
                style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box', borderRadius: 4, border: '1px solid #ddd', fontSize: '1rem' }} />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Imagen</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange}
              style={{ display: 'block' }} />
            {imagePreview && (
              <img src={imagePreview} alt="preview"
                style={{ marginTop: '1rem', width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 6 }} />
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => onClose()}
              style={{ padding: '0.7rem 1.5rem', cursor: 'pointer', background: '#f3f4f6', color: '#666', border: 'none', borderRadius: 6, fontWeight: 600 }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              style={{ padding: '0.7rem 1.5rem', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#ccc' : '#007bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MyProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState(1000);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isFetching, setIsFetching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchMyProducts = async (params = {}) => {
    if (isFetching) return; // Evitar múltiples requests simultáneos
    
    try {
      setIsFetching(true);
      setLoading(true);
      setError('');
      const { data } = await api.get('/products/my', { params });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      if (err.response?.status === 429) {
        setError('Demasiadas peticiones. Por favor espera un momento.');
      } else if (err.response?.status === 401) {
        setError('Tu sesión expiró. Por favor vuelve a iniciar sesión.');
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Error al cargar tus productos');
      }
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!token || !user?.esVendedorVerificado) {
      navigate('/');
      return;
    }
    fetchMyProducts();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const handleSearch = () => {
    fetchMyProducts({
      search: searchTerm || undefined,
      condition: filterCondition || undefined,
      maxPrice: filterMaxPrice,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCondition('');
    setFilterMaxPrice(1000);
    fetchMyProducts();
  };

  const filteredProducts = products
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return (a.price || 0) - (b.price || 0);
        case 'price-high': return (b.price || 0) - (a.price || 0);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <nav style={{
        background: '#1a1a1a', padding: '0.75rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', position: 'sticky',
        top: 0, zIndex: 100, borderBottom: '1px solid #333'
      }}>
        <div onClick={() => navigate('/')} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <img src="/resources/icone.png" alt="Nexont" style={{ height: '32px', width: 'auto' }} />
          <h1 style={{ color: 'white', margin: 0, fontSize: '1.3rem', cursor: 'pointer', fontWeight: '700', letterSpacing: '0.5px' }}>Nexont</h1>
        </div>

        <div data-dropdown style={{ position: 'relative' }}>
          {token && user ? (
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)', color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)', padding: '0.6rem 1rem',
                  borderRadius: '6px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem',
                  fontWeight: '500', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                👤 {user.firstName}
                <span style={{ fontSize: '0.8rem' }}>▼</span>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, background: 'white',
                  borderRadius: '8px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  minWidth: '220px', marginTop: '0.5rem', zIndex: 1000
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#f3f4f6'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>👤 Mi perfil</span>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#f3f4f6'} onMouseLeave={(e) => e.target.style.background = 'transparent'} onClick={() => { setDropdownOpen(false); navigate('/orders'); }}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>📦 Mis órdenes</span>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#f3f4f6'} onMouseLeave={(e) => e.target.style.background = 'transparent'} onClick={() => { setDropdownOpen(false); navigate('/'); }}>
                    <span style={{ color: '#374151', fontWeight: '500' }}>🏠 Volver al catálogo</span>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#fee2e2'} onMouseLeave={(e) => e.target.style.background = 'transparent'} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); }}>
                    <span style={{ color: '#991b1b', fontWeight: '500' }}>🚪 Cerrar sesión</span>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0' }}>Mis Productos</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Gestiona y visualiza los productos que has publicado</p>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <aside style={{ width: '250px', flexShrink: 0 }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#1f2937', margin: '0 0 1rem 0' }}>Filtros</h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Buscar</label>
                <input
                  type="text"
                  placeholder="Nombre del producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>Estado</h4>
                {['', 'nuevo', 'usado', 'reacondicionado'].map((c) => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" name="filterCondition" value={c}
                      checked={filterCondition === c}
                      onChange={() => setFilterCondition(c)}
                      style={{ marginRight: '0.5rem' }} />
                    <span>{c === '' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}</span>
                  </label>
                ))}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem' }}>Rango de Precio</h4>
                <input type="range" min="0" max="1000" step="10"
                  value={filterMaxPrice}
                  onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  <span>$0</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>${filterMaxPrice}</span>
                  <span>$1000+</span>
                </div>
              </div>

              <button onClick={handleSearch} style={{
                width: '100%', padding: '0.5rem', borderRadius: '6px',
                border: '1px solid #d1d5db', background: '#667eea',
                color: 'white', fontWeight: '600', cursor: 'pointer', marginBottom: '0.5rem', fontSize: '0.9rem'
              }}>
                Aplicar filtros
              </button>
              <button onClick={handleClearFilters} style={{
                width: '100%', padding: '0.5rem', borderRadius: '6px',
                border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: '0.9rem'
              }}>
                Limpiar
              </button>
            </div>

            <button
              onClick={() => setShowPublishModal(true)}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 6, border: 'none',
                background: '#28a745', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem'
              }}
            >
              + Agregar Producto
            </button>
          </aside>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                Total: <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{filteredProducts.length}</span> producto(s)
              </p>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem', cursor: 'pointer' }}>
                <option value="newest">Mas reciente</option>
                <option value="price-low">Menor precio</option>
                <option value="price-high">Mayor precio</option>
                <option value="rating">Mejor calificacion</option>
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#6b7280' }}>Cargando productos...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#991b1b' }}>
                <p>{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#6b7280' }}>No tienes productos publicados</p>
                <button
                  onClick={() => setShowPublishModal(true)}
                  style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                >
                  Publicar tu primer producto
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', transition: 'box-shadow 0.3s, transform 0.3s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '1', background: '#f3f4f6', overflow: 'hidden' }}>
                      {product.imagenes && product.imagenes.length > 0 && product.imagenes[0]?.url ? (
                        <img
                          src={product.imagenes[0].url}
                          alt={product.titulo || 'Producto'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '0.9rem' }}>
                          Sin imagen
                        </div>
                      )}
                      <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: '#667eea', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#667eea', textTransform: 'uppercase', marginBottom: '0.25rem', margin: 0 }}>
                        {product.condicion || 'NUEVO'}
                      </p>
                      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.75rem', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                        {product.titulo}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                            ${(parseFloat(product.precio) || 0).toFixed(2)}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: '#f5a623', margin: 0 }}>
                            {'★'.repeat(Math.round(product.promedioCalificacion || 0))}{'☆'.repeat(5 - Math.round(product.promedioCalificacion || 0))}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                          {product.stock > 0 ? 'Disponible' : 'Agotado'}
                        </span>
                      </div>
                      <div style={{ borderTop: '1px solid #eee', marginTop: '0.75rem', paddingTop: '0.75rem', fontSize: '0.82rem', color: '#555' }}>
                        {product.vendedor?.nombres} {product.vendedor?.apellidos}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '0.4rem' }}>
                        Editar/Borrar →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PublishProductModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onProductPublished={() => fetchMyProducts()}
      />
    </div>
  );
}

export default MyProducts;
