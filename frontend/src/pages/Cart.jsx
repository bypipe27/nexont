import { useNavigate } from 'react-router-dom';
import { useHybridCart } from '../hooks/useHybridCart';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  .nx-cart-root { min-height: 100vh; background: #0a0908; font-family: 'Inter', sans-serif; color: #f0ece4; }

  .nx-cart-bar {
    position: sticky; top: 0; z-index: 100;
    height: 60px; background: rgba(10,9,8,0.96); backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(212,163,62,0.12);
    display: flex; align-items: center; padding: 0 2rem; gap: 1rem;
  }
  .nx-cart-bar-brand { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; cursor: pointer; }
  .nx-cart-bar-brand img { height: 28px; }
  .nx-cart-bar-brand-name { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800; color: #f0ece4; }
  .nx-cart-bar-sep { width: 1px; height: 22px; background: rgba(212,163,62,0.18); }
  .nx-cart-bar-title { font-family: 'Syne', sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(240,236,228,0.38); }
  .nx-cart-bar-gap { flex: 1; }
  .nx-cart-back-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    height: 34px; padding: 0 1rem; border-radius: 6px;
    background: transparent; border: 1px solid rgba(240,236,228,0.1);
    color: rgba(240,236,228,0.5); font-size: 0.8rem; cursor: pointer; transition: all 0.18s;
    font-family: 'Inter', sans-serif;
  }
  .nx-cart-back-btn:hover { border-color: rgba(212,163,62,0.35); color: #d4a33e; }

  .nx-cart-page { max-width: 860px; margin: 0 auto; padding: 2.5rem 2rem 5rem; }

  .nx-cart-header { margin-bottom: 2rem; }
  .nx-cart-eyebrow { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; }
  .nx-cart-eyebrow-bar { width: 18px; height: 2px; background: #d4a33e; border-radius: 2px; }
  .nx-cart-eyebrow-txt { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #d4a33e; }
  .nx-cart-title { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; color: #f0ece4; letter-spacing: -0.01em; }

  .nx-cart-alert-err { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 7px; padding: 0.7rem 1rem; margin-bottom: 1rem; color: #ef4444; font-size: 0.82rem; }
  .nx-cart-alert-ok  { background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); border-radius: 7px; padding: 0.7rem 1rem; margin-bottom: 1rem; color: #4ade80; font-size: 0.82rem; }

  .nx-cart-empty {
    padding: 4rem 2rem; text-align: center;
    border: 1px dashed rgba(212,163,62,0.14); border-radius: 10px;
    background: rgba(212,163,62,0.018);
  }
  .nx-cart-empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.28; display: block; }
  .nx-cart-empty-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 800; color: #f0ece4; margin-bottom: 0.5rem; }
  .nx-cart-empty-sub { font-size: 0.85rem; color: rgba(240,236,228,0.35); }

  .nx-cart-items {
    background: rgba(255,255,255,0.022); border: 1px solid rgba(212,163,62,0.1);
    border-radius: 10px; overflow: hidden; margin-bottom: 1.25rem;
  }
  .nx-cart-item {
    display: grid; grid-template-columns: 1fr auto auto auto;
    gap: 1rem; align-items: center; padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(212,163,62,0.06); transition: background 0.15s;
  }
  .nx-cart-item:last-child { border-bottom: none; }
  .nx-cart-item:hover { background: rgba(212,163,62,0.025); }
  .nx-cart-item-info { display: flex; align-items: center; gap: 0.85rem; }
  .nx-cart-item-img {
    width: 56px; height: 56px; border-radius: 7px; overflow: hidden;
    background: #1a1612; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: rgba(240,236,228,0.2); font-size: 0.7rem;
  }
  .nx-cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
  .nx-cart-item-name { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #f0ece4; margin-bottom: 0.2rem; letter-spacing: 0.01em; }
  .nx-cart-item-price { font-size: 0.75rem; color: rgba(240,236,228,0.38); }
  .nx-cart-item-stock { font-size: 0.68rem; color: rgba(240,236,228,0.25); margin-top: 0.1rem; }

  .nx-cart-qty { display: flex; align-items: center; gap: 0.4rem; }
  .nx-cart-qty-btn {
    width: 28px; height: 28px; border-radius: 5px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(212,163,62,0.14);
    color: rgba(240,236,228,0.6); font-size: 0.9rem; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .nx-cart-qty-btn:hover:not(:disabled) { background: rgba(212,163,62,0.12); color: #d4a33e; border-color: rgba(212,163,62,0.3); }
  .nx-cart-qty-btn:disabled { opacity: 0.25; cursor: not-allowed; }
  .nx-cart-qty-val { min-width: 24px; text-align: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.88rem; color: #f0ece4; }

  .nx-cart-line-total { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.95rem; color: #f0ece4; min-width: 80px; text-align: right; }

  .nx-cart-remove-btn {
    height: 30px; padding: 0 0.7rem; border-radius: 5px; border: none;
    background: rgba(239,68,68,0.1); color: #ef4444; font-size: 0.72rem;
    font-weight: 600; cursor: pointer; transition: all 0.15s;
    font-family: 'Inter', sans-serif;
  }
  .nx-cart-remove-btn:hover { background: rgba(239,68,68,0.2); }

  .nx-cart-summary {
    background: rgba(255,255,255,0.022); border: 1px solid rgba(212,163,62,0.1);
    border-radius: 10px; padding: 1.25rem 1.5rem;
  }
  .nx-cart-summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; }
  .nx-cart-summary-row:last-of-type { margin-bottom: 0; }
  .nx-cart-summary-lbl { font-size: 0.82rem; color: rgba(240,236,228,0.4); }
  .nx-cart-summary-val { font-size: 0.82rem; color: rgba(240,236,228,0.7); font-weight: 500; }
  .nx-cart-summary-total-lbl { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 800; color: #f0ece4; }
  .nx-cart-summary-total-val { font-family: 'Syne', sans-serif; font-size: 1.25rem; font-weight: 800; color: #d4a33e; }
  .nx-cart-summary-divider { border: none; border-top: 1px solid rgba(212,163,62,0.08); margin: 0.85rem 0; }
  .nx-cart-summary-actions { display: flex; gap: 0.75rem; margin-top: 1.1rem; flex-wrap: wrap; }

  .nx-cart-checkout-btn {
    flex: 1; height: 44px; border-radius: 8px; border: none;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.88rem;
    letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s;
  }
  .nx-cart-checkout-btn:hover { background: #e8b84b; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,163,62,0.3); }
  .nx-cart-clear-btn {
    height: 44px; padding: 0 1.25rem; border-radius: 8px;
    background: transparent; border: 1px solid rgba(240,236,228,0.1);
    color: rgba(240,236,228,0.38); font-size: 0.8rem; cursor: pointer;
    transition: all 0.18s; font-family: 'Inter', sans-serif;
  }
  .nx-cart-clear-btn:hover { border-color: rgba(239,68,68,0.3); color: #ef4444; }
`;

if (!document.getElementById('nx-cart-styles')) {
  const el = document.createElement('style');
  el.id = 'nx-cart-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

function Cart() {
  const navigate = useNavigate();
  const { cart, loading, error, success, updateCartQuantity, removeCartItem, clearCart } = useHybridCart();

  return (
    <div className="nx-cart-root">
      <header className="nx-cart-bar">
        <div className="nx-cart-bar-brand" onClick={() => navigate('/')}>
          <img src="/resources/icone.png" alt="Nexont" />
          <span className="nx-cart-bar-brand-name">Nexont</span>
        </div>
        <div className="nx-cart-bar-sep" />
        <span className="nx-cart-bar-title">Mi Carrito</span>
        <div className="nx-cart-bar-gap" />
        <button className="nx-cart-back-btn" onClick={() => navigate('/')}>← Volver a tienda</button>
      </header>

      <div className="nx-cart-page">
        <div className="nx-cart-header">
          <div className="nx-cart-eyebrow">
            <div className="nx-cart-eyebrow-bar" />
            <span className="nx-cart-eyebrow-txt">Tu selección</span>
          </div>
          <h1 className="nx-cart-title">Mi Carrito</h1>
        </div>

        {loading && <p style={{ color: 'rgba(240,236,228,0.4)', fontSize: '0.88rem' }}>Cargando carrito…</p>}
        {error   && <div className="nx-cart-alert-err">{error}</div>}
        {success && <div className="nx-cart-alert-ok">{success}</div>}

        {!loading && cart.items.length === 0 ? (
          <div className="nx-cart-empty">
            <span className="nx-cart-empty-icon">🛒</span>
            <div className="nx-cart-empty-title">Tu carrito está vacío</div>
            <p className="nx-cart-empty-sub">Explora el catálogo y agrega productos que te interesen.</p>
          </div>
        ) : !loading && (
          <>
            <div className="nx-cart-items">
              {cart.items.map((item) => {
                const productId = item.product?.id ?? item.productId;
                const titulo    = item.product?.titulo || 'Producto';
                const unitPrice = Number(item.product?.price ?? item.product?.precio ?? 0);
                const lineTotal = unitPrice * item.quantity;
                const imageUrl  = item.product?.imagenes?.[0]?.url || null;
                const stock     = item.product?.stock;

                return (
                  <div key={productId} className="nx-cart-item">
                    <div className="nx-cart-item-info">
                      <div className="nx-cart-item-img">
                        {imageUrl ? <img src={imageUrl} alt={titulo} /> : 'Sin imagen'}
                      </div>
                      <div>
                        <div className="nx-cart-item-name">{titulo}</div>
                        <div className="nx-cart-item-price">${unitPrice.toFixed(2)} c/u</div>
                        {stock !== undefined && (
                          <div className="nx-cart-item-stock">Stock disponible: {stock}</div>
                        )}
                      </div>
                    </div>

                    <div className="nx-cart-qty">
                      <button className="nx-cart-qty-btn" onClick={() => updateCartQuantity(productId, Math.max(1, item.quantity - 1))}>−</button>
                      <span className="nx-cart-qty-val">{item.quantity}</span>
                      <button
                        className="nx-cart-qty-btn"
                        disabled={stock !== undefined && item.quantity >= stock}
                        onClick={() => updateCartQuantity(productId, item.quantity + 1)}
                      >+</button>
                    </div>

                    <div className="nx-cart-line-total">${lineTotal.toFixed(2)}</div>

                    <button className="nx-cart-remove-btn" onClick={() => removeCartItem(productId)}>Quitar</button>
                  </div>
                );
              })}
            </div>

            <div className="nx-cart-summary">
              <div className="nx-cart-summary-row">
                <span className="nx-cart-summary-lbl">Productos</span>
                <span className="nx-cart-summary-val">{cart.totalItems}</span>
              </div>
              <hr className="nx-cart-summary-divider" />
              <div className="nx-cart-summary-row">
                <span className="nx-cart-summary-total-lbl">Total</span>
                <span className="nx-cart-summary-total-val">${Number(cart.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="nx-cart-summary-actions">
                <button className="nx-cart-checkout-btn" onClick={() => navigate('/orders', { state: { fromCheckout: true } })}>
                  Continuar compra →
                </button>
                <button className="nx-cart-clear-btn" onClick={clearCart}>Limpiar carrito</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;