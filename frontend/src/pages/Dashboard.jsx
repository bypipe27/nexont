import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import AssistedTopBar from '../components/assisted/AssistedTopBar';
import { ensureSellerStyles } from '../components/seller/sellerStyles';

ensureSellerStyles();

function getBarWidth(value, maxValue) {
  if (!maxValue) return '0%';
  return `${Math.max(0, Math.round((value / maxValue) * 100))}%`;
}

function formatMoney(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getConditionLabel(value) {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'USADO') return 'Usado';
  if (normalized === 'REACONDICIONADO') return 'Reacondicionado';
  return 'Nuevo';
}

function getCategoryLabel(value) {
  const normalized = String(value || '').toUpperCase();
  const labels = {
    ELECTRONICA_TECNOLOGIA: 'Electrónica y Tecnología',
    HOGAR_DECORACION: 'Hogar y Decoración',
    MODA_ACCESORIOS: 'Moda y Accesorios',
    SALUD_BELLEZA: 'Salud y Belleza',
    DEPORTES_FITNESS: 'Deportes y Fitness',
    JUGUETES_BEBES: 'Juguetes y Bebés',
    AUTOMOTRIZ: 'Automotriz',
    LIBROS_MUSICA_ENTRETENIMIENTO: 'Libros, Música y Entretenimiento',
    ALIMENTOS_BEBIDAS: 'Alimentos y Bebidas',
    SERVICIOS_OTROS: 'Servicios y Otros',
  };

  return labels[normalized] || 'Servicios y Otros';
}

function stars(value = 0) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });
}

function ChartCard({ title, subtitle, series, emptyText }) {
  const maxValue = Math.max(0, ...series.map((item) => Number(item.value) || 0));
  const hasData = series.some((item) => Number(item.value) > 0);

  return (
    <article className="sd-chart">
      <div className="sd-chart-head">
        <div>
          <div className="sd-chart-title">{title}</div>
          <div className="sd-chart-sub">{subtitle}</div>
        </div>
      </div>

      {hasData ? (
        <div className="sd-chart-bars">
          {series.map((item) => (
            <div className="sd-chart-row" key={item.label}>
              <div className="sd-chart-label">{item.label}</div>
              <div className="sd-chart-track">
                <div className="sd-chart-fill" style={{ width: getBarWidth(Number(item.value) || 0, maxValue), background: item.color || 'linear-gradient(90deg, var(--ink), var(--amber))' }} />
              </div>
              <div className="sd-chart-value">{item.displayValue ?? item.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sd-chart-empty">{emptyText}</div>
      )}
    </article>
  );
}

function ProductDetailModal({ product, onClose, onEdit, onDelete }) {
  if (!product) return null;

  const seller = product.seller;
  const sellerName = seller ? `${seller.nombres || ''} ${seller.apellidos || ''}`.trim() : 'Vendedor';

  return (
    <div className="sd-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="sd-modal" role="dialog" aria-modal="true">
        <div className="sd-modal-head">
          <div>
            <div className="sd-modal-tag">Detalle del producto</div>
            <div className="sd-modal-title">{product.titulo}</div>
          </div>
          <button className="sd-close" onClick={onClose}>✕</button>
        </div>
        <div className="sd-modal-body">
          <div className="sd-detail">
            <div className="sd-detail-media">
              {product.imagenes?.[0]?.url ? (
                <img src={product.imagenes[0].url} alt={product.titulo} />
              ) : (
                <div className="sd-detail-media-empty">Sin imagen</div>
              )}
            </div>

            <div>
              <div className="sd-detail-name">{product.titulo}</div>
              {product.descripcion && <div className="sd-detail-desc">{product.descripcion}</div>}

              <div className="sd-detail-grid">
                <div className="sd-detail-stat">
                  <span className="sd-detail-stat-lbl">Precio</span>
                  <span className="sd-detail-stat-val" style={{ color: 'var(--amber)' }}>{formatMoney(product.precio)}</span>
                </div>
                <div className="sd-detail-stat">
                  <span className="sd-detail-stat-lbl">Stock</span>
                  <span className="sd-detail-stat-val">{product.stock} unidades</span>
                </div>
                <div className="sd-detail-stat">
                  <span className="sd-detail-stat-lbl">Condición</span>
                  <span className="sd-detail-stat-val">{getConditionLabel(product.condition || product.condicion)}</span>
                </div>
                <div className="sd-detail-stat">
                  <span className="sd-detail-stat-lbl">Calificación</span>
                  <span className="sd-detail-stat-val" style={{ color: 'var(--amber)' }}>{stars(product.rating || product.promedioCalificacion || 0)}</span>
                </div>
                <div className="sd-detail-stat">
                  <span className="sd-detail-stat-lbl">Categoría</span>
                  <span className="sd-detail-stat-val">{getCategoryLabel(product.categoria)}</span>
                </div>
                <div className="sd-detail-stat">
                  <span className="sd-detail-stat-lbl">Estado</span>
                  <span className="sd-detail-stat-val">{product.estaActivo === false ? 'Inactivo' : 'Activo'}</span>
                </div>
              </div>

              <div className="sd-detail-seller">
                <div className="sd-detail-seller-lbl">Vendedor</div>
                <div className="sd-detail-seller-name">{sellerName || 'Tu cuenta'}</div>
                <div className="sd-detail-seller-meta">
                  {seller?.correo || 'Sin correo visible'}<br />
                  Creado el {formatDate(product.creadoEn)}
                </div>
              </div>

              <div className="sd-detail-actions">
                <button className="sd-mini-btn" onClick={() => onEdit(product)}>Editar</button>
                <button className="sd-mini-btn danger" onClick={() => onDelete(product)}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'NUEVO', categoria: 'SERVICIOS_OTROS' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!product) return;
    setForm({
      titulo: product.titulo || '',
      descripcion: product.descripcion || '',
      precio: product.precio || '',
      stock: product.stock || '',
      condicion: (product.condition || product.condicion || 'NUEVO').toUpperCase(),
      categoria: product.categoria || 'SERVICIOS_OTROS',
    });
    setImagePreview(product.imagenes?.[0]?.url || null);
    setImageFile(null);
    setError('');
  }, [product]);

  useEffect(() => {
    const handleEscape = (event) => { if (event.key === 'Escape') onClose(); };
    if (product) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [product, onClose]);

  if (!product) return null;

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('descripcion', form.descripcion);
      formData.append('precio', parseFloat(form.precio));
      formData.append('stock', parseInt(form.stock, 10));
      formData.append('condicion', form.condicion);
      formData.append('categoria', form.categoria);
      formData.append('promedioCalificacion', product?.rating || product?.promedioCalificacion || 0);
      if (imageFile) formData.append('imagen', imageFile);

      await api.put(`/products/${product.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (onSaved) await onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.details?.join(', ') || err.response?.data?.error || 'Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sd-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="sd-modal">
        <div className="sd-modal-head">
          <div>
            <div className="sd-modal-tag">Editar producto</div>
            <div className="sd-modal-title">{product.titulo}</div>
          </div>
          <button className="sd-close" onClick={onClose}>✕</button>
        </div>
        <div className="sd-modal-body">
          {error && <div className="sd-modal-error">{error}</div>}
          <form className="sd-form" onSubmit={handleSubmit}>
            <div className="sd-field">
              <label>Nombre del producto *</label>
              <input name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Ej: Silla Eames vintage" />
            </div>
            <div className="sd-field">
              <label>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Describe las características principales…" />
            </div>
            <div className="sd-form-row">
              <div className="sd-field">
                <label>Precio</label>
                <input type="number" name="precio" value={form.precio} onChange={handleChange} step="0.01" min="0.01" required />
              </div>
              <div className="sd-field">
                <label>Stock</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" required />
              </div>
            </div>
            <div className="sd-field">
              <label>Estado</label>
              <select name="condicion" value={form.condicion} onChange={handleChange}>
                <option value="NUEVO">Nuevo</option>
                <option value="USADO">Usado</option>
                <option value="REACONDICIONADO">Reacondicionado</option>
              </select>
            </div>
            <div className="sd-field">
              <label>Categoría</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="sd-field">
              <label>Imagen del producto</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="sd-file-hidden" ref={fileInputRef} />
              <div className="sd-img-zone" onClick={() => fileInputRef.current?.click()}>
                <span className="sd-img-icon">📷</span>
                <div className="sd-img-txt">{imageFile ? <b>{imageFile.name}</b> : <><b>Haz clic o arrastra</b> para cambiar la imagen</>}</div>
              </div>
              {imagePreview && (
                <div className="sd-img-preview">
                  <img src={imagePreview} alt="preview" />
                  <button type="button" className="sd-img-remove" onClick={() => { setImageFile(null); setImagePreview(product.imagenes?.[0]?.url || null); }}>✕ Quitar</button>
                </div>
              )}
            </div>
            <div className="sd-modal-foot">
              <button type="button" className="sd-modal-cancel" onClick={onClose}>Cancelar</button>
              <button type="submit" className="sd-modal-submit" disabled={loading}>{loading ? 'Guardando…' : 'Guardar cambios →'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ product, onClose, onConfirm, loading }) {
  if (!product) return null;

  return (
    <div className="sd-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="sd-modal compact">
        <div className="sd-modal-head">
          <div>
            <div className="sd-modal-tag">Eliminar producto</div>
            <div className="sd-modal-title">{product.titulo}</div>
          </div>
          <button className="sd-close" onClick={onClose}>✕</button>
        </div>
        <div className="sd-modal-body">
          <div className="sd-empty" style={{ padding: '1.5rem 1.25rem', marginBottom: '1rem' }}>
            <div className="sd-empty-title" style={{ fontSize: '1.55rem' }}>¿Eliminar este producto?</div>
            <div className="sd-empty-text">Esta acción lo quitará del catálogo activo. Puedes volver a publicarlo o editarlo después si lo necesitas.</div>
          </div>
          <div className="sd-modal-foot">
            <button type="button" className="sd-modal-cancel" onClick={onClose}>Cancelar</button>
            <button type="button" className="sd-modal-submit danger" onClick={() => onConfirm(product)} disabled={loading}>{loading ? 'Eliminando…' : 'Eliminar producto →'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [mutationLoading, setMutationLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setError('');
      const [dashboardResponse, productsResponse] = await Promise.all([
        api.get('/users/me/dashboard'),
        api.get('/products/my'),
      ]);

      setDashboard(dashboardResponse.data);
      setProducts(productsResponse.data.products || []);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const intervalId = window.setInterval(() => {
      fetchDashboard();
    }, 30000);

    const handleFocus = () => fetchDashboard();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDashboard]);

  // If user is not verified as vendor, redirect them to profile to complete verification
  useEffect(() => {
    if (!loading) {
      const seller = dashboard?.seller;
      if (seller && !seller.esVendedorVerificado) {
        navigate('/profile');
      }
    }
  }, [loading, dashboard, navigate]);


  const handleDeleteProduct = async (product) => {
    setMutationLoading(true);
    try {
      await api.delete(`/products/${product.id}`);
      setDeletingProduct(null);
      await fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar el producto');
    } finally {
      setMutationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="sd-root" data-theme={theme}>
        <AssistedTopBar active="tienda" />
        <main className="sd-page">
          <div className="sd-empty" style={{ minHeight: '42vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="sd-empty-title">Cargando dashboard...</div>
            <div className="sd-empty-text">Estamos preparando tus métricas, productos y ventas recientes.</div>
          </div>
        </main>
      </div>
    );
  }

  const seller = dashboard?.seller;
  const summary = dashboard?.summary || {};
  const recentSales = dashboard?.recentSales || [];
  const sellerName = seller ? `${seller.nombres || ''} ${seller.apellidos || ''}`.trim() : 'Vendedor';
  const ordersSeries = [
    { label: 'Pendientes', value: summary.pendingOrders || 0 },
    { label: 'Confirmados', value: summary.confirmedOrders || 0 },
    { label: 'Entregados', value: summary.deliveredOrders || 0 },
  ];
  const inventorySeries = [
    { label: 'Activos', value: summary.activeProducts || 0 },
    { label: 'Sin stock', value: summary.outOfStockProducts || 0 },
    { label: 'Stock bajo', value: summary.lowStockProducts || 0 },
    { label: 'Vendidos', value: summary.soldProducts || 0 },
  ];
  const salesSeries = [
    { label: 'Ingresos', value: summary.totalSales || 0, displayValue: formatMoney(summary.totalSales || 0) },
    { label: 'Unidades', value: summary.totalUnitsSold || 0 },
    { label: 'Reseñas', value: summary.totalReviews || 0 },
  ];

  return (
    <div className="sd-root" data-theme={theme}>
      <AssistedTopBar active="tienda" />

      <main className="sd-page">
        {error && <div className="sd-error">{error}</div>}

        <section className="sd-hero">
          <div>
            <div className="sd-eyebrow">Panel de vendedor</div>
            <h1 className="sd-title">Dashboard de {sellerName || 'tu cuenta'}</h1>
            <p className="sd-sub">Aquí ves el estado general de tu actividad: productos, ventas, pedidos y el catálogo que administras desde un mismo lugar.</p>
            <div className="sd-actions">
              <Link to="/my-products" className="sd-btn">Ir al panel de productos</Link>
              <Link to="/profile" className="sd-btn-outline">Editar perfil</Link>
              <Link to="/" className="sd-btn-outline">Volver a la tienda</Link>
            </div>
          </div>

          <aside className="sd-status">
            <div className="sd-status-label">Estado de cuenta</div>
            <div className="sd-status-value">{seller?.esVendedorVerificado ? 'Verificación activa' : 'Verificación pendiente'}</div>
            <div className="sd-status-pill">
              <span className="sd-status-dot" />
              {seller?.esVendedorVerificado ? 'Vendedor verificado' : 'Acceso básico habilitado'}
            </div>
          </aside>
        </section>

        <section className="sd-grid">
          <article className="sd-card">
            <div className="sd-card-lbl">Productos totales</div>
            <div className="sd-card-val">{summary.totalProducts || 0}</div>
            <div className="sd-card-note">Publicaciones creadas en tu catálogo.</div>
          </article>
          <article className="sd-card">
            <div className="sd-card-lbl">Productos activos</div>
            <div className="sd-card-val">{summary.activeProducts || 0}</div>
            <div className="sd-card-note">Disponibles para compra en la tienda.</div>
          </article>
          <article className="sd-card">
            <div className="sd-card-lbl">Pedidos</div>
            <div className="sd-card-val">{summary.totalOrders || 0}</div>
            <div className="sd-card-note">Incluye pendientes, confirmados y entregados.</div>
          </article>
          <article className="sd-card">
            <div className="sd-card-lbl">Productos vendidos</div>
            <div className="sd-card-val">{summary.soldProducts || 0}</div>
            <div className="sd-card-note">Productos distintos con al menos una venta confirmada.</div>
          </article>
        </section>

        <section className="sd-grid" style={{ marginTop: '0' }}>
          <article className="sd-card">
            <div className="sd-card-lbl">En espera</div>
            <div className="sd-card-val">{summary.pendingOrders || 0}</div>
            <div className="sd-card-note">Pedidos aún no finalizados.</div>
          </article>
          <article className="sd-card">
            <div className="sd-card-lbl">Confirmados</div>
            <div className="sd-card-val">{summary.confirmedOrders || 0}</div>
            <div className="sd-card-note">Órdenes aceptadas por el flujo de compra.</div>
          </article>
          <article className="sd-card">
            <div className="sd-card-lbl">Entregados</div>
            <div className="sd-card-val">{summary.deliveredOrders || 0}</div>
            <div className="sd-card-note">Compras cerradas exitosamente.</div>
          </article>
          <article className="sd-card">
            <div className="sd-card-lbl">Ingresos simulados</div>
            <div className="sd-card-val">{formatMoney(summary.totalSales || 0)}</div>
            <div className="sd-card-note">Estimación basada en ventas no canceladas.</div>
          </article>
        </section>

        <section className="sd-grid" style={{ marginTop: '0' }}>
          <article className="sd-card">
            <div className="sd-card-lbl">Unidades vendidas</div>
            <div className="sd-card-val">{summary.totalUnitsSold || 0}</div>
            <div className="sd-card-note">Cantidad total de productos vendidos por unidades.</div>
          </article>
          <article className="sd-card">
            <div className="sd-card-lbl">Sin stock</div>
            <div className="sd-card-val">{summary.outOfStockProducts || 0}</div>
            <div className="sd-card-note">Productos activos agotados actualmente.</div>
          </article>
          <article className="sd-card">
            <div className="sd-card-lbl">Stock bajo</div>
            <div className="sd-card-val">{summary.lowStockProducts || 0}</div>
            <div className="sd-card-note">Productos con 3 unidades o menos.</div>
          </article>
          <article className="sd-card">
            <div className="sd-card-lbl">Calificación</div>
            <div className="sd-card-val">{(summary.averageRating || 0).toFixed(1)}</div>
            <div className="sd-card-note">Promedio de tus productos publicados.</div>
          </article>
        </section>

        <section className="sd-section">
          <div className="sd-section-head">
            <div>
              <div className="sd-eyebrow">Visualización</div>
              <div className="sd-section-title">Gráficos de métricas</div>
            </div>
          </div>

          <div className="sd-chart-grid">
            <ChartCard
              title="Estado de pedidos"
              subtitle="Distribución por flujo de compra"
              series={ordersSeries}
              emptyText="No hay pedidos registrados todavía. Cuando entren órdenes, aquí verás la proporción entre pendientes, confirmados y entregados."
            />
            <ChartCard
              title="Inventario"
              subtitle="Salud del catálogo"
              series={inventorySeries}
              emptyText="No hay productos activos para graficar. Publica productos para ver stock, agotados y vendidos."
            />
            <ChartCard
              title="Actividad comercial"
              subtitle="Indicadores resumidos"
              series={salesSeries}
              emptyText="Aún no hay ventas ni reseñas. Cuando haya actividad, este bloque mostrará ingresos, unidades y reviews."
            />
          </div>
        </section>

        <section className="sd-section">
          <div className="sd-section-head">
            <div>
              <div className="sd-eyebrow">Gestión de productos</div>
              <div className="sd-section-title">Tu catálogo</div>
            </div>
            <Link to="/my-products" className="sd-section-link">Abrir panel completo →</Link>
          </div>

          {products.length > 0 ? (
            <div className="sd-product-grid">
              {products.map((product) => (
                <article className="sd-product" key={product.id}>
                  <div className="sd-product-thumb">
                    {product.imagenes?.[0]?.url ? <img src={product.imagenes[0].url} alt={product.titulo} /> : 'Sin imagen'}
                  </div>
                  <div className="sd-product-name">{product.titulo}</div>
                  <div className="sd-product-meta">
                    {getCategoryLabel(product.categoria)}<br />
                    {getConditionLabel(product.condition || product.condicion)} · Stock: {product.stock}<br />
                    {product.totalResenas || 0} reseñas · {formatDate(product.creadoEn)}
                  </div>
                  <div className="sd-product-price">{formatMoney(product.precio)}</div>
                  <div className="sd-product-actions">
                    <button className="sd-mini-btn" onClick={() => setSelectedProduct(product)}>Ver detalle</button>
                    <button className="sd-mini-btn" onClick={() => setEditingProduct(product)}>Editar</button>
                    <button className="sd-mini-btn danger" onClick={() => setDeletingProduct(product)}>Eliminar</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="sd-empty">
              <div className="sd-empty-title">Aún no tienes productos publicados</div>
              <div className="sd-empty-text">Cuando publiques tu primer producto, aquí verás el catálogo completo para revisarlo, editarlo o retirarlo.</div>
              <div className="sd-actions" style={{ justifyContent: 'center' }}>
                <Link to="/my-products" className="sd-btn">Publicar producto</Link>
              </div>
            </div>
          )}
        </section>

        <section className="sd-section">
          <div className="sd-section-head">
            <div>
              <div className="sd-eyebrow">Ventas recientes</div>
              <div className="sd-section-title">Últimos movimientos</div>
            </div>
            <Link to="/orders" className="sd-section-link">Ir a mis órdenes →</Link>
          </div>

          {recentSales.length > 0 ? (
            <div className="sd-sales-list">
              {recentSales.map((sale) => (
                <article className="sd-sale" key={sale.id}>
                  <div className="sd-sale-thumb">
                    {sale.product.imagenPrincipal ? <img src={sale.product.imagenPrincipal} alt={sale.product.titulo} /> : 'Sin img'}
                  </div>
                  <div className="sd-sale-main">
                    <div className="sd-sale-title">{sale.product.titulo}</div>
                    <div className="sd-sale-sub">Pedido #{sale.orderId} · {sale.buyerName || 'Comprador'} · {sale.orderStatus} · {sale.quantity} unidad(es)</div>
                  </div>
                  <div className="sd-sale-amt">{formatMoney(sale.subtotal)}</div>
                </article>
              ))}
            </div>
          ) : (
            <div className="sd-empty">
              <div className="sd-empty-title">Sin ventas registradas</div>
              <div className="sd-empty-text">Cuando tus productos empiecen a venderse, aquí aparecerán los últimos movimientos.</div>
            </div>
          )}
        </section>
      </main>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onEdit={(product) => {
          setSelectedProduct(null);
          setEditingProduct(product);
        }}
        onDelete={(product) => {
          setSelectedProduct(null);
          setDeletingProduct(product);
        }}
      />

      <EditProductModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSaved={fetchDashboard}
      />

      <DeleteConfirmModal
        product={deletingProduct}
        loading={mutationLoading}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
}

export default Dashboard;