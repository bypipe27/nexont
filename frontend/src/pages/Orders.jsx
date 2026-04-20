import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --cream:#F5F0E8; --cream-dark:#EDE8DF; --ink:#1A1714; --ink-mid:#3D3830; --ink-soft:#7A7268; --ink-ghost:#B8B0A6; --amber:#C4973A; --white:#FDFBF8; --border:rgba(26,23,20,0.1); }

  .nxo-root { min-height:100vh; background:var(--cream); font-family:'DM Sans',sans-serif; color:var(--ink); }

  .nxo-bar { position:sticky; top:0; z-index:100; height:68px; background:rgba(245,240,232,0.96); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 3rem; gap:1rem; }
  .nxo-brand { display:flex; align-items:center; gap:0.75rem; text-decoration:none; cursor:pointer; }
  .nxo-brand img { height:28px; }
  .nxo-brand-name { font-family:'Cormorant Garamond',serif; font-size:1.65rem; font-weight:600; color:var(--ink); letter-spacing:0.06em; }
  .nxo-sep { width:1px; height:20px; background:var(--border); }
  .nxo-bar-title { font-size:0.62rem; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:var(--ink-soft); }
  .nxo-gap { flex:1; }
  .nxo-back { height:36px; padding:0 1.25rem; background:transparent; border:1px solid var(--border); color:var(--ink-soft); font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; transition:all 0.18s; font-family:'DM Sans',sans-serif; }
  .nxo-back:hover { background:var(--ink); color:var(--cream); border-color:var(--ink); }

  .nxo-page { max-width:740px; margin:0 auto; padding:4rem 2rem 6rem; }

  .nxo-eyebrow { font-size:0.6rem; font-weight:600; letter-spacing:0.24em; text-transform:uppercase; color:var(--ink-soft); display:flex; align-items:center; gap:0.65rem; margin-bottom:0.65rem; }
  .nxo-eyebrow::before { content:''; display:block; width:22px; height:1px; background:var(--ink-soft); }

  .nxo-page-title {
    font-family:'Cormorant Garamond',serif;
    font-size:3.5rem;
    font-weight:200;
    color:var(--ink);
    margin-bottom:3rem;
    letter-spacing:-0.025em;
    line-height:1;
  }

  .nxo-panel { background:var(--white); border:1px solid var(--border); margin-bottom:1rem; }
  .nxo-panel-head { padding:0.95rem 1.5rem; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; background:var(--cream-dark); }
  .nxo-panel-title { font-size:0.6rem; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink-soft); }

  .nxo-co-item { display:grid; grid-template-columns:1fr auto; gap:1rem; padding:1.1rem 1.5rem; border-bottom:1px solid rgba(26,23,20,0.06); align-items:center; }
  .nxo-co-item:last-child { border-bottom:none; }
  .nxo-co-name { font-family:'Cormorant Garamond',serif; font-size:1.05rem; font-weight:300; color:var(--ink); margin-bottom:0.2rem; }
  .nxo-co-meta { font-size:0.72rem; color:var(--ink-soft); }
  .nxo-co-warn { font-size:0.7rem; color:#DC2626; margin-top:0.2rem; }
  .nxo-co-total { font-family:'Cormorant Garamond',serif; font-weight:300; color:var(--ink); font-size:1.15rem; letter-spacing:-0.01em; }

  .nxo-total-row { display:flex; justify-content:space-between; align-items:center; padding:1.1rem 1.5rem; border-top:1px solid var(--border); background:var(--cream); }
  .nxo-total-lbl { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:300; color:var(--ink); }
  .nxo-total-val { font-family:'Cormorant Garamond',serif; font-size:1.8rem; font-weight:200; color:var(--amber); letter-spacing:-0.02em; }

  .nxo-pay-option { display:flex; align-items:center; gap:1rem; padding:1.1rem 1.5rem; cursor:pointer; }
  .nxo-pay-name { font-size:0.88rem; font-weight:500; color:var(--ink); margin-bottom:0.15rem; }
  .nxo-pay-sub { font-size:0.72rem; color:var(--ink-soft); }

  .nxo-notes { width:calc(100% - 3rem); background:var(--cream); border:1px solid var(--border); color:var(--ink); font-size:0.85rem; font-family:'DM Sans',sans-serif; padding:0.85rem 1rem; resize:vertical; outline:none; transition:border-color 0.2s; margin:0.85rem 1.5rem; line-height:1.7; }
  .nxo-notes:focus { border-color:var(--ink); }
  .nxo-notes::placeholder { color:var(--ink-ghost); }

  .nxo-confirm-btn { width:100%; height:52px; background:var(--ink); color:var(--cream); font-family:'DM Sans',sans-serif; font-weight:500; font-size:0.78rem; letter-spacing:0.14em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.2s; margin-top:0.85rem; }
  .nxo-confirm-btn:hover:not(:disabled) { background:var(--ink-mid); }
  .nxo-confirm-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .nxo-confirm-warn { color:#DC2626; font-size:0.78rem; text-align:center; margin-top:0.5rem; }
  .nxo-err { background:#FEF2F2; border:1px solid #FCA5A5; padding:0.7rem 1rem; margin-bottom:1rem; color:#DC2626; font-size:0.82rem; }

  /* ORDER CARD con imagen miniatura */
  .nxo-order-card { background:var(--white); border:1px solid var(--border); padding:1.25rem 1.5rem; margin-bottom:0.75rem; cursor:pointer; transition:background 0.12s; display:flex; align-items:flex-start; gap:1rem; }
  .nxo-order-card:hover { background:var(--cream-dark); }
  .nxo-order-thumbs { display:flex; gap:0.35rem; flex-shrink:0; }
  .nxo-order-thumb { width:48px; height:48px; object-fit:cover; border:1px solid var(--border); background:var(--cream-dark); flex-shrink:0; }
  .nxo-order-thumb-placeholder { width:48px; height:48px; background:var(--cream-dark); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .nxo-order-body { flex:1; min-width:0; }
  .nxo-order-top { display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; flex-wrap:wrap; }
  .nxo-order-id { font-family:'Cormorant Garamond',serif; font-size:1.25rem; font-weight:300; color:var(--ink); margin-bottom:0.2rem; letter-spacing:-0.01em; }
  .nxo-order-inv { font-size:0.68rem; color:var(--ink-ghost); margin-bottom:0.2rem; }
  .nxo-order-date { font-size:0.72rem; color:var(--ink-soft); }
  .nxo-order-status { display:inline-block; padding:0.2rem 0.85rem; font-size:0.6rem; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; border:1px solid; margin-bottom:0.5rem; white-space:nowrap; }
  .nxo-order-total { font-family:'Cormorant Garamond',serif; font-weight:200; color:var(--amber); font-size:1.5rem; letter-spacing:-0.02em; }
  .nxo-order-meta { font-size:0.72rem; color:var(--ink-ghost); margin-top:0.4rem; }

  /* PAGINACIÓN */
  .nxo-pagination { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-top:2rem; }
  .nxo-page-btn { height:36px; min-width:36px; padding:0 0.85rem; background:transparent; border:1px solid var(--border); color:var(--ink-soft); font-size:0.72rem; letter-spacing:0.08em; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
  .nxo-page-btn:hover:not(:disabled) { background:var(--ink); color:var(--cream); border-color:var(--ink); }
  .nxo-page-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .nxo-page-btn.active { background:var(--ink); color:var(--cream); border-color:var(--ink); }
  .nxo-page-info { font-size:0.72rem; color:var(--ink-soft); letter-spacing:0.06em; }

  .nxo-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; }
  .nxo-detail-field { padding:1rem 1.5rem; border-bottom:1px solid rgba(26,23,20,0.06); border-right:1px solid rgba(26,23,20,0.06); }
  .nxo-detail-field:nth-child(2n) { border-right:none; }
  .nxo-df-lbl { font-size:0.58rem; color:var(--ink-ghost); text-transform:uppercase; letter-spacing:0.14em; margin-bottom:0.35rem; display:block; }
  .nxo-df-val { font-family:'Cormorant Garamond',serif; font-size:1rem; font-weight:300; color:var(--ink); text-transform:capitalize; }

  .nxo-detail-item { display:grid; grid-template-columns:48px 1fr auto; gap:0.85rem; padding:1rem 1.5rem; border-bottom:1px solid rgba(26,23,20,0.06); align-items:center; }
  .nxo-detail-item:last-child { border-bottom:none; }
  .nxo-di-name { font-size:0.9rem; font-weight:500; color:var(--ink); margin-bottom:0.15rem; }
  .nxo-di-meta { font-size:0.72rem; color:var(--ink-soft); }
  .nxo-di-total { font-family:'Cormorant Garamond',serif; font-weight:300; color:var(--ink); font-size:1.05rem; }

  .nxo-notes-box { margin:0 1.5rem 1.5rem; background:var(--cream); border:1px solid var(--border); padding:0.9rem 1.1rem; }
  .nxo-notes-lbl { font-size:0.58rem; font-weight:600; text-transform:uppercase; letter-spacing:0.14em; color:var(--amber); margin-bottom:0.35rem; display:block; }
  .nxo-notes-txt { font-size:0.85rem; color:var(--ink-soft); line-height:1.7; }

  .nxo-empty { padding:5rem 2rem; text-align:center; border:1px solid var(--border); background:var(--white); }
  .nxo-empty-title { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:200; color:var(--ink); margin-bottom:0.65rem; letter-spacing:-0.015em; }
  .nxo-empty-sub { font-size:0.85rem; color:var(--ink-soft); margin-bottom:2rem; }
  .nxo-cta { height:44px; padding:0 2.25rem; background:var(--ink); color:var(--cream); font-family:'DM Sans',sans-serif; font-size:0.74rem; letter-spacing:0.14em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.2s; }
  .nxo-cta:hover { background:var(--ink-mid); }

  /* INVOICE MODAL */
  .nxi-overlay { position:fixed; inset:0; background:rgba(26,23,20,0.7); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:2000; padding:1rem; }
  .nxi-modal { background:var(--white); border:1px solid var(--border); width:100%; max-width:560px; max-height:92vh; overflow-y:auto; box-shadow:0 32px 80px rgba(26,23,20,0.28); }
  .nxi-header { background:var(--ink); padding:3.5rem 2.5rem 2.5rem; text-align:center; }
  .nxi-logo { font-family:'Cormorant Garamond',serif; font-size:4rem; font-weight:300; color:var(--cream); letter-spacing:0.12em; line-height:1; margin-bottom:0.3rem; }
  .nxi-logo-sub { font-size:0.56rem; letter-spacing:0.32em; text-transform:uppercase; color:rgba(245,240,232,0.3); margin-bottom:1.75rem; display:block; }
  .nxi-num { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:400; letter-spacing:0.22em; color:var(--amber); text-transform:uppercase; margin-bottom:1rem; display:block; }
  .nxi-badge { display:inline-flex; align-items:center; gap:0.4rem; background:rgba(22,163,74,0.1); border:1px solid rgba(22,163,74,0.22); color:#4ADE80; font-size:0.58rem; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; padding:0.35rem 1.1rem; }
  .nxi-body { padding:2.25rem 2.5rem; }
  .nxi-meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; margin-bottom:2.25rem; }
  .nxi-meta { border:1px solid var(--border); padding:1.1rem 1.25rem; margin:-1px 0 0 -1px; }
  .nxi-meta-lbl { font-size:0.56rem; color:var(--ink-ghost); text-transform:uppercase; letter-spacing:0.18em; margin-bottom:0.45rem; display:block; }
  .nxi-meta-val { font-family:'Cormorant Garamond',serif; font-size:1.2rem; font-weight:400; color:var(--ink); text-transform:capitalize; line-height:1.1; }
  .nxi-table { width:100%; border-collapse:collapse; margin-bottom:1.75rem; }
  .nxi-table thead tr { border-bottom:1.5px solid var(--ink); }
  .nxi-table th { padding:0.5rem 0.5rem 0.85rem; font-size:0.56rem; font-weight:600; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.18em; }
  .nxi-table th:first-child { text-align:left; }
  .nxi-table th:not(:first-child) { text-align:right; }
  .nxi-table td { padding:1rem 0.5rem; border-bottom:1px solid var(--border); }
  .nxi-table td:first-child { text-align:left; font-family:'Cormorant Garamond',serif; font-size:1.15rem; font-weight:400; color:var(--ink); letter-spacing:-0.01em; }
  .nxi-table td:not(:first-child) { text-align:right; font-size:0.88rem; color:var(--ink-mid); }
  .nxi-table tr:last-child td { border-bottom:none; }
  .nxi-total-row { display:flex; justify-content:space-between; align-items:center; background:var(--cream); border:1px solid var(--border); padding:1.4rem 1.5rem; margin-bottom:1.75rem; }
  .nxi-total-lbl { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:300; color:var(--ink); letter-spacing:-0.01em; }
  .nxi-total-val { font-family:'Cormorant Garamond',serif; font-size:2.5rem; font-weight:200; color:var(--amber); letter-spacing:-0.03em; line-height:1; }
  .nxi-footer { border-top:1px solid var(--border); padding:2rem 2.5rem; text-align:center; background:var(--cream); }
  .nxi-footer-txt { font-size:0.78rem; color:var(--ink-ghost); line-height:1.9; margin-bottom:1.75rem; }
  .nxi-close-btn { height:50px; padding:0 3rem; background:var(--ink); color:var(--cream); font-family:'DM Sans',sans-serif; font-size:0.74rem; letter-spacing:0.16em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.2s; }
  .nxi-close-btn:hover { background:var(--ink-mid); }
`;
if (!document.getElementById('nxo-styles')) { const el=document.createElement('style'); el.id='nxo-styles'; el.textContent=STYLES; document.head.appendChild(el); }

const ORDERS_PER_PAGE = 10;

function InvoiceModal({ invoice, order, onClose }) {
  if (!invoice || !order) return null;
  return (
    <div className="nxi-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="nxi-modal">
        <div className="nxi-header">
          <div className="nxi-logo">Nexont</div>
          <span className="nxi-logo-sub">Marketplace Colombiano</span>
          <div className="nxi-num">{invoice.invoiceNumber}</div>
          <div className="nxi-badge">✓ Compra confirmada</div>
        </div>
        <div className="nxi-body">
          <div className="nxi-meta-grid">
            {[['Fecha',new Date(invoice.issuedAt).toLocaleDateString('es-CO',{year:'numeric',month:'short',day:'numeric'})],['Método de pago',invoice.paymentMethod?.toLowerCase()],['Orden #',order.id],['Estado',<span style={{color:'#16A34A'}}>{order.status?.toLowerCase()}</span>]].map(([l,v],i) => (
              <div key={i} className="nxi-meta"><span className="nxi-meta-lbl">{l}</span><span className="nxi-meta-val">{v}</span></div>
            ))}
          </div>
          <table className="nxi-table">
            <thead><tr><th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th></tr></thead>
            <tbody>
              {order.items.map((item,i) => (
                <tr key={i}>
                  <td>{item.productName}</td>
                  <td style={{textAlign:'right'}}>{item.quantity}</td>
                  <td style={{textAlign:'right'}}>${Number(item.unitPrice).toFixed(2)}</td>
                  <td style={{textAlign:'right',color:'var(--amber)',fontWeight:600}}>${Number(item.lineTotal).toFixed(2)}</td>
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

function OrdBar({ title, backLabel, onBack }) {
  const navigate = useNavigate();
  return (
    <header className="nxo-bar">
      <div className="nxo-brand" onClick={() => navigate('/')}><img src="/resources/icone.png" alt="Nexont" /><span className="nxo-brand-name">Nexont</span></div>
      <div className="nxo-sep" /><span className="nxo-bar-title">{title}</span>
      <div className="nxo-gap" />
      <button className="nxo-back" onClick={onBack}>← {backLabel}</button>
    </header>
  );
}

const statusStyle = s => {
  const m = { PENDIENTE:{bg:'#FFFBEB',color:'#D97706',bc:'#D97706'}, CONFIRMADO:{bg:'#F0FDF4',color:'#16A34A',bc:'#16A34A'}, CANCELADO:{bg:'#FEF2F2',color:'#DC2626',bc:'#DC2626'}, ENTREGADO:{bg:'#EFF6FF',color:'#2563EB',bc:'#2563EB'} };
  return m[s?.toUpperCase()] || { bg:'var(--cream-dark)', color:'var(--ink-soft)', bc:'var(--border)' };
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
                <rect x="2" y="2" width="14" height="14" rx="2" stroke="var(--ink-ghost)" strokeWidth="1"/>
                <circle cx="6.5" cy="6.5" r="1.5" stroke="var(--ink-ghost)" strokeWidth="1"/>
                <path d="M2 12l4-3 3 3 2-2 5 4" stroke="var(--ink-ghost)" strokeWidth="1" fill="none"/>
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
  const [loadingCart, setLoadingCart] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (view==='checkout') { setLoadingCart(true); api.get('/cart').then(({data})=>setCart(data)).catch(()=>setCheckoutError('No se pudo cargar el carrito')).finally(()=>setLoadingCart(false)); }
  }, [view]);

  useEffect(() => {
    if (view==='list') {
      setLoadingOrders(true);
      setCurrentPage(1);
      api.get('/orders').then(({data})=>setOrders(data)).catch(()=>{}).finally(()=>setLoadingOrders(false));
    }
  }, [view]);

  const handleConfirm = async () => {
    setCheckoutError(''); setConfirming(true);
    try { const { data } = await api.post('/orders', { paymentMethod:'efectivo', notes }); setConfirmedOrder(data.order); setInvoiceData(data.invoice); setShowInvoice(true); }
    catch (err) { setCheckoutError(err.response?.data?.error || 'Error al confirmar la compra'); }
    finally { setConfirming(false); }
  };

  // Paginación calculada
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  if (view==='checkout') {
    const hasOverStock = cart?.items?.some(i => i.quantity > (i.product?.stock ?? Infinity));
    return (
      <div className="nxo-root">
        <OrdBar title="Confirmar compra" backLabel="Volver al carrito" onBack={() => navigate('/cart')} />
        <div className="nxo-page">
          <div className="nxo-eyebrow">Último paso</div>
          <h1 className="nxo-page-title">Confirmar compra</h1>
          {loadingCart && <p style={{color:'var(--ink-ghost)',fontSize:'0.78rem',letterSpacing:'0.12em',textTransform:'uppercase'}}>Cargando…</p>}
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
                  <div key={item.product?.id ?? item.productId} className="nxo-co-item" style={{background:overStock?'#FEF2F2':'transparent'}}>
                    <div>
                      <div className="nxo-co-name">{name}</div>
                      <div className="nxo-co-meta">${unitPrice.toFixed(2)} c/u · Cant: {item.quantity}</div>
                      {overStock ? <div className="nxo-co-warn">⚠ Stock disponible: {stock}</div> : <div style={{fontSize:'0.7rem',color:'var(--ink-ghost)',marginTop:'0.15rem'}}>Stock: {stock}</div>}
                    </div>
                    <div className="nxo-co-total">${lineTotal.toFixed(2)}</div>
                  </div>
                );
              })}
              <div className="nxo-total-row"><span className="nxo-total-lbl">Total</span><span className="nxo-total-val">${Number(cart.subtotal||0).toFixed(2)}</span></div>
            </div>
            <div className="nxo-panel">
              <div className="nxo-panel-head"><span className="nxo-panel-title">Método de pago</span></div>
              <div className="nxo-pay-option">
                <input type="radio" defaultChecked readOnly style={{accentColor:'var(--ink)'}} />
                <span style={{width:32,height:32,border:'1px solid var(--border)',background:'var(--cream-dark)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="3.5" width="14" height="9" rx="0.5" stroke="#3D3830" strokeWidth="1"/>
                    <circle cx="8" cy="8" r="2" stroke="#3D3830" strokeWidth="1"/>
                    <line x1="3.5" y1="3.5" x2="3.5" y2="12.5" stroke="#3D3830" strokeWidth="1"/>
                    <line x1="12.5" y1="3.5" x2="12.5" y2="12.5" stroke="#3D3830" strokeWidth="1"/>
                  </svg>
                </span>
                <div><div className="nxo-pay-name">Efectivo</div><div className="nxo-pay-sub">Pago en el momento de la entrega</div></div>
              </div>
            </div>
            <div className="nxo-panel">
              <div className="nxo-panel-head"><span className="nxo-panel-title">Notas del pedido (opcional)</span></div>
              <textarea className="nxo-notes" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Instrucciones especiales, dirección de entrega…" rows={3} />
            </div>
            <button className="nxo-confirm-btn" onClick={handleConfirm} disabled={confirming||hasOverStock}>
              {confirming ? 'Procesando…' : '✓ Confirmar compra'}
            </button>
            {hasOverStock && <p className="nxo-confirm-warn">Ajusta las cantidades antes de continuar</p>}
          </>}
        </div>
        {showInvoice && <InvoiceModal invoice={invoiceData} order={confirmedOrder} onClose={() => { setShowInvoice(false); setView('list'); }} />}
      </div>
    );
  }

  if (view==='list') {
    return (
      <div className="nxo-root">
        <OrdBar title="Mis Pedidos" backLabel="Volver a tienda" onBack={() => navigate('/')} />
        <div className="nxo-page">
          <div className="nxo-eyebrow">Historial</div>
          <h1 className="nxo-page-title">Mis Pedidos</h1>
          {loadingOrders && <p style={{color:'var(--ink-ghost)',fontSize:'0.78rem',letterSpacing:'0.12em',textTransform:'uppercase'}}>Cargando…</p>}
          {!loadingOrders && orders.length===0 && (
            <div className="nxo-empty">
              <div className="nxo-empty-title">Aún no has realizado compras</div>
              <p className="nxo-empty-sub">Explora el catálogo y realiza tu primera compra.</p>
              <button className="nxo-cta" onClick={() => navigate('/')}>Ir al catálogo →</button>
            </div>
          )}
          {paginatedOrders.map(order => {
            const ss = statusStyle(order.status);
            return (
              <div key={order.id} className="nxo-order-card" onClick={() => { setSelectedOrder(order); setView('detail'); }}>
                <OrderThumbs items={order.items} />
                <div className="nxo-order-body">
                  <div className="nxo-order-top">
                    <div>
                      <div className="nxo-order-id">Pedido #{order.id}</div>
                      {order.invoiceNumber && <div className="nxo-order-inv">Factura: {order.invoiceNumber}</div>}
                      <div className="nxo-order-date">{new Date(order.createdAt).toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'})}</div>
                      <div className="nxo-order-meta">{order.items.length} producto{order.items.length!==1?'s':''} · {order.paymentMethod?.toLowerCase()}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div className="nxo-order-status" style={{background:ss.bg,color:ss.color,borderColor:ss.bc}}>{order.status?.toLowerCase()}</div>
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

  if (view==='detail' && selectedOrder) {
    const ss = statusStyle(selectedOrder.status);
    return (
      <div className="nxo-root">
        <OrdBar title={`Pedido #${selectedOrder.id}`} backLabel="Mis pedidos" onBack={() => setView('list')} />
        <div className="nxo-page">
          <div className="nxo-eyebrow">Detalle</div>
          <h1 className="nxo-page-title">Pedido #{selectedOrder.id}</h1>
          <div className="nxo-panel" style={{marginBottom:'1rem'}}>
            <div className="nxo-panel-head"><span className="nxo-panel-title">Información</span></div>
            <div className="nxo-detail-grid">
              {[['Estado',<span style={{color:ss.color}}>{selectedOrder.status?.toLowerCase()}</span>],['Método de pago',selectedOrder.paymentMethod?.toLowerCase()],['Fecha',new Date(selectedOrder.createdAt).toLocaleString('es-CO')],selectedOrder.invoiceNumber?['Factura',<span style={{color:'var(--amber)'}}>{selectedOrder.invoiceNumber}</span>]:null].filter(Boolean).map(([l,v],i)=>(
                <div key={i} className="nxo-detail-field"><span className="nxo-df-lbl">{l}</span><span className="nxo-df-val">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="nxo-panel" style={{marginBottom:'1rem'}}>
            <div className="nxo-panel-head"><span className="nxo-panel-title">Productos</span></div>
            {selectedOrder.items.map((item,i) => (
              <div key={i} className="nxo-detail-item">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.productName} className="nxo-order-thumb" />
                  : <div className="nxo-order-thumb-placeholder"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" stroke="var(--ink-ghost)" strokeWidth="1"/><circle cx="6.5" cy="6.5" r="1.5" stroke="var(--ink-ghost)" strokeWidth="1"/><path d="M2 12l4-3 3 3 2-2 5 4" stroke="var(--ink-ghost)" strokeWidth="1" fill="none"/></svg></div>
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
        </div>
      </div>
    );
  }
  return null;
}
export default Orders;