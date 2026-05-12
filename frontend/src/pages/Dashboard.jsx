import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import AssistedTopBar from '../components/assisted/AssistedTopBar';

const DASHBOARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;0,700;1,200;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sd-root { min-height: 100vh; background: var(--cream); color: var(--ink); font-family: 'DM Sans', sans-serif; }
  .sd-nav { position: sticky; top: 0; z-index: 200; height: 68px; background: rgba(245,240,232,0.94); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 3rem; gap: 1rem; }
  [data-theme='dark'] .sd-nav { background: rgba(14,12,10,0.94); }
  .sd-brand { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
  .sd-brand img { height: 28px; }
  .sd-brand-name { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 600; letter-spacing: 0.06em; color: var(--ink); }
  .sd-nav-gap { flex: 1; }
  .sd-nav-link { height: 36px; padding: 0 0.95rem; display: inline-flex; align-items: center; border: 1px solid var(--border); color: var(--ink-soft); text-decoration: none; font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.18s; background: transparent; }
  .sd-nav-link:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }
  .sd-page { max-width: 1240px; margin: 0 auto; padding: 3.5rem 3rem 5rem; }
  .sd-hero { display: flex; justify-content: space-between; gap: 2rem; align-items: flex-start; margin-bottom: 2.5rem; }
  .sd-eyebrow { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; color: var(--ink-soft); display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.7rem; }
  .sd-eyebrow::before { content: ''; display: block; width: 22px; height: 1px; background: var(--ink-soft); }
  .sd-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.8rem, 5vw, 4.4rem); font-weight: 200; line-height: 0.95; letter-spacing: -0.025em; margin-bottom: 0.75rem; }
  .sd-sub { font-size: 0.9rem; line-height: 1.7; color: var(--ink-soft); max-width: 720px; }
  .sd-status { padding: 0.75rem 1rem; border: 1px solid var(--border); background: var(--white); min-width: 230px; }
  .sd-status-label { font-size: 0.58rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-ghost); margin-bottom: 0.35rem; }
  .sd-status-value { font-size: 0.85rem; color: var(--ink); }
  .sd-status-pill { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.55rem; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.14em; color: #16A34A; }
  .sd-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #16A34A; }
  .sd-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.25rem; }
  .sd-btn, .sd-btn-outline { height: 40px; padding: 0 1.25rem; display: inline-flex; align-items: center; justify-content: center; border: none; text-decoration: none; cursor: pointer; font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.18s; }
  .sd-btn { background: var(--ink); color: var(--cream); }
  .sd-btn:hover { background: var(--ink-mid); }
  .sd-btn-outline { background: transparent; border: 1px solid var(--border); color: var(--ink-soft); }
  .sd-btn-outline:hover { background: var(--cream-dark); color: var(--ink); border-color: var(--ink); }
  .sd-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .sd-card { background: var(--white); border: 1px solid var(--border); padding: 1.25rem 1.35rem; }
  .sd-card-lbl { font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--ink-ghost); margin-bottom: 0.6rem; }
  .sd-card-val { font-family: 'Cormorant Garamond', serif; font-size: 2.1rem; font-weight: 200; line-height: 1; color: var(--ink); margin-bottom: 0.3rem; }
  .sd-card-note { font-size: 0.76rem; color: var(--ink-soft); line-height: 1.5; }
  .sd-chart-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }
  .sd-chart { background: var(--white); border: 1px solid var(--border); padding: 1.2rem 1.25rem 1.35rem; }
  .sd-chart-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
  .sd-chart-title { font-family: 'Cormorant Garamond', serif; font-size: 1.45rem; font-weight: 300; color: var(--ink); }
  .sd-chart-sub { font-size: 0.72rem; color: var(--ink-soft); line-height: 1.5; }
  .sd-chart-bars { display: grid; gap: 0.8rem; }
  .sd-chart-row { display: grid; grid-template-columns: 98px 1fr 42px; gap: 0.75rem; align-items: center; }
  .sd-chart-label { font-size: 0.72rem; color: var(--ink-mid); line-height: 1.25; }
  .sd-chart-track { height: 10px; background: rgba(26,23,20,0.06); border: 1px solid rgba(26,23,20,0.06); overflow: hidden; }
  .sd-chart-fill { height: 100%; background: linear-gradient(90deg, var(--ink), var(--amber)); min-width: 0; }
  .sd-chart-value { text-align: right; font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: var(--ink); }
  .sd-chart-empty { padding: 1.4rem 0; color: var(--ink-soft); font-size: 0.82rem; line-height: 1.7; }
  .sd-section { margin-top: 2rem; }
  .sd-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); margin-bottom: 1.25rem; }
  .sd-section-title { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 200; color: var(--ink); }
  .sd-section-link { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-soft); text-decoration: none; }
  .sd-section-link:hover { color: var(--ink); }
  .sd-product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0; border-top: 1px solid var(--border); border-left: 1px solid var(--border); }
  .sd-product { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--white); padding: 1rem; display: flex; flex-direction: column; }
  .sd-product-thumb { aspect-ratio: 1; border: 1px solid var(--border); background: var(--cream-dark); margin-bottom: 0.85rem; overflow: hidden; display: flex; align-items: center; justify-content: center; color: var(--ink-ghost); font-size: 0.75rem; }
  .sd-product-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sd-product-name { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-weight: 300; line-height: 1.15; margin-bottom: 0.3rem; }
  .sd-product-meta { font-size: 0.72rem; color: var(--ink-soft); line-height: 1.5; }
  .sd-product-price { margin-top: 0.55rem; font-family: 'Cormorant Garamond', serif; font-size: 1.35rem; color: var(--amber); }
  .sd-product-actions { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.8rem; }
  .sd-mini-btn { height: 30px; padding: 0 0.7rem; border: 1px solid var(--border); background: transparent; color: var(--ink-soft); cursor: pointer; font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
  .sd-mini-btn:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }
  .sd-mini-btn.danger:hover { background: #DC2626; color: #fff; border-color: #DC2626; }
  .sd-sales-list { display: grid; gap: 0.75rem; }
  .sd-sale { display: flex; align-items: center; gap: 1rem; padding: 0.95rem 1rem; background: var(--white); border: 1px solid var(--border); }
  .sd-sale-thumb { width: 54px; height: 54px; background: var(--cream-dark); border: 1px solid var(--border); flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: var(--ink-ghost); }
  .sd-sale-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .sd-sale-main { flex: 1; min-width: 0; }
  .sd-sale-title { font-size: 0.9rem; color: var(--ink); font-weight: 500; margin-bottom: 0.15rem; }
  .sd-sale-sub { font-size: 0.72rem; color: var(--ink-soft); line-height: 1.5; }
  .sd-sale-amt { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: var(--ink); }
  .sd-empty { padding: 3rem 1.5rem; text-align: center; border: 1px dashed var(--border); background: rgba(255,255,255,0.4); }
  .sd-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 200; margin-bottom: 0.5rem; }
  .sd-empty-text { font-size: 0.84rem; line-height: 1.8; color: var(--ink-soft); max-width: 560px; margin: 0 auto; }
  .sd-error { padding: 0.85rem 1rem; border: 1px solid #FCA5A5; background: #FEF2F2; color: #DC2626; font-size: 0.82rem; margin-bottom: 1rem; }
  .sd-loading { padding: 4rem 2rem; text-align: center; color: var(--ink-soft); }

  .sd-overlay { position: fixed; inset: 0; background: rgba(26,23,20,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 3000; padding: 1rem; }
  .sd-modal { width: 100%; max-width: 780px; max-height: 92vh; overflow-y: auto; position: relative; background: var(--white); border: 1px solid var(--border); box-shadow: 0 24px 60px rgba(26,23,20,0.2); }
  .sd-modal.compact { max-width: 500px; }
  .sd-modal-head { padding: 1.75rem 2rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; background: var(--cream-dark); }
  .sd-modal-tag { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.5rem; }
  .sd-modal-tag::before { content: ''; display: block; width: 16px; height: 1px; background: var(--ink-soft); }
  .sd-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 1.75rem; font-weight: 200; color: var(--ink); letter-spacing: -0.015em; }
  .sd-close { width: 30px; height: 30px; background: transparent; border: 1px solid var(--border); color: var(--ink-soft); cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: all 0.15s; margin-top: 2px; }
  .sd-close:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }
  .sd-modal-body { padding: 1.75rem 2rem 2rem; }
  .sd-detail { display: grid; grid-template-columns: 1fr 1.15fr; gap: 1.5rem; align-items: start; }
  .sd-detail-media { border: 1px solid var(--border); background: var(--cream-dark); overflow: hidden; }
  .sd-detail-media img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
  .sd-detail-media-empty { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; color: var(--ink-ghost); font-size: 0.8rem; }
  .sd-detail-name { font-family: 'Cormorant Garamond', serif; font-size: 2rem; line-height: 1; font-weight: 200; margin-bottom: 0.55rem; }
  .sd-detail-desc { color: var(--ink-soft); font-size: 0.88rem; line-height: 1.75; margin-bottom: 1.1rem; }
  .sd-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
  .sd-detail-stat { border: 1px solid var(--border); background: var(--cream); padding: 0.8rem 0.9rem; }
  .sd-detail-stat-lbl { display: block; font-size: 0.58rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-ghost); margin-bottom: 0.25rem; }
  .sd-detail-stat-val { font-size: 0.86rem; color: var(--ink); }
  .sd-detail-seller { border: 1px solid var(--border); background: var(--white); padding: 0.9rem 1rem; margin-top: 1rem; }
  .sd-detail-seller-lbl { font-size: 0.58rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-ghost); margin-bottom: 0.45rem; }
  .sd-detail-seller-name { font-size: 0.92rem; font-weight: 500; color: var(--ink); margin-bottom: 0.2rem; }
  .sd-detail-seller-meta { font-size: 0.76rem; color: var(--ink-soft); line-height: 1.5; }
  .sd-detail-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
  .sd-form { margin-top: 0.25rem; }
  .sd-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
  .sd-field { margin-bottom: 1rem; }
  .sd-field label { display: block; font-size: 0.6rem; font-weight: 600; color: var(--ink-soft); margin-bottom: 0.45rem; letter-spacing: 0.16em; text-transform: uppercase; }
  .sd-field input:not([type=file]), .sd-field textarea, .sd-field select { width: 100%; padding: 0 0.95rem; background: var(--cream); border: 1px solid var(--border); color: var(--ink); font-size: 0.88rem; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
  .sd-field input:not([type=file]), .sd-field select { height: 40px; }
  .sd-field textarea { padding: 0.75rem 0.95rem; height: 90px; resize: vertical; line-height: 1.6; }
  .sd-field input:not([type=file]):focus, .sd-field textarea:focus, .sd-field select:focus { border-color: var(--ink); }
  .sd-field input::placeholder, .sd-field textarea::placeholder { color: var(--ink-ghost); }
  .sd-file-hidden { display: none; }
  .sd-img-zone { border: 1px dashed rgba(26,23,20,0.18); background: var(--cream); padding: 1.3rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .sd-img-zone:hover { border-color: var(--ink); background: var(--cream-dark); }
  .sd-img-icon { font-size: 1.4rem; opacity: 0.3; display: block; margin-bottom: 0.45rem; }
  .sd-img-txt { font-size: 0.75rem; color: var(--ink-soft); }
  .sd-img-txt b { color: var(--ink); }
  .sd-img-preview { margin-top: 0.85rem; position: relative; }
  .sd-img-preview img { width: 100%; max-height: 180px; object-fit: cover; display: block; border: 1px solid var(--border); }
  .sd-img-remove { position: absolute; top: 0.4rem; right: 0.4rem; background: var(--white); border: 1px solid var(--border); color: var(--ink-soft); cursor: pointer; font-size: 0.7rem; padding: 0.2rem 0.5rem; transition: all 0.15s; }
  .sd-img-remove:hover { background: var(--ink); color: var(--cream); }
  .sd-modal-error { background: #FEF2F2; border: 1px solid #FCA5A5; padding: 0.65rem 0.9rem; margin-bottom: 1rem; color: #DC2626; font-size: 0.8rem; }
  .sd-modal-success { background: #F0FDF4; border: 1px solid #86EFAC; padding: 0.65rem 0.9rem; margin-bottom: 1rem; color: #16A34A; font-size: 0.8rem; }
  .sd-modal-foot { display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 1.25rem; border-top: 1px solid var(--border); margin-top: 1.5rem; }
  .sd-modal-cancel { height: 40px; padding: 0 1.4rem; background: transparent; color: var(--ink-soft); border: 1px solid var(--border); cursor: pointer; font-size: 0.72rem; font-family: 'DM Sans', sans-serif; transition: all 0.18s; letter-spacing: 0.08em; text-transform: uppercase; }
  .sd-modal-cancel:hover { border-color: var(--ink); color: var(--ink); }
  .sd-modal-submit { height: 40px; padding: 0 1.75rem; background: var(--ink); color: var(--cream); font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.2s; }
  .sd-modal-submit:hover:not(:disabled) { background: var(--ink-mid); }
  .sd-modal-submit:disabled { opacity: 0.35; cursor: not-allowed; }
  .sd-modal-submit.danger { background: #DC2626; }
  .sd-modal-submit.danger:hover:not(:disabled) { background: #B91C1C; }

  @media (max-width: 900px) { .sd-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .sd-hero { flex-direction: column; } .sd-status { width: 100%; } .sd-detail { grid-template-columns: 1fr; } }
  @media (max-width: 640px) { .sd-nav, .sd-page { padding-left: 1.25rem; padding-right: 1.25rem; } .sd-grid { grid-template-columns: 1fr; } .sd-form-row, .sd-detail-grid { grid-template-columns: 1fr; } }
`;

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

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function getCategoryLabel(value) {
  return CATEGORY_OPTIONS.find((option) => option.value === value)?.label || 'Servicios y Otros';
}

function getConditionLabel(value) {
  if (!value) return 'Nuevo';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function stars(value) {
  const count = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

function getBarWidth(value, maxValue) {
  if (!maxValue) return '0%';
  return `${Math.max(0, Math.round((value / maxValue) * 100))}%`;
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

  useEffect(() => {
    if (!document.getElementById('sd-styles')) {
      const el = document.createElement('style');
      el.id = 'sd-styles';
      el.textContent = DASHBOARD_STYLES;
      document.head.appendChild(el);
    }
  }, []);

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
    return <div className="sd-loading" data-theme={theme}>Cargando dashboard...</div>;
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