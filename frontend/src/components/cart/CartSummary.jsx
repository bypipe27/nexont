function CartSummary({ totalItems, subtotal, onCheckout, onClear }) {
  const safeSubtotal = Number(subtotal || 0);

  return (
    <aside className="nx-cart-summary">
      <h2>Resumen del pedido</h2>
      <div className="nx-cart-summary-list">
        <div>
          <span>Productos</span>
          <strong>{totalItems}</strong>
        </div>
        <div>
          <span>Envio</span>
          <strong>Calculado en checkout</strong>
        </div>
      </div>
      <div className="nx-cart-summary-total">
        <span>Total</span>
        <strong>${safeSubtotal.toFixed(2)}</strong>
      </div>
      <button className="nx-cart-primary" onClick={onCheckout}>
        Continuar compra
        <span className="nx-cart-icon">arrow_forward</span>
      </button>
      <button className="nx-cart-ghost" onClick={onClear}>Limpiar carrito</button>
      <div className="nx-cart-secure">
        <span className="nx-cart-icon">lock</span>
        <span>Checkout seguro</span>
      </div>
    </aside>
  );
}

export default CartSummary;
