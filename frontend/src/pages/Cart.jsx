import { useNavigate } from 'react-router-dom';
import { useHybridCart } from '../hooks/useHybridCart';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --cream:#F5F0E8; --cream-dark:#EDE8DF; --ink:#1A1714; --ink-mid:#3D3830; --ink-soft:#7A7268; --ink-ghost:#B8B0A6; --amber:#C4973A; --white:#FDFBF8; --border:rgba(26,23,20,0.1); }

  .nxc-root { min-height:100vh; background:var(--cream); font-family:'DM Sans',sans-serif; color:var(--ink); }

  .nxc-bar { position:sticky; top:0; z-index:100; height:68px; background:rgba(245,240,232,0.96); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 3rem; gap:1rem; }
  .nxc-brand { display:flex; align-items:center; gap:0.75rem; text-decoration:none; cursor:pointer; }
  .nxc-brand img { height:28px; }
  .nxc-brand-name { font-family:'Cormorant Garamond',serif; font-size:1.65rem; font-weight:600; color:var(--ink); letter-spacing:0.06em; }
  .nxc-sep { width:1px; height:20px; background:var(--border); }
  .nxc-title-bar { font-size:0.62rem; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:var(--ink-soft); }
  .nxc-gap { flex:1; }
  .nxc-back { height:36px; padding:0 1.25rem; background:transparent; border:1px solid var(--border); color:var(--ink-soft); font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; transition:all 0.18s; font-family:'DM Sans',sans-serif; }
  .nxc-back:hover { background:var(--ink); color:var(--cream); border-color:var(--ink); }

  .nxc-page { max-width:840px; margin:0 auto; padding:4rem 2rem 6rem; }

  .nxc-eyebrow { font-size:0.6rem; font-weight:600; letter-spacing:0.24em; text-transform:uppercase; color:var(--ink-soft); display:flex; align-items:center; gap:0.65rem; margin-bottom:0.65rem; }
  .nxc-eyebrow::before { content:''; display:block; width:22px; height:1px; background:var(--ink-soft); }

  .nxc-page-title {
    font-family:'Cormorant Garamond',serif;
    font-size:3.5rem;
    font-weight:200;
    color:var(--ink);
    margin-bottom:3rem;
    letter-spacing:-0.025em;
    line-height:1;
  }

  .nxc-alert-err { background:#FEF2F2; border:1px solid #FCA5A5; padding:0.7rem 1rem; margin-bottom:1rem; color:#DC2626; font-size:0.82rem; }
  .nxc-alert-ok  { background:#F0FDF4; border:1px solid #86EFAC; padding:0.7rem 1rem; margin-bottom:1rem; color:#16A34A; font-size:0.82rem; }

  .nxc-empty { padding:5rem 2rem; text-align:center; border:1px solid var(--border); background:var(--white); }
  .nxc-empty-title { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:200; color:var(--ink); margin-bottom:0.65rem; letter-spacing:-0.015em; }
  .nxc-empty-sub { font-size:0.85rem; color:var(--ink-soft); }

  .nxc-items { border:1px solid var(--border); background:var(--white); margin-bottom:1.5rem; }
  .nxc-item { display:grid; grid-template-columns:1fr auto auto auto; gap:1.5rem; align-items:center; padding:1.35rem 1.75rem; border-bottom:1px solid rgba(26,23,20,0.06); transition:background 0.12s; }
  .nxc-item:last-child { border-bottom:none; }
  .nxc-item:hover { background:var(--cream); }

  .nxc-item-info { display:flex; align-items:center; gap:1.1rem; }
  .nxc-item-img { width:64px; height:64px; overflow:hidden; background:var(--cream-dark); flex-shrink:0; border:1px solid var(--border); }
  .nxc-item-img img { width:100%; height:100%; object-fit:cover; }
  .nxc-item-noimg { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--ink-ghost); font-size:0.7rem; }
  .nxc-item-name { font-family:'Cormorant Garamond',serif; font-size:1.15rem; font-weight:300; color:var(--ink); margin-bottom:0.2rem; letter-spacing:-0.01em; }
  .nxc-item-price { font-size:0.75rem; color:var(--ink-soft); }
  .nxc-item-stock { font-size:0.68rem; color:var(--ink-ghost); margin-top:0.1rem; }

  .nxc-qty { display:flex; align-items:center; gap:0.5rem; }
  .nxc-qty-btn { width:30px; height:30px; background:var(--white); border:1px solid var(--border); color:var(--ink-soft); cursor:pointer; font-size:0.9rem; font-weight:500; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .nxc-qty-btn:hover:not(:disabled) { background:var(--ink); color:var(--cream); border-color:var(--ink); }
  .nxc-qty-btn:disabled { opacity:0.25; cursor:not-allowed; }
  .nxc-qty-val { min-width:28px; text-align:center; font-size:0.9rem; font-weight:500; color:var(--ink); }

  .nxc-line-total { font-family:'Cormorant Garamond',serif; font-weight:300; font-size:1.15rem; color:var(--ink); min-width:80px; text-align:right; letter-spacing:-0.01em; }

  .nxc-remove { height:30px; padding:0 0.85rem; background:transparent; border:1px solid rgba(220,38,38,0.25); color:#DC2626; font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
  .nxc-remove:hover { background:#DC2626; color:white; border-color:#DC2626; }

  .nxc-summary { background:var(--white); border:1px solid var(--border); padding:1.75rem 2rem; }
  .nxc-summary-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem; }
  .nxc-summary-lbl { font-size:0.72rem; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.12em; }
  .nxc-summary-val { font-size:0.85rem; color:var(--ink-mid); }
  .nxc-summary-divider { border:none; border-top:1px solid var(--border); margin:1.25rem 0; }
  .nxc-summary-total-lbl { font-family:'Cormorant Garamond',serif; font-size:1.2rem; font-weight:300; color:var(--ink); }
  .nxc-summary-total-val { font-family:'Cormorant Garamond',serif; font-size:1.8rem; font-weight:200; color:var(--amber); letter-spacing:-0.02em; }

  .nxc-summary-actions { display:flex; gap:0.85rem; margin-top:1.75rem; }
  .nxc-checkout-btn { flex:1; height:50px; background:var(--ink); color:var(--cream); font-family:'DM Sans',sans-serif; font-weight:500; font-size:0.76rem; letter-spacing:0.14em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.2s; }
  .nxc-checkout-btn:hover { background:var(--ink-mid); }
  .nxc-clear-btn { height:50px; padding:0 1.75rem; background:transparent; border:1px solid var(--border); color:var(--ink-soft); font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; transition:all 0.18s; font-family:'DM Sans',sans-serif; }
  .nxc-clear-btn:hover { border-color:var(--ink); color:var(--ink); }
`;
if (!document.getElementById('nxc-styles')) { const el=document.createElement('style'); el.id='nxc-styles'; el.textContent=STYLES; document.head.appendChild(el); }

function Cart() {
  const navigate = useNavigate();
  const { cart, loading, error, success, updateCartQuantity, removeCartItem, clearCart } = useHybridCart();
  return (
    <div className="nxc-root">
      <header className="nxc-bar">
        <div className="nxc-brand" onClick={() => navigate('/')}><img src="/resources/icone.png" alt="Nexont" /><span className="nxc-brand-name">Nexont</span></div>
        <div className="nxc-sep" /><span className="nxc-title-bar">Mi Carrito</span>
        <div className="nxc-gap" />
        <button className="nxc-back" onClick={() => navigate('/')}>← Volver a tienda</button>
      </header>
      <div className="nxc-page">
        <div className="nxc-eyebrow">Tu selección</div>
        <h1 className="nxc-page-title">Mi Carrito</h1>
        {loading && <p style={{ color:'var(--ink-ghost)', fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase' }}>Cargando…</p>}
        {error   && <div className="nxc-alert-err">{error}</div>}
        {success && <div className="nxc-alert-ok">{success}</div>}
        {!loading && cart.items.length === 0 ? (
          <div className="nxc-empty">
            <div className="nxc-empty-title">Tu carrito está vacío</div>
            <p className="nxc-empty-sub">Explora el catálogo y agrega productos que te interesen.</p>
          </div>
        ) : !loading && (
          <>
            <div className="nxc-items">
              {cart.items.map(item => {
                const pid = item.product?.id ?? item.productId;
                const titulo = item.product?.titulo || 'Producto';
                const unitPrice = Number(item.product?.price ?? item.product?.precio ?? 0);
                const lineTotal = unitPrice * item.quantity;
                const imageUrl = item.product?.imagenes?.[0]?.url || null;
                const stock = item.product?.stock;
                return (
                  <div key={pid} className="nxc-item">
                    <div className="nxc-item-info">
                      <div className="nxc-item-img">{imageUrl ? <img src={imageUrl} alt={titulo} /> : <div className="nxc-item-noimg">📦</div>}</div>
                      <div>
                        <div className="nxc-item-name">{titulo}</div>
                        <div className="nxc-item-price">${unitPrice.toFixed(2)} c/u</div>
                        {stock !== undefined && <div className="nxc-item-stock">Stock: {stock}</div>}
                      </div>
                    </div>
                    <div className="nxc-qty">
                      <button className="nxc-qty-btn" onClick={() => updateCartQuantity(pid, Math.max(1, item.quantity-1))}>−</button>
                      <span className="nxc-qty-val">{item.quantity}</span>
                      <button className="nxc-qty-btn" disabled={stock !== undefined && item.quantity >= stock} onClick={() => updateCartQuantity(pid, item.quantity+1)}>+</button>
                    </div>
                    <div className="nxc-line-total">${lineTotal.toFixed(2)}</div>
                    <button className="nxc-remove" onClick={() => removeCartItem(pid)}>Quitar</button>
                  </div>
                );
              })}
            </div>
            <div className="nxc-summary">
              <div className="nxc-summary-row"><span className="nxc-summary-lbl">Productos</span><span className="nxc-summary-val">{cart.totalItems}</span></div>
              <hr className="nxc-summary-divider" />
              <div className="nxc-summary-row"><span className="nxc-summary-total-lbl">Total</span><span className="nxc-summary-total-val">${Number(cart.subtotal||0).toFixed(2)}</span></div>
              <div className="nxc-summary-actions">
                <button className="nxc-checkout-btn" onClick={() => navigate('/orders', { state:{ fromCheckout:true } })}>Continuar compra →</button>
                <button className="nxc-clear-btn" onClick={clearCart}>Limpiar</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default Cart;