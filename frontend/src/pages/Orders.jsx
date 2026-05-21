import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import StripePaymentForm from '../components/StripePaymentForm';
import AssistedTopBar from '../components/assisted/AssistedTopBar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  :root { --nxo-bg:#f6f7fb; --nxo-surface:#ffffff; --nxo-surface-2:#f3f6fb; --nxo-ink:#111827; --nxo-ink-soft:#5b6475; --nxo-ink-ghost:#8b95a7; --nxo-border:rgba(17,24,39,0.10); --nxo-accent:#7c3aed; --nxo-accent-2:#2563eb; --nxo-success:#16a34a; --nxo-danger:#dc2626; --cream:#f6f7fb; --cream-dark:#eef2f7; --ink:#111827; --ink-mid:#374151; --ink-soft:#5b6475; --ink-ghost:#8b95a7; --amber:#7c3aed; --white:#ffffff; --border:rgba(17,24,39,0.10); }

  .nxo-root { min-height:100vh; background:
      radial-gradient(circle at top left, rgba(124,58,237,0.12), transparent 30%),
      radial-gradient(circle at bottom right, rgba(37,99,235,0.10), transparent 26%),
      var(--nxo-bg); font-family:'Inter',sans-serif; color:var(--nxo-ink); }

  .nxo-bar { position:sticky; top:0; z-index:100; height:72px; background:rgba(246,247,251,0.88); backdrop-filter:blur(18px); border-bottom:1px solid var(--nxo-border); display:flex; align-items:center; padding:0 2rem; gap:1rem; }
  .nxo-brand { display:flex; align-items:center; gap:0.75rem; text-decoration:none; cursor:pointer; }
  .nxo-brand img { height:28px; }
  .nxo-brand-name { font-size:1.08rem; font-weight:900; color:var(--nxo-ink); letter-spacing:-0.03em; }
  .nxo-sep { width:1px; height:20px; background:var(--nxo-border); }
  .nxo-bar-title { font-size:0.62rem; font-weight:800; letter-spacing:0.24em; text-transform:uppercase; color:var(--nxo-ink-soft); }
  .nxo-gap { flex:1; }
  .nxo-back { height:38px; padding:0 1rem; background:transparent; border:1px solid var(--nxo-border); color:var(--nxo-ink-soft); font-size:0.68rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; transition:all 0.18s; font-family:'Inter',sans-serif; }
  .nxo-back:hover { background:var(--nxo-ink); color:#fff; border-color:var(--nxo-ink); }

  .nxo-page { max-width:860px; margin:0 auto; padding:3rem 1.5rem 5rem; }

  .nxo-eyebrow { font-size:0.6rem; font-weight:800; letter-spacing:0.26em; text-transform:uppercase; color:var(--nxo-accent); display:flex; align-items:center; gap:0.65rem; margin-bottom:0.75rem; }
  .nxo-eyebrow::before { content:''; display:block; width:24px; height:1px; background:currentColor; }

  .nxo-page-title { font-size:clamp(2.4rem, 5vw, 4rem); font-weight:900; color:var(--nxo-ink); margin-bottom:2rem; letter-spacing:-0.05em; line-height:0.98; }

  .nxo-panel { background:rgba(255,255,255,0.92); border:1px solid var(--nxo-border); margin-bottom:1rem; box-shadow:0 10px 30px rgba(17,24,39,0.06); overflow:hidden; }
  .nxo-panel-head { padding:1rem 1.25rem; border-bottom:1px solid var(--nxo-border); display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg, rgba(124,58,237,0.05), rgba(37,99,235,0.03)); }
  .nxo-panel-title { font-size:0.6rem; font-weight:800; letter-spacing:0.22em; text-transform:uppercase; color:var(--nxo-ink-soft); }

  .nxo-co-item { display:grid; grid-template-columns:1fr auto; gap:1rem; padding:1.05rem 1.25rem; border-bottom:1px solid rgba(17,24,39,0.06); align-items:center; }
  .nxo-co-item:last-child { border-bottom:none; }
  .nxo-co-name { font-size:1rem; font-weight:700; color:var(--nxo-ink); margin-bottom:0.2rem; letter-spacing:-0.02em; }
  .nxo-co-meta { font-size:0.74rem; color:var(--nxo-ink-soft); }
  .nxo-co-warn { font-size:0.72rem; color:var(--nxo-danger); margin-top:0.2rem; }
  .nxo-co-total { font-size:1rem; font-weight:800; color:var(--nxo-ink); letter-spacing:-0.01em; }

  .nxo-total-row { display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; border-top:1px solid var(--nxo-border); background:linear-gradient(135deg, rgba(124,58,237,0.05), rgba(37,99,235,0.02)); }
  .nxo-total-lbl { font-size:0.78rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:var(--nxo-ink-soft); }
  .nxo-total-val { font-size:1.7rem; font-weight:900; color:var(--nxo-accent); letter-spacing:-0.04em; }

  .nxo-pay-option { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; cursor:pointer; transition:background 0.14s ease; }
  .nxo-pay-option:hover { background:rgba(124,58,237,0.04); }
  .nxo-pay-name { font-size:0.9rem; font-weight:700; color:var(--nxo-ink); margin-bottom:0.15rem; }
  .nxo-pay-sub { font-size:0.74rem; color:var(--nxo-ink-soft); }

  .nxo-notes { width:calc(100% - 2.5rem); background:var(--nxo-surface); border:1px solid var(--nxo-border); color:var(--nxo-ink); font-size:0.9rem; font-family:'Inter',sans-serif; padding:0.95rem 1rem; resize:vertical; outline:none; transition:border-color 0.2s, box-shadow 0.2s; margin:1rem 1.25rem 1.25rem; line-height:1.65; border-radius:14px; }
  .nxo-notes:focus { border-color:var(--nxo-accent); box-shadow:0 0 0 4px rgba(124,58,237,0.12); }
  .nxo-notes::placeholder { color:var(--nxo-ink-ghost); }

  .nxo-confirm-btn { width:100%; height:52px; background:linear-gradient(135deg, var(--nxo-ink), var(--nxo-accent)); color:#fff; font-family:'Inter',sans-serif; font-weight:800; font-size:0.76rem; letter-spacing:0.14em; text-transform:uppercase; border:none; cursor:pointer; transition:transform 0.18s, box-shadow 0.18s, opacity 0.18s; margin-top:0.85rem; }
  .nxo-confirm-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 12px 26px rgba(124,58,237,0.18); }
  .nxo-confirm-btn:disabled { opacity:0.35; cursor:not-allowed; transform:none; box-shadow:none; }
  .nxo-confirm-warn { color:var(--nxo-danger); font-size:0.78rem; text-align:center; margin-top:0.5rem; }
  .nxo-err { background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.2); padding:0.8rem 1rem; margin-bottom:1rem; color:var(--nxo-danger); font-size:0.84rem; }

  .nxo-order-card { background:rgba(255,255,255,0.92); border:1px solid var(--nxo-border); padding:1.1rem 1.25rem; margin-bottom:0.85rem; cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; display:flex; align-items:flex-start; gap:1rem; box-shadow:0 10px 28px rgba(17,24,39,0.05); }
  .nxo-order-card:hover { transform:translateY(-1px); border-color:rgba(124,58,237,0.28); box-shadow:0 16px 34px rgba(17,24,39,0.08); }
  .nxo-order-thumbs { display:flex; gap:0.35rem; flex-shrink:0; }
  .nxo-order-thumb { width:52px; height:52px; object-fit:cover; border:1px solid var(--nxo-border); background:var(--nxo-surface-2); flex-shrink:0; border-radius:12px; }
  .nxo-order-thumb-placeholder { width:52px; height:52px; background:var(--nxo-surface-2); border:1px solid var(--nxo-border); display:flex; align-items:center; justify-content:center; flex-shrink:0; border-radius:12px; }
  .nxo-order-body { flex:1; min-width:0; }
  .nxo-order-top { display:flex; justify-content:space-between; align-items:flex-start; gap:0.75rem; flex-wrap:wrap; }
  .nxo-order-id { font-size:1.05rem; font-weight:800; color:var(--nxo-ink); margin-bottom:0.2rem; letter-spacing:-0.03em; }
  .nxo-order-inv { font-size:0.7rem; color:var(--nxo-ink-ghost); margin-bottom:0.2rem; }
  .nxo-order-date { font-size:0.74rem; color:var(--nxo-ink-soft); }
  .nxo-order-status { display:inline-flex; align-items:center; justify-content:center; padding:0.28rem 0.8rem; font-size:0.58rem; font-weight:800; letter-spacing:0.16em; text-transform:uppercase; border:1px solid; margin-bottom:0.5rem; white-space:nowrap; border-radius:999px; }
  .nxo-order-total { font-size:1.35rem; font-weight:900; color:var(--nxo-accent); letter-spacing:-0.04em; }
  .nxo-order-meta { font-size:0.72rem; color:var(--nxo-ink-ghost); margin-top:0.35rem; }

  .nxo-pagination { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-top:2rem; flex-wrap:wrap; }
  .nxo-page-btn { height:38px; min-width:38px; padding:0 0.85rem; background:rgba(255,255,255,0.9); border:1px solid var(--nxo-border); color:var(--nxo-ink-soft); font-size:0.72rem; font-weight:700; letter-spacing:0.08em; cursor:pointer; transition:all 0.15s; font-family:'Inter',sans-serif; border-radius:12px; }
  .nxo-page-btn:hover:not(:disabled) { background:var(--nxo-ink); color:#fff; border-color:var(--nxo-ink); }
  .nxo-page-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .nxo-page-btn.active { background:var(--nxo-ink); color:#fff; border-color:var(--nxo-ink); }
  .nxo-page-info { font-size:0.72rem; color:var(--nxo-ink-soft); letter-spacing:0.06em; }

  .nxo-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; }
  .nxo-detail-field { padding:1rem 1.25rem; border-bottom:1px solid rgba(17,24,39,0.06); border-right:1px solid rgba(17,24,39,0.06); }
  .nxo-detail-field:nth-child(2n) { border-right:none; }
  .nxo-df-lbl { font-size:0.58rem; color:var(--nxo-ink-ghost); text-transform:uppercase; letter-spacing:0.16em; margin-bottom:0.35rem; display:block; font-weight:800; }
  .nxo-df-val { font-size:0.96rem; font-weight:700; color:var(--nxo-ink); text-transform:capitalize; }

  .nxo-detail-item { display:grid; grid-template-columns:52px 1fr auto; gap:0.85rem; padding:1rem 1.25rem; border-bottom:1px solid rgba(17,24,39,0.06); align-items:center; }
  .nxo-detail-item:last-child { border-bottom:none; }
  .nxo-di-name { font-size:0.92rem; font-weight:700; color:var(--nxo-ink); margin-bottom:0.15rem; }
  .nxo-di-meta { font-size:0.72rem; color:var(--nxo-ink-soft); }
  .nxo-di-total { font-size:1rem; font-weight:800; color:var(--nxo-ink); }

  .nxo-review-wrap { margin-top: 1rem; }
  .nxo-review-card { border-top:1px solid var(--nxo-border); padding:1rem 1.25rem 1.25rem; background:linear-gradient(180deg, rgba(124,58,237,0.03), rgba(255,255,255,0.9)); }
  .nxo-review-head { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; margin-bottom:0.9rem; flex-wrap:wrap; }
  .nxo-review-title { font-size:1rem; font-weight:800; color:var(--nxo-ink); }
  .nxo-review-sub { font-size:0.72rem; color:var(--nxo-ink-soft); margin-top:0.25rem; }
  .nxo-review-stars { display:flex; gap:0.35rem; margin-bottom:0.75rem; }
  .nxo-review-star { width:36px; height:36px; border:1px solid var(--nxo-border); background:var(--nxo-surface); color:var(--nxo-ink-soft); cursor:pointer; font-size:0.9rem; transition:all 0.15s; border-radius:10px; }
  .nxo-review-star.active { background:var(--nxo-ink); color:#fff; border-color:var(--nxo-ink); }
  .nxo-review-text { width:100%; min-height:92px; background:var(--nxo-surface); border:1px solid var(--nxo-border); color:var(--nxo-ink); font-size:0.86rem; padding:0.9rem 1rem; resize:vertical; outline:none; font-family:'Inter',sans-serif; line-height:1.65; border-radius:14px; }
  .nxo-review-text:focus { border-color:var(--nxo-accent); box-shadow:0 0 0 4px rgba(124,58,237,0.12); }
  .nxo-review-meta { display:flex; justify-content:space-between; gap:1rem; align-items:center; margin-top:0.75rem; flex-wrap:wrap; }
  .nxo-review-btn { height:42px; padding:0 1.15rem; background:var(--nxo-ink); color:#fff; border:none; cursor:pointer; font-family:'Inter',sans-serif; font-size:0.7rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; border-radius:12px; }
  .nxo-review-btn:disabled { opacity:0.45; cursor:not-allowed; }
  .nxo-review-note { font-size:0.72rem; color:var(--nxo-ink-soft); }
  .nxo-review-ok { font-size:0.75rem; color:var(--nxo-success); margin-top:0.7rem; }
  .nxo-review-err { font-size:0.75rem; color:var(--nxo-danger); margin-top:0.7rem; }

  .nxo-notes-box { margin:0 1.25rem 1.25rem; background:rgba(124,58,237,0.04); border:1px solid var(--nxo-border); padding:0.9rem 1rem; border-radius:16px; }
  .nxo-notes-lbl { font-size:0.58rem; font-weight:800; text-transform:uppercase; letter-spacing:0.16em; color:var(--nxo-accent); margin-bottom:0.35rem; display:block; }
  .nxo-notes-txt { font-size:0.85rem; color:var(--nxo-ink-soft); line-height:1.7; }

  .nxo-empty { padding:4.5rem 1.5rem; text-align:center; border:1px solid var(--nxo-border); background:rgba(255,255,255,0.92); box-shadow:0 10px 30px rgba(17,24,39,0.06); }
  .nxo-empty-title { font-size:2rem; font-weight:900; color:var(--nxo-ink); margin-bottom:0.65rem; letter-spacing:-0.04em; }
  .nxo-empty-sub { font-size:0.88rem; color:var(--nxo-ink-soft); margin-bottom:1.5rem; }
  .nxo-cta { height:44px; padding:0 1.8rem; background:linear-gradient(135deg, var(--nxo-ink), var(--nxo-accent)); color:#fff; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; border:none; cursor:pointer; border-radius:12px; }

  .nxi-overlay { position:fixed; inset:0; background:rgba(17,24,39,0.68); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:2000; padding:1rem; }
  .nxi-modal { background:var(--nxo-surface); border:1px solid var(--nxo-border); width:100%; max-width:560px; max-height:92vh; overflow-y:auto; box-shadow:0 32px 80px rgba(17,24,39,0.24); border-radius:24px; }
  .nxi-header { background:linear-gradient(135deg, var(--nxo-ink), var(--nxo-accent)); padding:3rem 2.25rem 2.25rem; text-align:center; }
  .nxi-logo { font-size:2.6rem; font-weight:900; color:#fff; letter-spacing:-0.05em; line-height:1; margin-bottom:0.35rem; }
  .nxi-logo-sub { font-size:0.56rem; letter-spacing:0.32em; text-transform:uppercase; color:rgba(255,255,255,0.65); margin-bottom:1.25rem; display:block; }
  .nxi-num { font-size:1rem; font-weight:800; letter-spacing:0.18em; color:#f5d06f; text-transform:uppercase; margin-bottom:0.9rem; display:block; }
  .nxi-badge { display:inline-flex; align-items:center; gap:0.4rem; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.16); color:#fff; font-size:0.58rem; font-weight:800; letter-spacing:0.16em; text-transform:uppercase; padding:0.35rem 1rem; border-radius:999px; }
  .nxi-body { padding:2rem 1.5rem; }
  .nxi-meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; margin-bottom:2rem; }
  .nxi-meta { border:1px solid var(--nxo-border); padding:1rem 1.1rem; margin:-1px 0 0 -1px; background:var(--nxo-surface); }
  .nxi-meta-lbl { font-size:0.56rem; color:var(--nxo-ink-ghost); text-transform:uppercase; letter-spacing:0.18em; margin-bottom:0.45rem; display:block; font-weight:800; }
  .nxi-meta-val { font-size:0.98rem; font-weight:800; color:var(--nxo-ink); text-transform:capitalize; line-height:1.1; }
  .nxi-table { width:100%; border-collapse:collapse; margin-bottom:1.5rem; }
  .nxi-table thead tr { border-bottom:1.5px solid var(--nxo-ink); }
  .nxi-table th { padding:0.5rem 0.5rem 0.85rem; font-size:0.56rem; font-weight:800; color:var(--nxo-ink-soft); text-transform:uppercase; letter-spacing:0.18em; }
  .nxi-table th:first-child { text-align:left; }
  .nxi-table th:not(:first-child) { text-align:right; }
  .nxi-table td { padding:0.95rem 0.5rem; border-bottom:1px solid var(--nxo-border); }
  .nxi-table td:first-child { text-align:left; font-size:0.95rem; font-weight:700; color:var(--nxo-ink); letter-spacing:-0.02em; }
  .nxi-table td:not(:first-child) { text-align:right; font-size:0.88rem; color:var(--nxo-ink-soft); }
  .nxi-table tr:last-child td { border-bottom:none; }
  .nxi-total-row { display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, rgba(124,58,237,0.05), rgba(37,99,235,0.02)); border:1px solid var(--nxo-border); padding:1.2rem 1.25rem; margin-bottom:1.5rem; border-radius:18px; }
  .nxi-total-lbl { font-size:1rem; font-weight:800; color:var(--nxo-ink); letter-spacing:-0.02em; }
  .nxi-total-val { font-size:2rem; font-weight:900; color:var(--nxo-accent); letter-spacing:-0.04em; line-height:1; }
  .nxi-footer { border-top:1px solid var(--nxo-border); padding:1.75rem 1.5rem 2rem; text-align:center; background:var(--nxo-surface-2); }
  .nxi-footer-txt { font-size:0.78rem; color:var(--nxo-ink-soft); line-height:1.8; margin-bottom:1.25rem; }
  .nxi-close-btn { height:48px; padding:0 2rem; background:linear-gradient(135deg, var(--nxo-ink), var(--nxo-accent)); color:#fff; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:800; letter-spacing:0.16em; text-transform:uppercase; border:none; cursor:pointer; border-radius:12px; }
  .nxi-close-btn:hover { opacity:0.95; }
`;
if (!document.getElementById('nxo-styles')) { const el = document.createElement('style'); el.id = 'nxo-styles'; el.textContent = STYLES; document.head.appendChild(el); }

const ORDERS_PER_PAGE = 10;

function InvoiceModal({ invoice, order, onClose }) {
  if (!invoice || !order) return null;
  return (
    <div className="nxi-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nxi-modal">
        <div className="nxi-header">
          <div className="nxi-logo">Nexont</div>
          <span className="nxi-logo-sub">Marketplace Colombiano</span>
          <div className="nxi-num">{invoice.invoiceNumber}</div>
          <div className="nxi-badge">✓ Compra confirmada</div>
        </div>
        <div className="nxi-body">
          <div className="nxi-meta-grid">
            {[['Fecha', new Date(invoice.issuedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })], ['Método de pago', invoice.paymentMethod?.toLowerCase()], ['Orden #', order.id], ['Estado', <span style={{ color: '#16A34A' }}>{order.status?.toLowerCase()}</span>]].map(([l, v], i) => (
              <div key={i} className="nxi-meta"><span className="nxi-meta-lbl">{l}</span><span className="nxi-meta-val">{v}</span></div>
            ))}
          </div>
          <table className="nxi-table">
            <thead><tr><th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.productName}</td>
                  <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>${Number(item.unitPrice).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--amber)', fontWeight: 600 }}>${Number(item.lineTotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="nxi-total-row">
            <span className="nxi-total-lbl">Total</span>
            <span className="nxi-total-val">${Number(invoice.total).toFixed(2)}</span>
          </div>
        </div>
        <div className="nxi-footer">
          <p className="nxi-footer-txt">Gracias por tu compra en Nexont.<br />Guarda este comprobante para cualquier consulta.</p>
          <button className="nxi-close-btn" onClick={onClose}>Ver mis pedidos →</button>
        </div>
      </div>
    </div>
  );
}


const statusStyle = s => {
  const m = { PENDIENTE: { bg: '#FFFBEB', color: '#D97706', bc: '#D97706' }, CONFIRMADO: { bg: '#F0FDF4', color: '#16A34A', bc: '#16A34A' }, CANCELADO: { bg: '#FEF2F2', color: '#DC2626', bc: '#DC2626' }, ENTREGADO: { bg: '#EFF6FF', color: '#2563EB', bc: '#2563EB' } };
  return m[s?.toUpperCase()] || { bg: 'var(--cream-dark)', color: 'var(--ink-soft)', bc: 'var(--border)' };
};

// Miniatura de producto con fallback
function OrderThumbs({ items }) {
  const previews = items.slice(0, 3);
  return (
    <div className="nxo-order-thumbs">
      {previews.map((item, i) =>
        item.imageUrl
          ? <img key={i} className="nxo-order-thumb" src={item.imageUrl} alt={item.productName} />
          : (
            <div key={i} className="nxo-order-thumb-placeholder">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="14" height="14" rx="2" stroke="var(--ink-ghost)" strokeWidth="1" />
                <circle cx="6.5" cy="6.5" r="1.5" stroke="var(--ink-ghost)" strokeWidth="1" />
                <path d="M2 12l4-3 3 3 2-2 5 4" stroke="var(--ink-ghost)" strokeWidth="1" fill="none" />
              </svg>
            </div>
          )
      )}
    </div>
  );
}

// Paginación
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="nxo-pagination">
      <button
        className="nxo-page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >← Anterior</button>

      {pages.map(p => (
        <button
          key={p}
          className={`nxo-page-btn${currentPage === p ? ' active' : ''}`}
          onClick={() => onPageChange(p)}
        >{p}</button>
      ))}

      <button
        className="nxo-page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >Siguiente →</button>
    </div>
  );
}

function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromCheckout = location.state?.fromCheckout || false;
  const [view, setView] = useState(fromCheckout ? 'checkout' : 'list');
  const [cart, setCart] = useState(null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [loadingCart, setLoadingCart] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewLoading, setReviewLoading] = useState({});
  const [reviewMessage, setReviewMessage] = useState('');
  const validPaymentMethods = new Set(['efectivo', 'tarjeta']);

  const finalizeOrder = async (selectedPaymentMethod) => {
    const method = selectedPaymentMethod || paymentMethod;
    if (!validPaymentMethods.has(method)) {
      throw new Error('Selecciona un método de pago válido');
    }

    const { data } = await api.post('/orders', { paymentMethod: method, notes });
    setConfirmedOrder(data.order);
    setInvoiceData(data.invoice);
    setShowInvoice(true);
    return data;
  };

  useEffect(() => {
    if (view === 'checkout') { setLoadingCart(true); api.get('/cart').then(({ data }) => setCart(data)).catch(() => setCheckoutError('No se pudo cargar el carrito')).finally(() => setLoadingCart(false)); }
  }, [view]);

  useEffect(() => {
    if (view === 'list') {
      setLoadingOrders(true);
      setCurrentPage(1);
      api.get('/orders').then(({ data }) => setOrders(data)).catch(() => { }).finally(() => setLoadingOrders(false));
    }
  }, [view]);

  const handleConfirm = async () => {
    setCheckoutError('');
    if (!validPaymentMethods.has(paymentMethod)) {
      setCheckoutError('Selecciona un método de pago');
      return;
    }

    if (paymentMethod === 'tarjeta') return;

    setConfirming(true);
    try {
      await finalizeOrder('efectivo');
    } catch (err) {
      setCheckoutError(err.response?.data?.error || err.message || 'Error al confirmar la compra');
    } finally {
      setConfirming(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setCheckoutError('');
    setPaymentProcessing(true);
    try {
      await finalizeOrder('tarjeta');
    } catch (err) {
      setCheckoutError(err.response?.data?.error || err.message || 'Error al confirmar la compra');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentError = (error) => {
    setCheckoutError(error);
  };

  const handleReviewChange = (sellerId, field, value) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [sellerId]: {
        rating: 5,
        comment: '',
        ...(prev[sellerId] || {}),
        [field]: value,
      },
    }));
  };

  const submitReview = async (seller) => {
    if (!selectedOrder?.id || !seller?.id) return;

    const draft = reviewDrafts[seller.id] || { rating: 5, comment: '' };
    const rating = Number(draft.rating || 0);
    const comment = String(draft.comment || '').trim();

    if (!rating || rating < 1 || rating > 5) {
      setReviewMessage('Selecciona una calificación entre 1 y 5');
      return;
    }

    setReviewLoading((prev) => ({ ...prev, [seller.id]: true }));
    setReviewMessage('');

    try {
      const { data } = await api.post(`/reviews/sellers/${seller.id}/orders/${selectedOrder.id}`, {
        calificacion: rating,
        comentario: comment,
      });

      setSelectedOrder((prev) => {
        if (!prev) return prev;
        const updatedSellers = (prev.sellers || []).map((item) => (
          item.id === seller.id
            ? { ...item, review: { rating: data.review.rating, comment: data.review.comment, createdAt: data.review.createdAt } }
            : item
        ));
        return { ...prev, sellers: updatedSellers };
      });

      setReviewDrafts((prev) => ({
        ...prev,
        [seller.id]: { rating: 5, comment: '' },
      }));
      setReviewMessage('Reseña guardada correctamente');
    } catch (err) {
      setReviewMessage(err.response?.data?.error || err.message || 'No se pudo guardar la reseña');
    } finally {
      setReviewLoading((prev) => ({ ...prev, [seller.id]: false }));
    }
  };

  // Paginación calculada
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  if (view === 'checkout') {
    const hasOverStock = cart?.items?.some(i => i.quantity > (i.product?.stock ?? Infinity));
    return (
      <div className="nxo-root">
        <AssistedTopBar active="tienda" />
        <div className="nxo-page">
          <div className="nxo-eyebrow">Último paso</div>
          <h1 className="nxo-page-title">Confirmar compra</h1>
          {loadingCart && <p style={{ color: 'var(--ink-ghost)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cargando…</p>}
          {checkoutError && <div className="nxo-err">{checkoutError}</div>}
          {cart && cart.items?.length === 0 && <div className="nxo-empty"><div className="nxo-empty-title">Carrito vacío</div></div>}
          {cart && cart.items?.length > 0 && <>
            <div className="nxo-panel">
              <div className="nxo-panel-head"><span className="nxo-panel-title">Resumen del pedido</span></div>
              {cart.items.map(item => {
                const unitPrice = Number(item.product?.price ?? item.product?.precio ?? 0);
                const lineTotal = unitPrice * item.quantity;
                const stock = item.product?.stock ?? Infinity;
                const overStock = item.quantity > stock;
                const name = item.product?.titulo || item.product?.name || 'Producto';
                return (
                  <div key={item.product?.id ?? item.productId} className="nxo-co-item" style={{ background: overStock ? '#FEF2F2' : 'transparent' }}>
                    <div>
                      <div className="nxo-co-name">{name}</div>
                      <div className="nxo-co-meta">${unitPrice.toFixed(2)} c/u · Cant: {item.quantity}</div>
                      {overStock ? <div className="nxo-co-warn">⚠ Stock disponible: {stock}</div> : <div style={{ fontSize: '0.7rem', color: 'var(--ink-ghost)', marginTop: '0.15rem' }}>Stock: {stock}</div>}
                    </div>
                    <div className="nxo-co-total">${lineTotal.toFixed(2)}</div>
                  </div>
                );
              })}
              <div className="nxo-total-row"><span className="nxo-total-lbl">Total</span><span className="nxo-total-val">${Number(cart.subtotal || 0).toFixed(2)}</span></div>
            </div>
            <div className="nxo-panel">
              <div className="nxo-panel-head"><span className="nxo-panel-title">Método de pago</span></div>
              <label className="nxo-pay-option" style={{ cursor: 'pointer', transition: 'background 0.12s' }} onClick={() => setPaymentMethod('tarjeta')} onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <input type="radio" name="paymentMethod" value="tarjeta" checked={paymentMethod === 'tarjeta'} onChange={() => setPaymentMethod('tarjeta')} style={{ accentColor: 'var(--ink)', cursor: 'pointer' }} />
                <span style={{ width: 32, height: 32, border: '1px solid var(--border)', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="3.5" width="14" height="9" rx="0.5" stroke="#3D3830" strokeWidth="1" />
                    <circle cx="8" cy="8" r="2" stroke="#3D3830" strokeWidth="1" />
                    <line x1="3.5" y1="3.5" x2="3.5" y2="12.5" stroke="#3D3830" strokeWidth="1" />
                    <line x1="12.5" y1="3.5" x2="12.5" y2="12.5" stroke="#3D3830" strokeWidth="1" />
                  </svg>
                </span>
                <div><div className="nxo-pay-name">Tarjeta de crédito/débito</div><div className="nxo-pay-sub">Procesado por Stripe</div></div>
              </label>
              <label className="nxo-pay-option" style={{ cursor: 'pointer', transition: 'background 0.12s' }} onClick={() => setPaymentMethod('efectivo')} onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <input type="radio" name="paymentMethod" value="efectivo" checked={paymentMethod === 'efectivo'} onChange={() => setPaymentMethod('efectivo')} style={{ accentColor: 'var(--ink)', cursor: 'pointer' }} />
                <span style={{ width: 32, height: 32, border: '1px solid var(--border)', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 5C2 4.45228 2.44772 4 3 4H13C13.5523 4 14 4.45228 14 5V11C14 11.5523 13.5523 12 13 12H3C2.44772 12 2 11.5523 2 11V5Z" stroke="#3D3830" strokeWidth="1" />
                    <circle cx="8" cy="8" r="1.5" stroke="#3D3830" strokeWidth="1" />
                  </svg>
                </span>
                <div><div className="nxo-pay-name">Efectivo</div><div className="nxo-pay-sub">Pago en el momento de la entrega</div></div>
              </label>
              {paymentMethod === 'tarjeta' && (
                <div style={{ padding: '1.5rem 1.5rem 0' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Detalles de la tarjeta</div>
                  <StripePaymentForm
                    amount={Number(cart.subtotal || 0)}
                    orderId={cart.id || 'new'}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    isProcessing={paymentProcessing}
                    setIsProcessing={setPaymentProcessing}
                  />
                </div>
              )}
            </div>
            <div className="nxo-panel">
              <div className="nxo-panel-head"><span className="nxo-panel-title">Notas del pedido (opcional)</span></div>
              <textarea className="nxo-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones especiales, dirección de entrega…" rows={3} />
            </div>
            {paymentMethod === 'efectivo' && (
              <>
                <button className="nxo-confirm-btn" onClick={handleConfirm} disabled={confirming || hasOverStock}>
                  {confirming ? 'Procesando…' : '✓ Confirmar compra'}
                </button>
                {hasOverStock && <p className="nxo-confirm-warn">Ajusta las cantidades antes de continuar</p>}
              </>
            )}
          </>}
        </div>
        {showInvoice && <InvoiceModal invoice={invoiceData} order={confirmedOrder} onClose={() => { setShowInvoice(false); setView('list'); }} />}
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="nxo-root">
        <AssistedTopBar active="tienda" />
        <div className="nxo-page">
          <div className="nxo-eyebrow">Historial</div>
          <h1 className="nxo-page-title">Mis Pedidos</h1>
          {loadingOrders && <p style={{ color: 'var(--ink-ghost)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cargando…</p>}
          {!loadingOrders && orders.length === 0 && (
            <div className="nxo-empty">
              <div className="nxo-empty-title">Aún no has realizado compras</div>
              <p className="nxo-empty-sub">Explora el catálogo y realiza tu primera compra.</p>
              <button className="nxo-cta" onClick={() => navigate('/')}>Ir al catálogo →</button>
            </div>
          )}
          {paginatedOrders.map(order => {
            const ss = statusStyle(order.status);
            return (
              <div key={order.id} className="nxo-order-card" onClick={() => { setSelectedOrder(order); setReviewMessage(''); setReviewDrafts({}); setView('detail'); }}>
                <OrderThumbs items={order.items} />
                <div className="nxo-order-body">
                  <div className="nxo-order-top">
                    <div>
                      <div className="nxo-order-id">Pedido #{order.id}</div>
                      {order.invoiceNumber && <div className="nxo-order-inv">Factura: {order.invoiceNumber}</div>}
                      <div className="nxo-order-date">{new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className="nxo-order-meta">{order.items.length} producto{order.items.length !== 1 ? 's' : ''} · {order.paymentMethod?.toLowerCase()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="nxo-order-status" style={{ background: ss.bg, color: ss.color, borderColor: ss.bc }}>{order.status?.toLowerCase()}</div>
                      <div className="nxo-order-total">${Number(order.total).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {orders.length > ORDERS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          )}
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedOrder) {
    const ss = statusStyle(selectedOrder.status);
    const sellers = selectedOrder.sellers?.length
      ? selectedOrder.sellers
      : [...new Map(selectedOrder.items.map((item) => [item.sellerId, { id: item.sellerId, name: item.sellerName, review: null }]).filter(([id]) => id)).values()];
    const canReview = ['CONFIRMADO', 'ENTREGADO'].includes(String(selectedOrder.status || '').toUpperCase());
    return (
      <div className="nxo-root">
        <AssistedTopBar active="tienda" />
        <div className="nxo-page">
          <div className="nxo-eyebrow">Detalle</div>
          <h1 className="nxo-page-title">Pedido #{selectedOrder.id}</h1>
          <div className="nxo-panel" style={{ marginBottom: '1rem' }}>
            <div className="nxo-panel-head"><span className="nxo-panel-title">Información</span></div>
            <div className="nxo-detail-grid">
              {[['Estado', <span style={{ color: ss.color }}>{selectedOrder.status?.toLowerCase()}</span>], ['Método de pago', selectedOrder.paymentMethod?.toLowerCase()], ['Fecha', new Date(selectedOrder.createdAt).toLocaleString('es-CO')], selectedOrder.invoiceNumber ? ['Factura', <span style={{ color: 'var(--amber)' }}>{selectedOrder.invoiceNumber}</span>] : null].filter(Boolean).map(([l, v], i) => (
                <div key={i} className="nxo-detail-field"><span className="nxo-df-lbl">{l}</span><span className="nxo-df-val">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="nxo-panel" style={{ marginBottom: '1rem' }}>
            <div className="nxo-panel-head"><span className="nxo-panel-title">Productos</span></div>
            {selectedOrder.items.map((item, i) => (
              <div key={i} className="nxo-detail-item">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.productName} className="nxo-order-thumb" />
                  : <div className="nxo-order-thumb-placeholder"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" stroke="var(--ink-ghost)" strokeWidth="1" /><circle cx="6.5" cy="6.5" r="1.5" stroke="var(--ink-ghost)" strokeWidth="1" /><path d="M2 12l4-3 3 3 2-2 5 4" stroke="var(--ink-ghost)" strokeWidth="1" fill="none" /></svg></div>
                }
                <div><div className="nxo-di-name">{item.productName}</div><div className="nxo-di-meta">${Number(item.unitPrice).toFixed(2)} c/u · Cant: {item.quantity}</div></div>
                <div className="nxo-di-total">${Number(item.lineTotal).toFixed(2)}</div>
              </div>
            ))}
            <div className="nxo-total-row"><span className="nxo-total-lbl">Total</span><span className="nxo-total-val">${Number(selectedOrder.total).toFixed(2)}</span></div>
          </div>
          {selectedOrder.notes && (
            <div className="nxo-notes-box"><span className="nxo-notes-lbl">Notas</span><p className="nxo-notes-txt">{selectedOrder.notes}</p></div>
          )}

          {sellers.length > 0 && (
            <div className="nxo-panel">
              <div className="nxo-panel-head"><span className="nxo-panel-title">Reseñas del vendedor</span></div>
              <div className="nxo-review-wrap">
                {sellers.map((seller) => {
                  const draft = reviewDrafts[seller.id] || { rating: 5, comment: '' };
                  const hasReview = Boolean(seller.review);
                  return (
                    <div key={seller.id} className="nxo-review-card">
                      <div className="nxo-review-head">
                        <div>
                          <div className="nxo-review-title">{seller.name || 'Vendedor'}</div>
                          <div className="nxo-review-sub">{hasReview ? 'Ya dejaste una reseña para este vendedor en este pedido.' : 'Comparte tu experiencia con este vendedor.'}</div>
                        </div>
                        {hasReview && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {seller.review.rating}/5
                          </div>
                        )}
                      </div>

                      {hasReview ? (
                        <div style={{ fontSize: '0.84rem', color: 'var(--ink-mid)', lineHeight: 1.7 }}>
                          {seller.review.comment || 'Sin comentario'}
                        </div>
                      ) : canReview ? (
                        <>
                          <div className="nxo-review-stars">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                className={`nxo-review-star ${Number(draft.rating) >= value ? 'active' : ''}`}
                                onClick={() => handleReviewChange(seller.id, 'rating', value)}
                                aria-label={`Calificar con ${value} estrellas`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <textarea
                            className="nxo-review-text"
                            value={draft.comment}
                            onChange={(e) => handleReviewChange(seller.id, 'comment', e.target.value.slice(0, 300))}
                            placeholder="Comentario opcional de máximo 300 caracteres"
                            maxLength={300}
                            rows={3}
                          />
                          <div className="nxo-review-meta">
                            <div className="nxo-review-note">Tu opinión ayuda a otros compradores.</div>
                            <button
                              type="button"
                              className="nxo-review-btn"
                              onClick={() => submitReview(seller)}
                              disabled={reviewLoading[seller.id]}
                            >
                              {reviewLoading[seller.id] ? 'Guardando…' : 'Enviar reseña'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: '0.84rem', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                          La reseña estará disponible cuando el pedido esté confirmado.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {reviewMessage && (
                <div className={reviewMessage.includes('correctamente') ? 'nxo-review-ok' : 'nxo-review-err'} style={{ padding: '0 1.5rem 1rem' }}>
                  {reviewMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}
export default Orders;