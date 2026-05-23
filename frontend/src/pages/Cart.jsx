import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/cart/CartItemCard';
import CartSummary from '../components/cart/CartSummary';
import AssistedTopBar from '../components/assisted/AssistedTopBar';
import { useTheme } from '../context/ThemeContext';
import { useHybridCart } from '../hooks/useHybridCart';




const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@200..700&display=swap');

  :root {
    --nx-bg: #f7f9fd;
    --nx-bg-alt: #eceef2;
    --nx-ink: #191c1f;
    --nx-muted: #45464c;
    --nx-soft: #5c5f60;
    --nx-card: #ffffff;
    --nx-border: #e2e4e9;
    --nx-accent: #000000;
    --nx-accent-soft: #2d3134;
    --nx-gold: #c4973a;
    --nx-error: #ba1a1a;
    --nx-success: #157f3b;
    --nx-shadow: rgba(0, 0, 0, 0.08);
  }

  [data-theme='dark'] {
    --nx-bg: #09090b;
    --nx-bg-alt: #18181b;
    --nx-ink: #fafafa;
    --nx-muted: #a1a1aa;
    --nx-soft: #71717a;
    --nx-card: #18181b;
    --nx-border: #27272a;
    --nx-accent: #ffffff;
    --nx-accent-soft: #f4f4f5;
    --nx-gold: #fbbf24;
    --nx-shadow: rgba(0, 0, 0, 0.5);
  }

  .nx-cart-root {
    min-height: 100vh;
    color: var(--nx-ink);
    font-family: 'Inter', sans-serif;
    background: var(--nx-bg);
    transition: background-color 0.25s ease;
  }
  .nx-cart-shell { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
  .nx-cart-icon { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-size: 20px; line-height: 1; }
  .nx-cart-topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 10; background: var(--nx-card); border-bottom: 1px solid var(--nx-border); }
  .nx-cart-topbar-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; gap: 20px; }
  .nx-cart-brand { display: flex; align-items: center; gap: 12px; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 900; letter-spacing: -0.02em; }
  .nx-cart-brand img { width: 32px; height: 32px; }
  .nx-cart-search { flex: 1; max-width: 420px; display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--nx-border); border-radius: 10px; background: var(--nx-bg-alt); color: var(--nx-muted); }
  .nx-cart-search input { color: var(--nx-ink); border: none; outline: none; background: transparent; font-size: 14px; width: 100%; }
  .nx-cart-actions { display: flex; align-items: center; gap: 12px; }
  .nx-cart-link { border: none; background: transparent; color: var(--nx-soft); font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer; }
  .nx-cart-link:hover { color: var(--nx-ink); }
  .nx-cart-link-active { color: var(--nx-ink); font-weight: 600; border-bottom: 2px solid var(--nx-ink); padding-bottom: 4px; }
  .nx-cart-actions-group { display: flex; align-items: center; gap: 12px; padding-left: 12px; border-left: 1px solid var(--nx-border); }
  .nx-cart-icon-btn { border: 1px solid var(--nx-border); background: var(--nx-card); color: var(--nx-ink); width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; position: relative; cursor: pointer; }
  .nx-cart-badge { position: absolute; top: -4px; right: -4px; background: var(--nx-accent); color: #fff; font-size: 10px; font-weight: 600; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .nx-cart-avatar { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--nx-border); background: linear-gradient(135deg, #d8dbe2 0%, #b8bcc5 100%); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--nx-ink); text-transform: uppercase; overflow: hidden; }
  .nx-cart-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .nx-cart-main { padding: 80px 0 100px; animation: nx-fade 0.6s ease; }
  .nx-cart-hero { margin-bottom: 32px; }
  .nx-cart-hero span { display: inline-flex; align-items: center; gap: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.22em; color: var(--nx-soft); }
  .nx-cart-hero h1 { font-family: 'Inter', sans-serif; font-size: 56px; font-weight: 600; margin: 12px 0 8px; letter-spacing: -0.03em; }
  .nx-cart-hero p { color: var(--nx-muted); max-width: none; font-size: 1.25rem; line-height: 1.6; white-space: nowrap; }
  .nx-cart-grid { display: flex; align-items: flex-start; gap: 24px; }
  .nx-cart-list { flex: 1; display: flex; flex-direction: column; gap: 16px; }
  .nx-cart-item { display: flex; gap: 18px; padding: 18px; border-radius: 18px; background: var(--nx-card); border: 1px solid var(--nx-border); box-shadow: 0 10px 30px var(--nx-shadow); animation: nx-rise 0.6s ease both; animation-delay: calc(var(--i, 0) * 0.06s); }
  .nx-cart-item-media { width: 120px; height: 120px; border-radius: 16px; overflow: hidden; background: #f2f4f8; flex-shrink: 0; }
  .nx-cart-item-media img { width: 100%; height: 100%; object-fit: cover; }
  .nx-cart-item-noimg { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 22px; color: var(--nx-soft); }
  .nx-cart-item-body { flex: 1; display: flex; flex-direction: column; gap: 16px; }
  .nx-cart-item-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .nx-cart-item-header h3 { font-size: 20px; font-weight: 600; margin: 0 0 4px; }
  .nx-cart-item-header p { color: var(--nx-muted); font-size: 14px; margin: 0; }
  .nx-cart-item-stock { display: block; color: var(--nx-soft); font-size: 12px; margin-top: 6px; }
  .nx-cart-item-unavailable { display: block; color: var(--nx-error); font-size: 12px; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.08em; }
  .nx-cart-item-warning { display: block; color: #a66413; font-size: 12px; margin-top: 6px; }
  .nx-cart-item-price { font-size: 20px; font-weight: 600; }
  .nx-cart-item-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .nx-cart-qty { display: inline-flex; align-items: center; gap: 10px; background: var(--nx-bg-alt); border-radius: 999px; padding: 4px 10px; border: 1px solid var(--nx-border); }
  .nx-cart-qty-btn { border: none; background: transparent; color: var(--nx-muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
  .nx-cart-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .nx-cart-qty-val { min-width: 26px; text-align: center; font-weight: 600; }
  .nx-cart-remove { border: none; background: transparent; color: var(--nx-muted); font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
  .nx-cart-remove:hover { color: var(--nx-error); }
  .nx-cart-summary { position: sticky; top: 110px; min-width: 320px; max-width: 360px; padding: 24px; border-radius: 20px; background: var(--nx-card); border: 1px solid var(--nx-border); box-shadow: 0 12px 30px var(--nx-shadow); }
  .nx-cart-summary h2 { font-size: 22px; margin-bottom: 18px; }
  .nx-cart-summary-list { display: grid; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--nx-border); }
  .nx-cart-summary-list div { display: flex; justify-content: space-between; font-size: 14px; color: var(--nx-muted); }
  .nx-cart-summary-list strong { color: var(--nx-ink); font-weight: 600; text-align: right; }
  .nx-cart-summary-total { display: flex; justify-content: space-between; margin: 18px 0 20px; font-size: 20px; }
  .nx-cart-summary-total strong { color: #8b5cf6; font-weight: 700; }
  .nx-cart-primary { width: 100%; border: none; background: var(--nx-accent); color: var(--nx-bg); padding: 14px 18px; border-radius: 999px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }
  .nx-cart-primary:hover { background: var(--nx-accent-soft); }
  .nx-cart-ghost { width: 100%; border: 1px solid var(--nx-border); background: transparent; color: var(--nx-muted); padding: 12px 18px; border-radius: 999px; margin-top: 10px; cursor: pointer; }
  .nx-cart-secure { display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--nx-soft); font-size: 12px; margin-top: 16px; }
  .nx-cart-alert { padding: 10px 14px; border-radius: 12px; font-size: 13px; margin-bottom: 12px; }
  .nx-cart-alert.error { border: 1px solid rgba(186, 26, 26, 0.4); background: rgba(186, 26, 26, 0.08); color: var(--nx-error); }
  .nx-cart-alert.success { border: 1px solid rgba(21, 127, 59, 0.4); background: rgba(21, 127, 59, 0.08); color: var(--nx-success); }
  .nx-cart-empty { padding: 80px 24px; text-align: center; border-radius: 20px; background: var(--nx-card); border: 1px dashed var(--nx-border); }
  .nx-cart-empty h3 { font-family: 'Inter', sans-serif; font-size: 28px; margin-bottom: 12px; }
  .nx-cart-empty p { color: var(--nx-muted); margin: 0; }
  [data-theme='dark'] .nx-cart-search { background: var(--nx-bg-alt); }
  @media (max-width: 1024px) { .nx-cart-grid { flex-direction: column; } .nx-cart-summary { position: static; max-width: none; width: 100%; } }
  @media (max-width: 720px) { .nx-cart-topbar-inner { flex-wrap: wrap; height: auto; padding: 12px 0; } .nx-cart-search { order: 3; width: 100%; } .nx-cart-item { flex-direction: column; align-items: flex-start; } .nx-cart-item-media { width: 100%; height: 180px; } .nx-cart-item-actions { width: 100%; } }
  @keyframes nx-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes nx-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  `;
if (!document.getElementById('nx-cart-styles')) {
  const el = document.createElement('style');
  el.id = 'nx-cart-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

function Cart() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const { cart, loading, error, success, updateCartQuantity, removeCartItem, clearCart } = useHybridCart();
  const initials = user ? `${(user.nombres || '')[0] || ''}${(user.apellidos || '')[0] || ''}`.toUpperCase() : '';

  useEffect(() => {
    const handler = () => {
      const updated = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(updated);
    };
    window.addEventListener('user-updated', handler);
    return () => window.removeEventListener('user-updated', handler);
  }, []);

  return (
    <div className="nx-cart-root">
      <AssistedTopBar active="tienda" />
      <main className="nx-cart-main">
        <div className="nx-cart-shell">
          <div className="nx-cart-hero">
            <span>Mi seleccion</span>
            <h1>Carrito de compra</h1>
            <p>Revisa tus productos antes de continuar al checkout.</p>
          </div>
          {loading && <div className="nx-cart-alert">Cargando...</div>}
          {error && <div className="nx-cart-alert error">{error}</div>}
          {success && <div className="nx-cart-alert success">{success}</div>}
          {!loading && cart.items.length === 0 ? (
            <div className="nx-cart-empty">
              <h3>Tu carrito esta vacio</h3>
              <p>Explora el catalogo y agrega productos que te interesen.</p>
            </div>
          ) : !loading && (
            <div className="nx-cart-grid">
              <section className="nx-cart-list">
                {cart.items.map((item, index) => (
                  <CartItemCard
                    key={item.product?.id ?? item.productId}
                    item={item}
                    onUpdateQuantity={updateCartQuantity}
                    onRemove={removeCartItem}
                    style={{ '--i': index }}
                  />
                ))}
              </section>
              <CartSummary
                totalItems={cart.totalItems}
                subtotal={cart.subtotal}
                onCheckout={() => navigate('/orders', { state: { fromCheckout: true } })}
                onClear={clearCart}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
export default Cart;