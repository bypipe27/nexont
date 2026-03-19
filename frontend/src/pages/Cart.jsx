import { useNavigate } from 'react-router-dom';
import { useHybridCart } from '../hooks/useHybridCart';

function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    error,
    success,
    updateCartQuantity,
    removeCartItem,
    clearCart,
  } = useHybridCart();

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, color: '#1f2937' }}>Mi carrito</h1>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.55rem 0.9rem',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            ← Volver a tienda
          </button>
        </div>

        {loading && <p style={{ color: '#6b7280' }}>Cargando carrito...</p>}
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        {success && <p style={{ color: '#166534' }}>{success}</p>}

        {!loading && cart.items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, color: '#6b7280' }}>No hay productos en el carrito.</p>
          </div>
        ) : (
          !loading && (
            <>
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                {cart.items.map((item) => {
                  const unitPrice = Number(item.product?.price || 0);
                  const lineTotal = unitPrice * item.quantity;

                  return (
                    <div
                      key={item.productId}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto auto',
                        gap: '0.75rem',
                        alignItems: 'center',
                        padding: '0.9rem 1rem',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {item.product?.imagenes && item.product.imagenes.length > 0 && item.product.imagenes[0]?.url ? (
                          <img
                            src={item.product.imagenes[0].url}
                            alt={item.product?.titulo || 'Producto'}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, background: '#f3f4f6' }}
                          />
                        ) : (
                          <div style={{ width: 60, height: 60, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '0.8rem', borderRadius: 6 }}>
                            Sin imagen
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#1f2937' }}>{item.product?.titulo || 'Producto'}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>${item.product?.precio ? Number(item.product.precio).toFixed(2) : '0.00'} c/u</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 4, width: 28, height: 28, cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 4, width: 28, height: 28, cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ fontWeight: 600, color: '#1f2937', minWidth: 90, textAlign: 'right' }}>${lineTotal.toFixed(2)}</div>

                      <button
                        onClick={() => removeCartItem(item.productId)}
                        style={{
                          border: 'none',
                          background: '#dc2626',
                          color: '#fff',
                          borderRadius: 6,
                          padding: '0.45rem 0.6rem',
                          cursor: 'pointer',
                        }}
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Productos</span>
                  <strong>{cart.totalItems}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <strong>Total</strong>
                  <strong>${Number(cart.subtotal || 0).toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate('/orders', { state: { fromCheckout: true } })}
                    style={{
                      padding: '0.65rem 1rem',
                      border: 'none',
                      borderRadius: 6,
                      background: '#4f46e5',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Continuar compra
                  </button>
                  <button
                    onClick={clearCart}
                    style={{
                      padding: '0.65rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Limpiar carrito
                  </button>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

export default Cart;