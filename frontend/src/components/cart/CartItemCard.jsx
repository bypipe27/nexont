function CartItemCard({ item, onUpdateQuantity, onRemove, style }) {
  const pid = item.product?.id ?? item.productId;
  const title = item.product?.titulo || 'Producto';
  const unitPrice = Number(item.product?.price ?? item.product?.precio ?? 0);
  const lineTotal = unitPrice * item.quantity;
  const imageUrl = item.product?.imagenes?.[0]?.url || null;
  const stock = item.product?.stock;
  const isUnavailable = item.product?.estaActivo === false;
  const isStockReduced = Number.isFinite(stock) && item.quantity > stock;

  return (
    <article className="nx-cart-item" style={style}>
      <div className="nx-cart-item-media">
        {imageUrl ? (
          <img src={imageUrl} alt={title} />
        ) : (
          <div className="nx-cart-item-noimg">📦</div>
        )}
      </div>
      <div className="nx-cart-item-body">
        <div className="nx-cart-item-header">
          <div>
            <h3>{title}</h3>
            <p>${unitPrice.toFixed(2)} c/u</p>
            {stock !== undefined && <span className="nx-cart-item-stock">Stock: {stock}</span>}
            {isUnavailable && <span className="nx-cart-item-unavailable">No disponible</span>}
            {!isUnavailable && isStockReduced && (
              <span className="nx-cart-item-warning">
                La cantidad agregada supera el stock actual. Maximo disponible: {stock}
              </span>
            )}
          </div>
          <div className="nx-cart-item-price">${lineTotal.toFixed(2)}</div>
        </div>
        <div className="nx-cart-item-actions">
          <div className="nx-cart-qty">
            <button
              type="button"
              className="nx-cart-qty-btn"
              disabled={isUnavailable}
              onClick={() => onUpdateQuantity(pid, Math.max(1, item.quantity - 1))}
            >
              <span className="nx-cart-icon">remove</span>
            </button>
            <span className="nx-cart-qty-val">{item.quantity}</span>
            <button
              type="button"
              className="nx-cart-qty-btn"
              disabled={isUnavailable || (stock !== undefined && item.quantity >= stock)}
              onClick={() => onUpdateQuantity(pid, item.quantity + 1)}
            >
              <span className="nx-cart-icon">add</span>
            </button>
          </div>
          <button type="button" className="nx-cart-remove" onClick={() => onRemove(pid)}>
            <span className="nx-cart-icon">delete</span>
            <span>Quitar</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default CartItemCard;
