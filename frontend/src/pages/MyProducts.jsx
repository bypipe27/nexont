import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import ChatWidget from '../components/ChatWidget';
import AssistedTopBar from '../components/assisted/AssistedTopBar';
import { ensureSellerStyles } from '../components/seller/sellerStyles';

ensureSellerStyles();

const CATEGORY_OPTIONS = [
  { value: 'ELECTRONICA_TECNOLOGIA', label: 'Electrónica y Tecnología' },
  { value: 'HOGAR_DECORACION', label: 'Hogar y Decoración' },
  { value: 'MODA_ACCESORIOS', label: 'Moda y Accesorios' },
  { value: 'SALUD_BELLEZA', label: 'Salud y Belleza' },
  { value: 'DEPORTES_FITNESS', label: 'Deportes y Fitness' },
  { value: 'JUGUETES_BEBES', label: 'Juguetes y Bebés' },
  { value: 'AUTOMOTRIZ', label: 'Automotriz' },
  { value: 'LIBROS_MUSICA_ENTRETENIMIENTO', label: 'Libros, Música y Entretenimiento' },
  { value: 'ALIMENTOS_BEBIDAS', label: 'Alimentos y Bebidas' },
  { value: 'SERVICIOS_OTROS', label: 'Servicios y Otros' },
];

const getCategoryLabel = (value) => {
  return CATEGORY_OPTIONS.find(option => option.value === value)?.label || 'Servicios y Otros';
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`nxmp-toast ${type}`}>
      <span>{message}</span>
      <button className="nxmp-toast-x" onClick={onClose}>✕</button>
    </div>
  );
}

// ─── Modal Publicar ───────────────────────────────────────────────────────────
function PublishModal({ isOpen, onClose, onPublished }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'NUEVO', categoria: 'SERVICIOS_OTROS' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImage = e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } };
  const handleClose = () => {
    setForm({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'NUEVO', categoria: 'SERVICIOS_OTROS' });
    setImageFile(null); setImagePreview(null); setError(''); setSuccess('');
    onClose();
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!Number.isInteger(Number(form.stock))) { setError('El stock debe ser un número entero.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('titulo', form.titulo); fd.append('descripcion', form.descripcion);
      fd.append('precio', parseFloat(form.precio)); fd.append('stock', parseInt(form.stock));
      fd.append('condicion', form.condicion); fd.append('categoria', form.categoria);
      fd.append('promedioCalificacion', 0);
      if (imageFile) fd.append('imagen', imageFile);
      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Producto publicado correctamente.');
      if (onPublished) onPublished();
      setTimeout(() => handleClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.details?.join(', ') || err.response?.data?.error || 'Error al publicar.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="nxpm-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="nxpm-modal">
        <div className="nxpm-head">
          <div><div className="nxpm-head-tag">Nuevo producto</div><div className="nxpm-head-title">Publicar producto</div></div>
          <button className="nxpm-close" onClick={handleClose}>✕</button>
        </div>
        <div className="nxpm-body">
          {error && <div className="nxpm-modal-err">{error}</div>}
          {success && <div className="nxpm-modal-ok">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="nxpm-f"><label>Nombre del producto *</label><input name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Ej: Silla Eames vintage" /></div>
            <div className="nxpm-f"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Describe las características principales…" /></div>
            <div className="nxpm-f-row">
              <div className="nxpm-f"><label>Precio (USD) *</label><input type="number" name="precio" value={form.precio} onChange={handleChange} step="0.01" min="0.01" required placeholder="0.00" /></div>
              <div className="nxpm-f"><label>Stock *</label><input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" required placeholder="0" /></div>
            </div>
            <div className="nxpm-f"><label>Estado</label>
              <select name="condicion" value={form.condicion} onChange={handleChange}>
                <option value="NUEVO">Nuevo</option><option value="USADO">Usado</option><option value="REACONDICIONADO">Reacondicionado</option>
              </select>
            </div>
            <div className="nxpm-f"><label>Categoría</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}>
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="nxpm-f">
              <label>Imagen del producto</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="nxpm-file-hidden" ref={fileInputRef} />
              <div className="nxpm-img-zone" onClick={() => fileInputRef.current?.click()}>
                <span className="nxpm-img-icon">📷</span>
                <div className="nxpm-img-txt">{imageFile ? <b>{imageFile.name}</b> : <><b>Haz clic o arrastra</b> una imagen<br /><span style={{ fontSize: '0.68rem', opacity: 0.6 }}>JPG, PNG o WEBP · Máx. 5MB</span></>}</div>
              </div>
              {imagePreview && <div className="nxpm-img-preview"><img src={imagePreview} alt="preview" /><button type="button" className="nxpm-img-remove" onClick={() => { setImageFile(null); setImagePreview(null); }}>✕ Quitar</button></div>}
            </div>
            <div className="nxpm-foot">
              <button type="button" className="nxpm-cancel" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="nxpm-submit" disabled={loading}>{loading ? 'Publicando…' : 'Publicar producto →'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Editar ─────────────────────────────────────────────────────────────
function EditProductModal({ isOpen, onClose, product, onProductUpdated }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'NUEVO', categoria: 'SERVICIOS_OTROS' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setForm({
        titulo: product.titulo || '',
        descripcion: product.descripcion || '',
        precio: product.precio || '',
        stock: product.stock || '',
        condicion: product.condicion || 'NUEVO',
        categoria: product.categoria || 'SERVICIOS_OTROS',
      });
      setImagePreview(product.imagenes?.[0]?.url || null);
      setImageFile(null);
    }
  }, [product]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImage = e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } };
  const handleClose = () => { setError(''); onClose(); };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('titulo', form.titulo); fd.append('descripcion', form.descripcion);
      fd.append('precio', parseFloat(form.precio)); fd.append('stock', parseInt(form.stock));
      fd.append('condicion', form.condicion); fd.append('categoria', form.categoria);
      fd.append('promedioCalificacion', product?.promedioCalificacion || 0);
      if (imageFile) fd.append('imagen', imageFile);
      await api.put(`/products/${product.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (onProductUpdated) onProductUpdated();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.details?.join(', ') || err.response?.data?.error || 'Error al actualizar el producto');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="nxpm-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="nxpm-modal">
        <div className="nxpm-head">
          <div><div className="nxpm-head-tag">Editar producto</div><div className="nxpm-head-title">{product?.titulo || 'Producto'}</div></div>
          <button className="nxpm-close" onClick={handleClose}>✕</button>
        </div>
        <div className="nxpm-body">
          {error && <div className="nxpm-modal-err">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="nxpm-f"><label>Nombre del producto *</label><input name="titulo" value={form.titulo} onChange={handleChange} required /></div>
            <div className="nxpm-f"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={handleChange} /></div>
            <div className="nxpm-f-row">
              <div className="nxpm-f"><label>Precio (USD) *</label><input type="number" name="precio" value={form.precio} onChange={handleChange} step="0.01" min="0.01" required /></div>
              <div className="nxpm-f"><label>Stock *</label><input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" required /></div>
            </div>
            <div className="nxpm-f"><label>Estado</label>
              <select name="condicion" value={form.condicion} onChange={handleChange}>
                <option value="NUEVO">Nuevo</option><option value="USADO">Usado</option><option value="REACONDICIONADO">Reacondicionado</option>
              </select>
            </div>
            <div className="nxpm-f"><label>Categoría</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}>
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="nxpm-f">
              <label>Imagen del producto</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="nxpm-file-hidden" ref={fileInputRef} />
              <div className="nxpm-img-zone" onClick={() => fileInputRef.current?.click()}>
                <span className="nxpm-img-icon">📷</span>
                <div className="nxpm-img-txt">{imageFile ? <b>{imageFile.name}</b> : <><b>Haz clic o arrastra</b> para cambiar la imagen</>}</div>
              </div>
              {imagePreview && <div className="nxpm-img-preview"><img src={imagePreview} alt="preview" /><button type="button" className="nxpm-img-remove" onClick={() => { setImageFile(null); setImagePreview(null); }}>✕ Quitar</button></div>}
            </div>
            <div className="nxpm-foot">
              <button type="button" className="nxpm-cancel" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="nxpm-submit" disabled={loading}>{loading ? 'Guardando…' : 'Guardar cambios →'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Eliminar ───────────────────────────────────────────────────────────
function DeleteConfirmModal({ isOpen, onClose, onConfirm, productName, loading }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="nxpm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nxpm-modal" style={{ maxWidth: 420 }}>
        <div className="nxpm-head">
          <div><div className="nxpm-head-tag">Acción irreversible</div><div className="nxpm-head-title">Eliminar producto</div></div>
          <button className="nxpm-close" onClick={onClose}>✕</button>
        </div>
        <div className="nxpm-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Estás a punto de eliminar <strong>"{productName}"</strong>. Esta acción no se puede deshacer y la imagen también será borrada de Cloudinary.
          </p>
          <div className="nxpm-foot" style={{ justifyContent: 'center' }}>
            <button className="nxpm-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
            <button className="nxpm-submit danger" onClick={onConfirm} disabled={loading}>{loading ? 'Eliminando…' : 'Sí, eliminar →'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
function MyProducts() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearch] = useState('');
  const [fCond, setFCond] = useState('');
  const [fMaxPrice, setFMaxPrice] = useState(1000);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [ddOpen, setDdOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const aiPrefill = 'Necesito ayuda para impulsar ventas. Analiza mi producto y dame precio bajo (venta rapida), precio promedio y precio alto (mayor ganancia), y sugerencias de titulo y descripcion. Detalles del producto: [pega aqui].';

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const initials = user ? `${(user.nombres || '')[0] || ''}${(user.apellidos || '')[0] || ''}`.toUpperCase() : '';
  const stars = n => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  const fetchMyProducts = async (params = {}) => {
    if (fetching) return;
    try {
      setFetching(true); setLoading(true); setError('');
      const { data } = await api.get('/products/my', { params });
      setProducts(data.products || []);
    } catch (err) {
      if (err.response?.status === 429) setError('Demasiadas peticiones. Por favor espera un momento.');
      else if (err.response?.status === 401) { setError('Tu sesión expiró.'); navigate('/login'); }
      else setError(err.response?.data?.error || 'Error al cargar tus productos');
    } finally { setLoading(false); setFetching(false); }
  };

  useEffect(() => { if (!token || !user?.esVendedorVerificado) { navigate('/'); return; } fetchMyProducts(); }, [token]);

  const doSearch = () => fetchMyProducts({ search: searchTerm || undefined, condition: fCond || undefined, maxPrice: fMaxPrice });
  const doClear = () => { setSearch(''); setFCond(''); setFMaxPrice(1000); fetchMyProducts(); };

  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deleteProduct.id}`);
      setDeleteProduct(null);
      setToast({ message: 'Producto eliminado correctamente', type: 'success' });
      fetchMyProducts();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error al eliminar el producto', type: 'error' });
    } finally { setDeleteLoading(false); }
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return (a.precio || 0) - (b.precio || 0);
    if (sortBy === 'price-high') return (b.precio || 0) - (a.precio || 0);
    if (sortBy === 'rating') return (b.promedioCalificacion || 0) - (a.promedioCalificacion || 0);
    return 0;
  });

  const inStock = products.filter(p => p.stock > 0).length;
  const outStock = products.filter(p => p.stock === 0).length;
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);

  return (
    <div className="nxmp-root">
      <AssistedTopBar active="tienda" />

      {/* ── Contenido ── */}
      <div className="nxmp-page">
        <div className="nxmp-eyebrow">Panel de vendedor</div>
        <h1 className="nxmp-page-title">Mis Productos</h1>
        <p className="nxmp-page-sub">Gestiona y visualiza todos los productos que has publicado</p>

        {/* Stats */}
        <div className="nxmp-stats">
          <div className="nxmp-stat"><span className="nxmp-stat-val">{products.length}</span><span className="nxmp-stat-lbl">Publicados</span></div>
          <div className="nxmp-stat"><span className="nxmp-stat-val green">{inStock}</span><span className="nxmp-stat-lbl">Con stock</span></div>
          <div className="nxmp-stat"><span className="nxmp-stat-val red">{outStock}</span><span className="nxmp-stat-lbl">Sin stock</span></div>
          <div className="nxmp-stat"><span className="nxmp-stat-val amber">{totalStock}</span><span className="nxmp-stat-lbl">Unidades</span></div>
        </div>

        <section className="nxmp-ai">
          <div>
            <div className="nxmp-ai-title">Impulsa ventas con IA</div>
            <div className="nxmp-ai-text">Consulta precios recomendados, mejora tus descripciones y descubre que elementos potencian tus publicaciones.</div>
          </div>
          <button className="nxmp-ai-btn" onClick={() => setShowChat(true)}>Hablar con Cardel</button>
        </section>

        <div className="nxmp-layout">
          {/* Sidebar filtros */}
          <aside className="nxmp-sidebar">
            <div className="nxmp-sb-head"><span className="nxmp-sb-title">Filtros</span></div>
            <div className="nxmp-sb-sec">
              <span className="nxmp-sb-sec-title">Buscar</span>
              <input className="nxmp-sb-search" placeholder="Nombre del producto…" value={searchTerm} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
            </div>
            <div className="nxmp-sb-sec">
              <span className="nxmp-sb-sec-title">Estado</span>
              {['', 'NUEVO', 'USADO', 'REACONDICIONADO'].map(c => (
                <label key={c} className="nxmp-radio">
                  <input type="radio" name="mpcond" value={c} checked={fCond === c} onChange={() => setFCond(c)} />
                  <span>{c === '' ? 'Todos' : c.charAt(0) + c.slice(1).toLowerCase()}</span>
                </label>
              ))}
            </div>
            <div className="nxmp-sb-sec">
              <span className="nxmp-sb-sec-title">Precio máximo</span>
              <input type="range" min="0" max="1000" step="10" value={fMaxPrice} onChange={e => setFMaxPrice(Number(e.target.value))} className="nxmp-range" />
              <div className="nxmp-range-row"><span>$0</span><span className="nxmp-range-val">${fMaxPrice}</span><span>$1000+</span></div>
            </div>
            <div className="nxmp-sb-btns">
              <button className="nxmp-sb-apply" onClick={doSearch}>Aplicar filtros</button>
              <button className="nxmp-sb-clear" onClick={doClear}>Limpiar</button>
              <button className="nxmp-sb-new" onClick={() => setShowModal(true)}>+ Nuevo producto</button>
            </div>
          </aside>

          {/* Grid de productos */}
          <div className="nxmp-main">
            {error && <div className="nxmp-err">{error}</div>}
            <div className="nxmp-toolbar">
              <div className="nxmp-count">Total: <b>{sorted.length}</b> producto{sorted.length !== 1 ? 's' : ''}</div>
              <select className="nxmp-sortsel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Más reciente</option>
                <option value="price-low">Menor precio</option>
                <option value="price-high">Mayor precio</option>
                <option value="rating">Mejor calificación</option>
              </select>
            </div>

            {loading
              ? <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-ghost)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cargando…</div>
              : sorted.length === 0
                ? (
                  <div className="nxmp-empty">
                    <div className="nxmp-empty-title">Aún no tienes productos</div>
                    <p className="nxmp-empty-sub">Publica tu primer producto y empieza a vender en Nexont.</p>
                    <button className="nxmp-pub-btn" onClick={() => setShowModal(true)}>+ Publicar primer producto</button>
                  </div>
                )
                : (
                  <div className="nxmp-grid">
                    {sorted.map(p => (
                      <div key={p.id} className="nxmp-card">
                        <div className="nxmp-card-img">
                          {p.imagenes?.[0]?.url
                            ? <img src={p.imagenes[0].url} alt={p.titulo} />
                            : <div className="nxmp-card-noimg">Sin imagen</div>}
                          <span className="nxmp-card-stock-badge">Stock: {p.stock}</span>
                        </div>
                        <div className="nxmp-card-body">
                          <div className="nxmp-card-cond">{p.condicion || 'NUEVO'}</div>
                          <div className="nxmp-card-cat">{getCategoryLabel(p.categoria)}</div>
                          <div className="nxmp-card-name">{p.titulo}</div>
                          <div className="nxmp-card-price">${(parseFloat(p.precio) || 0).toFixed(2)}</div>
                          <div className="nxmp-card-stars">{stars(p.promedioCalificacion)}</div>
                          <div className="nxmp-card-foot">
                            <span className={`nxmp-avail ${p.stock > 0 ? 'ok' : 'out'}`}>{p.stock > 0 ? '● Disponible' : '● Agotado'}</span>
                            <div className="nxmp-card-actions">
                              <button className="nxmp-btn-edit" onClick={() => setEditProduct(p)}>Editar</button>
                              <button className="nxmp-btn-del" onClick={() => setDeleteProduct(p)}>Eliminar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
            }
          </div>
        </div>
      </div>

      {/* Modales */}
      <PublishModal isOpen={showModal} onClose={() => setShowModal(false)} onPublished={() => fetchMyProducts()} />
      <EditProductModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
        onProductUpdated={() => { fetchMyProducts(); setToast({ message: 'Producto actualizado correctamente', type: 'success' }); }}
      />
      <DeleteConfirmModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleConfirmDelete}
        productName={deleteProduct?.titulo || ''}
        loading={deleteLoading}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showChat && <ChatWidget onClose={() => setShowChat(false)} initialInput={aiPrefill} />}
    </div>
  );
}

export default MyProducts;