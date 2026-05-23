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
    <div className="nxpm-overlay" onClick={e => e.target === e.currentTarget && handleClose()} role="dialog" aria-modal="true" aria-labelledby="modal-title-pub">
      <div className="nxpm-modal">
        <div className="nxpm-head">
          <div><div className="nxpm-head-tag">Nuevo producto</div><h2 className="nxpm-head-title" id="modal-title-pub">Publicar producto</h2></div>
          <button className="nxpm-close" onClick={handleClose} aria-label="Cerrar modal">✕</button>
        </div>
        <div className="nxpm-body">
          {error && <div className="nxpm-modal-err" role="alert">{error}</div>}
          {success && <div className="nxpm-modal-ok" role="status">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="nxpm-f"><label htmlFor="pub-titulo">Nombre del producto *</label><input id="pub-titulo" name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Ej: Silla Eames vintage" /></div>
            <div className="nxpm-f"><label htmlFor="pub-desc">Descripción</label><textarea id="pub-desc" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Describe las características principales…" /></div>
            <div className="nxpm-f-row">
              <div className="nxpm-f"><label htmlFor="pub-price">Precio (USD) *</label><input type="number" id="pub-price" name="precio" value={form.precio} onChange={handleChange} step="0.01" min="0.01" required placeholder="0.00" /></div>
              <div className="nxpm-f"><label htmlFor="pub-stock">Stock *</label><input type="number" id="pub-stock" name="stock" value={form.stock} onChange={handleChange} min="0" required placeholder="0" /></div>
            </div>
            <div className="nxpm-f"><label htmlFor="pub-cond">Estado</label>
              <select id="pub-cond" name="condicion" value={form.condicion} onChange={handleChange}>
                <option value="NUEVO">Nuevo</option><option value="USADO">Usado</option><option value="REACONDICIONADO">Reacondicionado</option>
              </select>
            </div>
            <div className="nxpm-f"><label htmlFor="pub-cat">Categoría</label>
              <select id="pub-cat" name="categoria" value={form.categoria} onChange={handleChange}>
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="nxpm-f">
              <label htmlFor="pub-file">Imagen del producto</label>
              <input type="file" id="pub-file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="nxpm-file-hidden" ref={fileInputRef} aria-label="Seleccionar imagen" />
              <div className="nxpm-img-zone" onClick={() => fileInputRef.current?.click()} role="button" tabIndex="0" onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()} aria-label="Subir imagen">
                <span className="nxpm-img-icon" aria-hidden="true">📷</span>
                <div className="nxpm-img-txt">{imageFile ? <b>{imageFile.name}</b> : <><b>Haz clic o arrastra</b> una imagen<br /><span style={{ fontSize: '0.68rem', opacity: 0.6 }}>JPG, PNG o WEBP · Máx. 5MB</span></>}</div>
              </div>
              {imagePreview && <div className="nxpm-img-preview"><img src={imagePreview} alt="Vista previa del producto" /><button type="button" className="nxpm-img-remove" onClick={() => { setImageFile(null); setImagePreview(null); }} aria-label="Quitar imagen">✕ Quitar</button></div>}
            </div>
            <div className="nxpm-foot">
              <button type="button" className="nxpm-cancel" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="nxpm-submit" disabled={loading} aria-busy={loading}>{loading ? 'Publicando…' : 'Publicar producto →'}</button>
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
    <div className="nxpm-overlay" onClick={e => e.target === e.currentTarget && handleClose()} role="dialog" aria-modal="true" aria-labelledby="modal-title-edit">
      <div className="nxpm-modal">
        <div className="nxpm-head">
          <div><div className="nxpm-head-tag">Editar producto</div><h2 className="nxpm-head-title" id="modal-title-edit">{product?.titulo || 'Producto'}</h2></div>
          <button className="nxpm-close" onClick={handleClose} aria-label="Cerrar modal">✕</button>
        </div>
        <div className="nxpm-body">
          {error && <div className="nxpm-modal-err" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="nxpm-f"><label htmlFor="edit-titulo">Nombre del producto *</label><input id="edit-titulo" name="titulo" value={form.titulo} onChange={handleChange} required /></div>
            <div className="nxpm-f"><label htmlFor="edit-desc">Descripción</label><textarea id="edit-desc" name="descripcion" value={form.descripcion} onChange={handleChange} /></div>
            <div className="nxpm-f-row">
              <div className="nxpm-f"><label htmlFor="edit-price">Precio (USD) *</label><input type="number" id="edit-price" name="precio" value={form.precio} onChange={handleChange} step="0.01" min="0.01" required /></div>
              <div className="nxpm-f"><label htmlFor="edit-stock">Stock *</label><input type="number" id="edit-stock" name="stock" value={form.stock} onChange={handleChange} min="0" required /></div>
            </div>
            <div className="nxpm-f"><label htmlFor="edit-cond">Estado</label>
              <select id="edit-cond" name="condicion" value={form.condicion} onChange={handleChange}>
                <option value="NUEVO">Nuevo</option><option value="USADO">Usado</option><option value="REACONDICIONADO">Reacondicionado</option>
              </select>
            </div>
            <div className="nxpm-f"><label htmlFor="edit-cat">Categoría</label>
              <select id="edit-cat" name="categoria" value={form.categoria} onChange={handleChange}>
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="nxpm-f">
              <label htmlFor="edit-file">Imagen del producto</label>
              <input type="file" id="edit-file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="nxpm-file-hidden" ref={fileInputRef} aria-label="Cambiar imagen" />
              <div className="nxpm-img-zone" onClick={() => fileInputRef.current?.click()} role="button" tabIndex="0" onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}>
                <span className="nxpm-img-icon" aria-hidden="true">📷</span>
                <div className="nxpm-img-txt">{imageFile ? <b>{imageFile.name}</b> : <><b>Haz clic o arrastra</b> para cambiar la imagen</>}</div>
              </div>
              {imagePreview && <div className="nxpm-img-preview"><img src={imagePreview} alt="Vista previa" /><button type="button" className="nxpm-img-remove" onClick={() => { setImageFile(null); setImagePreview(null); }} aria-label="Quitar imagen">✕ Quitar</button></div>}
            </div>
            <div className="nxpm-foot">
              <button type="button" className="nxpm-cancel" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="nxpm-submit" disabled={loading} aria-busy={loading}>{loading ? 'Guardando…' : 'Guardar cambios →'}</button>
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
    <div className="nxpm-overlay" onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-labelledby="del-title">
      <div className="nxpm-modal" style={{ maxWidth: 420 }}>
        <div className="nxpm-head">
          <div><div className="nxpm-head-tag">Acción irreversible</div><h2 className="nxpm-head-title" id="del-title">Eliminar producto</h2></div>
          <button className="nxpm-close" onClick={onClose} aria-label="Cerrar modal">✕</button>
        </div>
        <div className="nxpm-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">⚠️</div>
          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Estás a punto de eliminar <strong>"{productName}"</strong>. Esta acción no se puede deshacer y la imagen también será borrada de Cloudinary.
          </p>
          <div className="nxpm-foot" style={{ justifyContent: 'center' }}>
            <button className="nxpm-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
            <button className="nxpm-submit danger" onClick={onConfirm} disabled={loading} aria-busy={loading}>{loading ? 'Eliminando…' : 'Sí, eliminar →'}</button>
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
  const getStockStatus = (stock) => {
    if (stock === 0) return { key: 'out', label: 'Sin stock' };
    if (stock <= 3) return { key: 'low', label: 'Stock bajo' };
    return { key: 'ok', label: 'Disponible' };
  };

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

  const doSearch = () => fetchMyProducts({ search: searchTerm || undefined, condition: fCond || undefined });
  const doClear = () => { setSearch(''); setFCond(''); fetchMyProducts(); };

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
      <main className="nxmp-page" id="main-content">
        <header className="nxmp-summary">
          <div className="nxmp-eyebrow">Panel de vendedor</div>
          <h1 className="nxmp-page-title">Mis productos</h1>
          <div className="nxmp-summary-grid" role="region" aria-label="Resumen de inventario">
            <div className="nxmp-summary-card">
              <span className="nxmp-summary-label">Productos activos</span>
              <span className="nxmp-summary-value">{products.length}</span>
            </div>
            <div className="nxmp-summary-card">
              <span className="nxmp-summary-label">Con stock</span>
              <span className="nxmp-summary-value">{inStock}</span>
            </div>
            <div className="nxmp-summary-card">
              <span className="nxmp-summary-label">Sin stock</span>
              <span className="nxmp-summary-value">{outStock}</span>
            </div>
            <div className="nxmp-summary-card">
              <span className="nxmp-summary-label">Stock total</span>
              <span className="nxmp-summary-value">{totalStock}</span>
            </div>
          </div>
        </header>

        <section className="nxmp-ai" aria-labelledby="ai-title">
          <div>
            <div className="nxmp-ai-title" id="ai-title">Impulsa ventas con IA</div>
            <div className="nxmp-ai-text">Consulta precios recomendados, mejora tus descripciones y descubre que elementos potencian tus publicaciones.</div>
          </div>
          <button className="nxmp-ai-btn" onClick={() => setShowChat(true)} aria-label="Abrir chat con el asistente de IA Cardel">Hablar con Cardel</button>
        </section>

        <div className="nxmp-controls">
          <div>
            <h2 className="nxmp-section-title">Inventario de productos</h2>
            <p className="nxmp-section-sub">Gestiona y organiza tu catalogo publicado.</p>
          </div>
          <div className="nxmp-controls-actions">
            <div className="nxmp-search" role="search">
              <input
                placeholder="Buscar producto"
                aria-label="Buscar producto por nombre"
                value={searchTerm}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
              />
              <span className="material-symbols-outlined nxmp-search-icon" aria-hidden="true">search</span>
            </div>
            <button className="nxmp-new-btn" onClick={() => setShowModal(true)} aria-label="Publicar un nuevo producto">
              + Nuevo producto
            </button>
          </div>
        </div>

        <section className="nxmp-filterbar" aria-label="Filtros y ordenación">
          <div className="nxmp-filter">
            <label id="lbl-fcond">Estado</label>
            <select value={fCond} onChange={e => setFCond(e.target.value)} aria-labelledby="lbl-fcond">
              <option value="">Todos</option>
              <option value="NUEVO">Nuevo</option>
              <option value="USADO">Usado</option>
              <option value="REACONDICIONADO">Reacondicionado</option>
            </select>
          </div>
          <div className="nxmp-filter-actions">
            <button className="nxmp-filter-btn" onClick={doSearch} aria-label="Aplicar filtros de búsqueda">Aplicar</button>
            <button className="nxmp-filter-btn ghost" onClick={doClear} aria-label="Limpiar filtros de búsqueda">Limpiar</button>
          </div>
        </section>

        <section className="nxmp-list" aria-label="Lista de mis productos">
          {error && <div className="nxmp-err" role="alert">{error}</div>}
          <div className="nxmp-toolbar">
            <div className="nxmp-count" aria-live="polite">Total: <b>{sorted.length}</b> producto{sorted.length !== 1 ? 's' : ''}</div>
            <select className="nxmp-sortsel" value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Ordenar por">
              <option value="newest">Mas reciente</option>
              <option value="price-low">Menor precio</option>
              <option value="price-high">Mayor precio</option>
              <option value="rating">Mejor calificacion</option>
            </select>
          </div>

          {loading ? (
            <div className="nxmp-loading" role="status">Cargando…</div>
          ) : sorted.length === 0 ? (
            <div className="nxmp-empty">
              <div className="nxmp-empty-title">Aun no tienes productos</div>
              <p className="nxmp-empty-sub">Publica tu primer producto y empieza a vender en Nexont.</p>
              <button className="nxmp-pub-btn" onClick={() => setShowModal(true)} aria-label="Publicar mi primer producto">
                + Publicar primer producto
              </button>
            </div>
          ) : (
            <div className="nxmp-rows">
              {sorted.map(p => {
                const status = getStockStatus(p.stock || 0);
                const pId = `p-title-${p.id}`;
                return (
                  <article key={p.id} className="nxmp-row" aria-labelledby={pId}>
                    <div className="nxmp-row-media">
                      {p.imagenes?.[0]?.url
                        ? <img src={p.imagenes[0].url} alt={p.titulo} />
                        : <div className="nxmp-row-noimg" aria-hidden="true">Sin imagen</div>}
                    </div>
                    <div className="nxmp-row-grid">
                      <div className="nxmp-row-main">
                        <div className="nxmp-row-title" id={pId}>{p.titulo}</div>
                        <div className="nxmp-row-meta">{getCategoryLabel(p.categoria)} · {p.condicion || 'NUEVO'}</div>
                      </div>
                      <div className="nxmp-row-block">
                        <span className="nxmp-row-label">Precio y stock</span>
                        <div className="nxmp-row-value">
                          <span className="nxmp-row-price">${(parseFloat(p.precio) || 0).toFixed(2)}</span>
                          <span className="nxmp-row-stock">/ {p.stock} unidades</span>
                        </div>
                      </div>
                      <div className="nxmp-row-block">
                        <span className="nxmp-row-label">Estado</span>
                        <div className={`nxmp-row-status ${status.key}`} aria-label={`Estado del stock: ${status.label}`}>
                          <span className="nxmp-status-dot" aria-hidden="true" />
                          <span>{status.label}</span>
                        </div>
                      </div>
                      <div className="nxmp-row-actions">
                        <button className="nxmp-btn-edit" onClick={() => setEditProduct(p)} aria-label={`Editar ${p.titulo}`} title="Editar producto">Editar</button>
                        <button className="nxmp-btn-del" onClick={() => setDeleteProduct(p)} aria-label={`Eliminar ${p.titulo}`} title="Eliminar producto">Eliminar</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ── Modales ── */}
      <PublishModal isOpen={showModal} onClose={() => setShowModal(false)} onPublished={fetchMyProducts} />
      {editProduct && (
        <EditProductModal 
          isOpen={!!editProduct} 
          onClose={() => setEditProduct(null)} 
          product={editProduct} 
          onProductUpdated={() => { fetchMyProducts(); setToast({ message: 'Producto actualizado correctamente', type: 'success' }); }}
        />
      )}
      <DeleteConfirmModal 
        isOpen={!!deleteProduct} 
        onClose={() => setDeleteProduct(null)} 
        productName={deleteProduct?.titulo || ''}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showChat && <ChatWidget onClose={() => setShowChat(false)} initialMessage={aiPrefill} />}
    </div>
  );
}

export default MyProducts;