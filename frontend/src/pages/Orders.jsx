import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';

// ─── Componente Factura ────────────────────────────────────────────────────
function InvoiceModal({ invoice, order, onClose }) {
  if (!invoice || !order) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '2rem',
        maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Encabezado factura */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #4f46e5', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem' }}>🧾</div>
          <h2 style={{ margin: '0.5rem 0 0.25rem', color: '#1f2937' }}>Factura de Compra</h2>
          <p style={{ margin: 0, color: '#6b7280', fontWeight: 600 }}>{invoice.invoiceNumber}</p>
        </div>

        {/* Datos generales */}
        <div style={{ marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Fecha de emisión</p>
            <p style={{ margin: 0, fontWeight: 600 }}>
              {new Date(invoice.issuedAt).toLocaleString('es-CO')}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Método de pago</p>
            <p style={{ margin: 0, fontWeight: 600, textTransform: 'capitalize' }}>{invoice.paymentMethod}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Orden #</p>
            <p style={{ margin: 0, fontWeight: 600 }}>{order.id}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Estado</p>
            <p style={{ margin: 0, fontWeight: 600, color: '#166534' }}>{order.status}</p>
          </div>
        </div>

        {/* Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280' }}>Producto</th>
              <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280' }}>Cant.</th>
              <th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.85rem', color: '#6b7280' }}>P. Unit.</th>
              <th style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.85rem', color: '#6b7280' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem', fontSize: '0.9rem' }}>{item.productName}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.9rem' }}>${Number(item.unitPrice).toFixed(2)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>${Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '0.75rem', background: '#f0fdf4', borderRadius: 8,
          border: '1px solid #bbf7d0', marginBottom: '1.5rem',
        }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#166534' }}>
            ${Number(invoice.total).toFixed(2)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.5rem', border: 'none',
              borderRadius: 6, background: '#4f46e5', color: '#fff',
              cursor: 'pointer', fontWeight: 600, fontSize: '1rem',
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal Orders ───────────────────────────────────────────────
function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromCheckout = location.state?.fromCheckout || false;

  // Vista: 'checkout' | 'list' | 'detail'
  const [view, setView] = useState(fromCheckout ? 'checkout' : 'list');

  // Checkout
  const [cart, setCart] = useState(null);
  const [paymentMethod] = useState('efectivo');
  const [notes, setNotes] = useState('');
  const [loadingCart, setLoadingCart] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Factura
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Lista de órdenes
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ─── Cargar carrito ───
  useEffect(() => {
    if (view === 'checkout') {
      setLoadingCart(true);
      api.get('/cart')
        .then(({ data }) => setCart(data))
        .catch(() => setCheckoutError('No se pudo cargar el carrito'))
        .finally(() => setLoadingCart(false));
    }
  }, [view]);

  // ─── Cargar órdenes ───
  useEffect(() => {
    if (view === 'list') {
      setLoadingOrders(true);
      api.get('/orders')
        .then(({ data }) => setOrders(data))
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [view]);

  // ─── Confirmar compra ───
  const handleConfirm = async () => {
    setCheckoutError('');
    setConfirming(true);
    try {
      const { data } = await api.post('/orders', { paymentMethod, notes });
      setConfirmedOrder(data.order);
      setInvoiceData(data.invoice);
      setShowInvoice(true);
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Error al confirmar la compra');
    } finally {
      setConfirming(false);
    }
  };

  // ─── Después de cerrar factura ───
  const handleInvoiceClose = () => {
    setShowInvoice(false);
    setView('list');
  };

  // ─── Render: Checkout ──────────────────────────────────────────────────
  if (view === 'checkout') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => navigate('/cart')}
              style={{ padding: '0.5rem 0.9rem', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
            >
              ← Volver al carrito
            </button>
            <h1 style={{ margin: 0, color: '#1f2937' }}>Confirmar compra</h1>
          </div>

          {loadingCart && <p style={{ color: '#6b7280' }}>Cargando carrito...</p>}
          {checkoutError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#b91c1c' }}>
              {checkoutError}
            </div>
          )}

          {cart && cart.items?.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: 0, color: '#6b7280' }}>No hay productos en el carrito.</p>
            </div>
          )}

          {cart && cart.items?.length > 0 && (
            <>
              {/* Resumen de productos */}
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: '1rem', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <strong style={{ color: '#1f2937' }}>Resumen del pedido</strong>
                </div>
                {cart.items.map((item) => {
                  const unitPrice = Number(item.product?.price || 0);
                  const lineTotal = unitPrice * item.quantity;
                  const stock = item.product?.stock ?? 0;
                  const overStock = item.quantity > stock;

                  return (
                    <div key={item.productId} style={{
                      display: 'grid', gridTemplateColumns: '1fr auto auto',
                      gap: '0.75rem', alignItems: 'center',
                      padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9',
                      background: overStock ? '#fff7f7' : 'transparent',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>{item.product?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          ${unitPrice.toFixed(2)} c/u · Cant: {item.quantity}
                        </div>
                        {overStock && (
                          <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: 2 }}>
                            ⚠ Stock disponible: {stock}
                          </div>
                        )}
                        {!overStock && (
                          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>
                            Stock disponible: {stock}
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 600 }}>${lineTotal.toFixed(2)}</div>
                    </div>
                  );
                })}
                <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Total</strong>
                  <strong style={{ color: '#4f46e5', fontSize: '1.1rem' }}>
                    ${Number(cart.subtotal || 0).toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Método de pago */}
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '1rem', marginBottom: '1rem' }}>
                <strong style={{ color: '#1f2937', display: 'block', marginBottom: '0.75rem' }}>Método de pago</strong>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '2px solid #4f46e5', borderRadius: 8, background: '#f5f3ff', cursor: 'pointer' }}>
                  <input type="radio" name="payment" value="efectivo" defaultChecked readOnly />
                  <span style={{ fontSize: '1.25rem' }}>💵</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Efectivo</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Pago en el momento de la entrega</div>
                  </div>
                </label>
              </div>

              {/* Notas opcionales */}
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '1rem', marginBottom: '1.5rem' }}>
                <strong style={{ color: '#1f2937', display: 'block', marginBottom: '0.5rem' }}>Notas del pedido (opcional)</strong>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instrucciones especiales, dirección de entrega..."
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Botón confirmar */}
              <button
                onClick={handleConfirm}
                disabled={confirming || cart.items.some(i => i.quantity > (i.product?.stock ?? 0))}
                style={{
                  width: '100%', padding: '0.85rem', border: 'none',
                  borderRadius: 8, background: confirming ? '#a5b4fc' : '#4f46e5',
                  color: '#fff', fontWeight: 700, fontSize: '1.05rem',
                  cursor: confirming ? 'not-allowed' : 'pointer',
                  opacity: cart.items.some(i => i.quantity > (i.product?.stock ?? 0)) ? 0.5 : 1,
                }}
              >
                {confirming ? 'Procesando...' : '✓ Confirmar compra'}
              </button>
              {cart.items.some(i => i.quantity > (i.product?.stock ?? 0)) && (
                <p style={{ color: '#b91c1c', textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Ajusta las cantidades antes de continuar (algunos productos exceden el stock)
                </p>
              )}
            </>
          )}
        </div>

        {/* Modal factura */}
        {showInvoice && (
          <InvoiceModal
            invoice={invoiceData}
            order={confirmedOrder}
            onClose={handleInvoiceClose}
          />
        )}
      </div>
    );
  }

  // ─── Render: Lista de órdenes ──────────────────────────────────────────
  if (view === 'list') {
    const statusColor = {
      pendiente: '#d97706',
      confirmada: '#166534',
      cancelada: '#b91c1c',
      entregada: '#1d4ed8',
    };

    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ margin: 0, color: '#1f2937' }}>Mis pedidos</h1>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '0.5rem 0.9rem', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
            >
              ← Volver a tienda
            </button>
          </div>

          {loadingOrders && <p style={{ color: '#6b7280' }}>Cargando pedidos...</p>}

          {!loadingOrders && orders.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', margin: 0 }}>No tienes pedidos aún.</p>
              <button
                onClick={() => navigate('/')}
                style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', border: 'none', borderRadius: 6, background: '#4f46e5', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Ir a la tienda
              </button>
            </div>
          )}

          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => { setSelectedOrder(order); setView('detail'); }}
              style={{
                background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb',
                padding: '1rem', marginBottom: '0.75rem', cursor: 'pointer',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#1f2937' }}>Pedido #{order.id}</div>
                  {order.invoiceNumber && (
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Factura: {order.invoiceNumber}</div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 2 }}>
                    {new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block', padding: '0.2rem 0.65rem',
                    borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                    background: '#f0fdf4', color: statusColor[order.status] || '#374151',
                  }}>
                    {order.status}
                  </span>
                  <div style={{ fontWeight: 700, color: '#1f2937', marginTop: 4 }}>
                    ${Number(order.total).toFixed(2)}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                {order.items.length} producto{order.items.length !== 1 ? 's' : ''} · {order.paymentMethod}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render: Detalle de orden ──────────────────────────────────────────
  if (view === 'detail' && selectedOrder) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setView('list')}
              style={{ padding: '0.5rem 0.9rem', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
            >
              ← Mis pedidos
            </button>
            <h1 style={{ margin: 0, color: '#1f2937' }}>Pedido #{selectedOrder.id}</h1>
          </div>

          {/* Info del pedido */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '1rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Estado</p>
              <p style={{ margin: 0, fontWeight: 600, textTransform: 'capitalize' }}>{selectedOrder.status}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Método de pago</p>
              <p style={{ margin: 0, fontWeight: 600, textTransform: 'capitalize' }}>{selectedOrder.paymentMethod}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Fecha</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{new Date(selectedOrder.createdAt).toLocaleString('es-CO')}</p>
            </div>
            {selectedOrder.invoiceNumber && (
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Factura</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedOrder.invoiceNumber}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1rem' }}>
            {selectedOrder.items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>${Number(item.unitPrice).toFixed(2)} c/u · Cant: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 600 }}>${Number(item.lineTotal).toFixed(2)}</div>
              </div>
            ))}
            <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Total</strong>
              <strong style={{ color: '#4f46e5' }}>${Number(selectedOrder.total).toFixed(2)}</strong>
            </div>
          </div>

          {selectedOrder.notes && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#92400e' }}>Notas:</strong>
              <p style={{ margin: '0.25rem 0 0', color: '#78350f', fontSize: '0.9rem' }}>{selectedOrder.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default Orders;
