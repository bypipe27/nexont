import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  .nx-ord-root { min-height: 100vh; background: #0a0908; font-family: 'Inter', sans-serif; color: #f0ece4; }

  /* Topbar */
  .nx-ord-bar {
    position: sticky; top: 0; z-index: 100; height: 60px;
    background: rgba(10,9,8,0.96); backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(212,163,62,0.12);
    display: flex; align-items: center; padding: 0 2rem; gap: 1rem;
  }
  .nx-ord-brand { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; cursor: pointer; }
  .nx-ord-brand img { height: 28px; }
  .nx-ord-brand-name { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800; color: #f0ece4; }
  .nx-ord-bar-sep { width: 1px; height: 22px; background: rgba(212,163,62,0.18); }
  .nx-ord-bar-title { font-family: 'Syne', sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(240,236,228,0.38); }
  .nx-ord-bar-gap { flex: 1; }
  .nx-ord-back-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    height: 34px; padding: 0 1rem; border-radius: 6px;
    background: transparent; border: 1px solid rgba(240,236,228,0.1);
    color: rgba(240,236,228,0.5); font-size: 0.8rem; cursor: pointer;
    transition: all 0.18s; font-family: 'Inter', sans-serif;
  }
  .nx-ord-back-btn:hover { border-color: rgba(212,163,62,0.35); color: #d4a33e; }

  /* Page */
  .nx-ord-page { max-width: 760px; margin: 0 auto; padding: 2.5rem 2rem 5rem; }

  .nx-ord-eyebrow { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; }
  .nx-ord-eyebrow-bar { width: 18px; height: 2px; background: #d4a33e; border-radius: 2px; }
  .nx-ord-eyebrow-txt { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #d4a33e; }
  .nx-ord-title { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; color: #f0ece4; letter-spacing: -0.01em; margin-bottom: 2rem; }

  /* Alerts */
  .nx-ord-err { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 7px; padding: 0.7rem 1rem; margin-bottom: 1rem; color: #ef4444; font-size: 0.82rem; }

  /* Panel */
  .nx-ord-panel { background: rgba(255,255,255,0.022); border: 1px solid rgba(212,163,62,0.1); border-radius: 10px; overflow: hidden; margin-bottom: 1.1rem; }
  .nx-ord-panel-head { padding: 0.85rem 1.25rem; border-bottom: 1px solid rgba(212,163,62,0.08); display: flex; align-items: center; justify-content: space-between; }
  .nx-ord-panel-title { font-family: 'Syne', sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(240,236,228,0.4); }

  /* Checkout items */
  .nx-co-item { display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center; padding: 0.85rem 1.25rem; border-bottom: 1px solid rgba(212,163,62,0.06); }
  .nx-co-item:last-child { border-bottom: none; }
  .nx-co-item-name { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #f0ece4; margin-bottom: 0.2rem; }
  .nx-co-item-meta { font-size: 0.75rem; color: rgba(240,236,228,0.38); }
  .nx-co-item-warn { font-size: 0.72rem; color: #ef4444; margin-top: 0.2rem; }
  .nx-co-item-total { font-family: 'Syne', sans-serif; font-weight: 800; color: #f0ece4; font-size: 0.95rem; }

  /* Summary row */
  .nx-co-total-row { display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.25rem; }
  .nx-co-total-lbl { font-family: 'Syne', sans-serif; font-weight: 800; color: #f0ece4; }
  .nx-co-total-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; color: #d4a33e; }

  /* Payment method */
  .nx-pay-option {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 0.9rem 1.25rem; cursor: pointer;
    border: 2px solid rgba(212,163,62,0.25);
    border-radius: 8px; background: rgba(212,163,62,0.05);
    margin: 0.85rem 1.25rem;
  }
  .nx-pay-option-name { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #f0ece4; margin-bottom: 0.15rem; }
  .nx-pay-option-sub { font-size: 0.72rem; color: rgba(240,236,228,0.38); }

  /* Notes */
  .nx-notes-area {
    width: 100%; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(212,163,62,0.12); border-radius: 7px;
    color: #f0ece4; font-size: 0.85rem; font-family: 'Inter', sans-serif;
    padding: 0.75rem 1rem; resize: vertical; outline: none;
    transition: border-color 0.2s; box-sizing: border-box; line-height: 1.6;
    margin: 0.85rem 1.25rem; width: calc(100% - 2.5rem);
  }
  .nx-notes-area:focus { border-color: rgba(212,163,62,0.38); }
  .nx-notes-area::placeholder { color: rgba(240,236,228,0.2); }

  /* Confirm button */
  .nx-confirm-btn {
    width: 100%; height: 50px; border: none; border-radius: 8px;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.95rem;
    letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s;
    margin-top: 0.5rem;
  }
  .nx-confirm-btn:hover:not(:disabled) { background: #e8b84b; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(212,163,62,0.3); }
  .nx-confirm-btn:disabled { opacity: 0.38; cursor: not-allowed; }
  .nx-confirm-warn { color: #ef4444; font-size: 0.8rem; text-align: center; margin-top: 0.5rem; }

  /* Orders list */
  .nx-order-card {
    background: rgba(255,255,255,0.022); border: 1px solid rgba(212,163,62,0.09);
    border-radius: 9px; padding: 1.1rem 1.25rem; margin-bottom: 0.85rem;
    cursor: pointer; transition: all 0.2s;
  }
  .nx-order-card:hover { border-color: rgba(212,163,62,0.28); background: rgba(255,255,255,0.038); transform: translateY(-1px); }
  .nx-order-card-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
  .nx-order-id { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 800; color: #f0ece4; margin-bottom: 0.15rem; }
  .nx-order-invoice { font-size: 0.7rem; color: rgba(240,236,228,0.3); margin-bottom: 0.1rem; }
  .nx-order-date { font-size: 0.75rem; color: rgba(240,236,228,0.32); }
  .nx-order-status {
    display: inline-block; padding: 0.2rem 0.7rem; border-radius: 20px;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; margin-bottom: 0.4rem;
  }
  .nx-order-total { font-family: 'Syne', sans-serif; font-weight: 800; color: #d4a33e; font-size: 1rem; }
  .nx-order-meta { font-size: 0.75rem; color: rgba(240,236,228,0.28); }

  /* Detail info grid */
  .nx-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; padding: 1rem 1.25rem; }
  .nx-detail-field-lbl { font-size: 0.65rem; color: rgba(240,236,228,0.3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; display: block; }
  .nx-detail-field-val { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #f0ece4; text-transform: capitalize; }

  /* Detail items */
  .nx-detail-item { display: grid; grid-template-columns: 1fr auto; gap: 1rem; padding: 0.8rem 1.25rem; border-bottom: 1px solid rgba(212,163,62,0.06); align-items: center; }
  .nx-detail-item:last-child { border-bottom: none; }
  .nx-detail-item-name { font-size: 0.88rem; font-weight: 500; color: #f0ece4; margin-bottom: 0.15rem; }
  .nx-detail-item-meta { font-size: 0.72rem; color: rgba(240,236,228,0.35); }
  .nx-detail-item-total { font-family: 'Syne', sans-serif; font-weight: 800; color: #f0ece4; }

  /* Notes box */
  .nx-notes-box { margin: 0 1.25rem 1.25rem; background: rgba(212,163,62,0.05); border: 1px solid rgba(212,163,62,0.14); border-radius: 7px; padding: 0.75rem 1rem; }
  .nx-notes-lbl { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #d4a33e; margin-bottom: 0.3rem; display: block; }
  .nx-notes-txt { font-size: 0.85rem; color: rgba(240,236,228,0.55); line-height: 1.6; }

  /* Empty */
  .nx-ord-empty { padding: 4rem 2rem; text-align: center; border: 1px dashed rgba(212,163,62,0.14); border-radius: 10px; background: rgba(212,163,62,0.018); }
  .nx-ord-empty-icon { font-size: 3rem; opacity: 0.28; display: block; margin-bottom: 1rem; }
  .nx-ord-empty-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 800; color: #f0ece4; margin-bottom: 0.5rem; }
  .nx-ord-empty-sub { font-size: 0.85rem; color: rgba(240,236,228,0.35); margin-bottom: 1.5rem; }
  .nx-ord-cta-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.82rem;
    padding: 0 1.5rem; height: 40px; border-radius: 7px; border: none; cursor: pointer; transition: all 0.2s;
  }
  .nx-ord-cta-btn:hover { background: #e8b84b; }

  /* ── INVOICE MODAL ── */
  .nx-inv-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px); display: flex; align-items: center;
    justify-content: center; z-index: 2000; padding: 1rem;
  }
  .nx-inv-modal {
    background: #111009; border: 1px solid rgba(212,163,62,0.2);
    border-radius: 12px; width: 100%; max-width: 520px;
    max-height: 92vh; overflow-y: auto;
    box-shadow: 0 40px 100px rgba(0,0,0,0.75);
  }
  .nx-inv-header {
    background: linear-gradient(135deg, #0d0b09, #1a1612);
    padding: 1.75rem 2rem; border-bottom: 1px solid rgba(212,163,62,0.15);
    text-align: center;
  }
  .nx-inv-logo { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: #f0ece4; margin-bottom: 0.25rem; }
  .nx-inv-logo-sub { font-size: 0.68rem; color: rgba(212,163,62,0.6); letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 1rem; display: block; }
  .nx-inv-num { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #d4a33e; }
  .nx-inv-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25);
    color: #4ade80; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; padding: 0.28rem 0.8rem; border-radius: 20px; margin-top: 0.5rem;
  }
  .nx-inv-body { padding: 1.5rem 2rem; }
  .nx-inv-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1.5rem; }
  .nx-inv-meta-item { background: rgba(212,163,62,0.05); border: 1px solid rgba(212,163,62,0.1); border-radius: 7px; padding: 0.65rem 0.85rem; }
  .nx-inv-meta-lbl { font-size: 0.62rem; color: rgba(240,236,228,0.3); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.25rem; display: block; }
  .nx-inv-meta-val { font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700; color: #f0ece4; text-transform: capitalize; }

  .nx-inv-table { width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; }
  .nx-inv-table thead tr { border-bottom: 1px solid rgba(212,163,62,0.12); }
  .nx-inv-table th { padding: 0.5rem 0.5rem 0.65rem; font-size: 0.65rem; font-weight: 700; color: rgba(240,236,228,0.3); text-transform: uppercase; letter-spacing: 0.1em; }
  .nx-inv-table th:first-child { text-align: left; }
  .nx-inv-table th:not(:first-child) { text-align: right; }
  .nx-inv-table td { padding: 0.6rem 0.5rem; font-size: 0.82rem; color: rgba(240,236,228,0.7); border-bottom: 1px solid rgba(212,163,62,0.05); }
  .nx-inv-table td:first-child { text-align: left; color: #f0ece4; font-weight: 500; }
  .nx-inv-table td:not(:first-child) { text-align: right; }
  .nx-inv-table tr:last-child td { border-bottom: none; }

  .nx-inv-total-row {
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(212,163,62,0.08); border: 1px solid rgba(212,163,62,0.18);
    border-radius: 8px; padding: 0.9rem 1.1rem; margin-bottom: 1.5rem;
  }
  .nx-inv-total-lbl { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.95rem; color: #f0ece4; }
  .nx-inv-total-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; color: #d4a33e; }

  .nx-inv-footer { border-top: 1px solid rgba(212,163,62,0.08); padding: 1rem 2rem 1.5rem; text-align: center; }
  .nx-inv-footer-txt { font-size: 0.72rem; color: rgba(240,236,228,0.22); line-height: 1.6; margin-bottom: 1rem; }
  .nx-inv-close-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.85rem;
    padding: 0 2rem; height: 42px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s;
  }
  .nx-inv-close-btn:hover { background: #e8b84b; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,163,62,0.3); }
`;

if (!document.getElementById('nx-ord-styles')) {
  const el = document.createElement('style');
  el.id = 'nx-ord-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

// ─── Modal Factura ────────────────────────────────────────────────────────────
function InvoiceModal({ invoice, order, onClose }) {
  if (!invoice || !order) return null;
  const stars = n => '★'.repeat(Math.round(n||0))+'☆'.repeat(5-Math.round(n||0));

  return (
    <div className="nx-inv-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nx-inv-modal">
        <div className="nx-inv-header">
          <div className="nx-inv-logo">Nexont</div>
          <span className="nx-inv-logo-sub">Marketplace Colombiano</span>
          <div className="nx-inv-num">{invoice.invoiceNumber}</div>
          <div className="nx-inv-badge">✓ Compra confirmada</div>
        </div>

        <div className="nx-inv-body">
          <div className="nx-inv-meta-grid">
            <div className="nx-inv-meta-item">
              <span className="nx-inv-meta-lbl">Fecha de emisión</span>
              <span className="nx-inv-meta-val">{new Date(invoice.issuedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="nx-inv-meta-item">
              <span className="nx-inv-meta-lbl">Método de pago</span>
              <span className="nx-inv-meta-val">{invoice.paymentMethod?.toLowerCase()}</span>
            </div>
            <div className="nx-inv-meta-item">
              <span className="nx-inv-meta-lbl">Orden #</span>
              <span className="nx-inv-meta-val">{order.id}</span>
            </div>
            <div className="nx-inv-meta-item">
              <span className="nx-inv-meta-lbl">Estado</span>
              <span className="nx-inv-meta-val" style={{ color: '#4ade80' }}>{order.status?.toLowerCase()}</span>
            </div>
          </div>

          <table className="nx-inv-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>P. Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.productName}</td>
                  <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>${Number(item.unitPrice).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: '#d4a33e', fontWeight: 700 }}>${Number(item.lineTotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="nx-inv-total-row">
            <span className="nx-inv-total-lbl">TOTAL</span>
            <span className="nx-inv-total-val">${Number(invoice.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="nx-inv-footer">
          <p className="nx-inv-footer-txt">
            Gracias por tu compra en Nexont.<br />
            Guarda este comprobante para cualquier consulta.
          </p>
          <button className="nx-inv-close-btn" onClick={onClose}>
            Ver mis pedidos →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Topbar compartido ────────────────────────────────────────────────────────
function OrdTopbar({ title, backLabel, onBack }) {
  const navigate = useNavigate();
  return (
    <header className="nx-ord-bar">
      <div className="nx-ord-brand" onClick={() => navigate('/')}>
        <img src="/resources/icone.png" alt="Nexont" />
        <span className="nx-ord-brand-name">Nexont</span>
      </div>
      <div className="nx-ord-bar-sep" />
      <span className="nx-ord-bar-title">{title}</span>
      <div className="nx-ord-bar-gap" />
      <button className="nx-ord-back-btn" onClick={onBack}>← {backLabel}</button>
    </header>
  );
}

// ─── Orders ───────────────────────────────────────────────────────────────────
function Orders() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const fromCheckout = location.state?.fromCheckout || false;
  const [view, setView] = useState(fromCheckout ? 'checkout' : 'list');

  const [cart, setCart]             = useState(null);
  const [notes, setNotes]           = useState('');
  const [loadingCart, setLoadingCart] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const [orders, setOrders]         = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (view === 'checkout') {
      setLoadingCart(true);
      api.get('/cart')
        .then(({ data }) => setCart(data))
        .catch(() => setCheckoutError('No se pudo cargar el carrito'))
        .finally(() => setLoadingCart(false));
    }
  }, [view]);

  useEffect(() => {
    if (view === 'list') {
      setLoadingOrders(true);
      api.get('/orders')
        .then(({ data }) => setOrders(data))
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [view]);

  const handleConfirm = async () => {
    setCheckoutError(''); setConfirming(true);
    try {
      const { data } = await api.post('/orders', { paymentMethod: 'efectivo', notes });
      setConfirmedOrder(data.order);
      setInvoiceData(data.invoice);
      setShowInvoice(true);
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Error al confirmar la compra');
    } finally { setConfirming(false); }
  };

  const handleInvoiceClose = () => { setShowInvoice(false); setView('list'); };

  const statusStyle = {
    PENDIENTE:   { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
    CONFIRMADO:  { bg: 'rgba(74,222,128,0.1)',  color: '#4ade80' },
    CANCELADO:   { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
    ENTREGADO:   { bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa' },
  };
  const getStatusStyle = s => statusStyle[s?.toUpperCase()] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(240,236,228,0.5)' };

  // ── Checkout ────────────────────────────────────────────────────────────────
  if (view === 'checkout') {
    const hasOverStock = cart?.items?.some(i => i.quantity > (i.product?.stock ?? Infinity));

    return (
      <div className="nx-ord-root">
        <OrdTopbar title="Confirmar compra" backLabel="Volver al carrito" onBack={() => navigate('/cart')} />
        <div className="nx-ord-page">
          <div className="nx-ord-eyebrow"><div className="nx-ord-eyebrow-bar" /><span className="nx-ord-eyebrow-txt">Último paso</span></div>
          <h1 className="nx-ord-title">Confirmar compra</h1>

          {loadingCart && <p style={{ color: 'rgba(240,236,228,0.4)', fontSize: '0.88rem' }}>Cargando carrito…</p>}
          {checkoutError && <div className="nx-ord-err">{checkoutError}</div>}

          {cart && cart.items?.length === 0 && (
            <div className="nx-ord-empty">
              <span className="nx-ord-empty-icon">🛒</span>
              <div className="nx-ord-empty-title">Carrito vacío</div>
            </div>
          )}

          {cart && cart.items?.length > 0 && (
            <>
              {/* Productos */}
              <div className="nx-ord-panel">
                <div className="nx-ord-panel-head"><span className="nx-ord-panel-title">Resumen del pedido</span></div>
                {cart.items.map((item) => {
                  const unitPrice = Number(item.product?.price ?? item.product?.precio ?? 0);
                  const lineTotal = unitPrice * item.quantity;
                  const stock     = item.product?.stock ?? Infinity;
                  const overStock = item.quantity > stock;
                  const name      = item.product?.titulo || item.product?.name || 'Producto';

                  return (
                    <div key={item.product?.id ?? item.productId} className="nx-co-item" style={{ background: overStock ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                      <div>
                        <div className="nx-co-item-name">{name}</div>
                        <div className="nx-co-item-meta">${unitPrice.toFixed(2)} c/u · Cant: {item.quantity}</div>
                        {overStock
                          ? <div className="nx-co-item-warn">⚠ Stock disponible: {stock}</div>
                          : <div style={{ fontSize: '0.72rem', color: 'rgba(240,236,228,0.25)', marginTop: '0.15rem' }}>Stock disponible: {stock}</div>
                        }
                      </div>
                      <div className="nx-co-item-total">${lineTotal.toFixed(2)}</div>
                    </div>
                  );
                })}
                <div className="nx-co-total-row" style={{ borderTop: '1px solid rgba(212,163,62,0.08)' }}>
                  <span className="nx-co-total-lbl">Total</span>
                  <span className="nx-co-total-val">${Number(cart.subtotal || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Método de pago */}
              <div className="nx-ord-panel">
                <div className="nx-ord-panel-head"><span className="nx-ord-panel-title">Método de pago</span></div>
                <div className="nx-pay-option">
                  <input type="radio" defaultChecked readOnly style={{ accentColor: '#d4a33e' }} />
                  <span style={{ fontSize: '1.2rem' }}>💵</span>
                  <div>
                    <div className="nx-pay-option-name">Efectivo</div>
                    <div className="nx-pay-option-sub">Pago en el momento de la entrega</div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div className="nx-ord-panel">
                <div className="nx-ord-panel-head"><span className="nx-ord-panel-title">Notas del pedido (opcional)</span></div>
                <textarea
                  className="nx-notes-area"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Instrucciones especiales, dirección de entrega…"
                  rows={3}
                />
              </div>

              <button className="nx-confirm-btn" onClick={handleConfirm} disabled={confirming || hasOverStock}>
                {confirming ? 'Procesando…' : '✓ Confirmar compra'}
              </button>
              {hasOverStock && <p className="nx-confirm-warn">Ajusta las cantidades antes de continuar (algunos productos exceden el stock)</p>}
            </>
          )}
        </div>

        {showInvoice && <InvoiceModal invoice={invoiceData} order={confirmedOrder} onClose={handleInvoiceClose} />}
      </div>
    );
  }

  // ── Lista de pedidos ─────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="nx-ord-root">
        <OrdTopbar title="Mis Pedidos" backLabel="Volver a tienda" onBack={() => navigate('/')} />
        <div className="nx-ord-page">
          <div className="nx-ord-eyebrow"><div className="nx-ord-eyebrow-bar" /><span className="nx-ord-eyebrow-txt">Historial</span></div>
          <h1 className="nx-ord-title">Mis Pedidos</h1>

          {loadingOrders && <p style={{ color: 'rgba(240,236,228,0.4)', fontSize: '0.88rem' }}>Cargando pedidos…</p>}

          {!loadingOrders && orders.length === 0 && (
            <div className="nx-ord-empty">
              <span className="nx-ord-empty-icon">📦</span>
              <div className="nx-ord-empty-title">Aún no tienes pedidos</div>
              <p className="nx-ord-empty-sub">Explora el catálogo y realiza tu primera compra.</p>
              <button className="nx-ord-cta-btn" onClick={() => navigate('/')}>Ir a la tienda →</button>
            </div>
          )}

          {orders.map(order => {
            const ss = getStatusStyle(order.status);
            return (
              <div key={order.id} className="nx-order-card" onClick={() => { setSelectedOrder(order); setView('detail'); }}>
                <div className="nx-order-card-top">
                  <div>
                    <div className="nx-order-id">Pedido #{order.id}</div>
                    {order.invoiceNumber && <div className="nx-order-invoice">Factura: {order.invoiceNumber}</div>}
                    <div className="nx-order-date">{new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="nx-order-status" style={{ background: ss.bg, color: ss.color }}>
                      {order.status?.toLowerCase()}
                    </span>
                    <div className="nx-order-total">${Number(order.total).toFixed(2)}</div>
                  </div>
                </div>
                <div className="nx-order-meta">
                  {order.items.length} producto{order.items.length !== 1 ? 's' : ''} · {order.paymentMethod?.toLowerCase()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Detalle de pedido ────────────────────────────────────────────────────────
  if (view === 'detail' && selectedOrder) {
    const ss = getStatusStyle(selectedOrder.status);
    return (
      <div className="nx-ord-root">
        <OrdTopbar title={`Pedido #${selectedOrder.id}`} backLabel="Mis pedidos" onBack={() => setView('list')} />
        <div className="nx-ord-page">
          <div className="nx-ord-eyebrow"><div className="nx-ord-eyebrow-bar" /><span className="nx-ord-eyebrow-txt">Detalle</span></div>
          <h1 className="nx-ord-title">Pedido #{selectedOrder.id}</h1>

          {/* Info */}
          <div className="nx-ord-panel" style={{ marginBottom: '1.1rem' }}>
            <div className="nx-ord-panel-head"><span className="nx-ord-panel-title">Información del pedido</span></div>
            <div className="nx-detail-grid">
              <div>
                <span className="nx-detail-field-lbl">Estado</span>
                <span className="nx-detail-field-val" style={{ color: ss.color }}>{selectedOrder.status?.toLowerCase()}</span>
              </div>
              <div>
                <span className="nx-detail-field-lbl">Método de pago</span>
                <span className="nx-detail-field-val">{selectedOrder.paymentMethod?.toLowerCase()}</span>
              </div>
              <div>
                <span className="nx-detail-field-lbl">Fecha</span>
                <span className="nx-detail-field-val" style={{ fontSize: '0.8rem' }}>{new Date(selectedOrder.createdAt).toLocaleString('es-CO')}</span>
              </div>
              {selectedOrder.invoiceNumber && (
                <div>
                  <span className="nx-detail-field-lbl">Factura</span>
                  <span className="nx-detail-field-val" style={{ color: '#d4a33e' }}>{selectedOrder.invoiceNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="nx-ord-panel" style={{ marginBottom: '1.1rem' }}>
            <div className="nx-ord-panel-head"><span className="nx-ord-panel-title">Productos</span></div>
            {selectedOrder.items.map((item, idx) => (
              <div key={idx} className="nx-detail-item">
                <div>
                  <div className="nx-detail-item-name">{item.productName}</div>
                  <div className="nx-detail-item-meta">${Number(item.unitPrice).toFixed(2)} c/u · Cant: {item.quantity}</div>
                </div>
                <div className="nx-detail-item-total">${Number(item.lineTotal).toFixed(2)}</div>
              </div>
            ))}
            <div className="nx-co-total-row" style={{ borderTop: '1px solid rgba(212,163,62,0.08)' }}>
              <span className="nx-co-total-lbl">Total</span>
              <span className="nx-co-total-val">${Number(selectedOrder.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Notas */}
          {selectedOrder.notes && (
            <div className="nx-notes-box">
              <span className="nx-notes-lbl">Notas del pedido</span>
              <p className="nx-notes-txt">{selectedOrder.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default Orders;