function CartTopBar({ cartCount, onHome, onLogin, onCart, isDark, onToggleTheme, avatarUrl, initials }) {
  return (
    <header className="nx-cart-topbar">
      <div className="nx-cart-shell nx-cart-topbar-inner">
        <div className="nx-cart-brand" onClick={onHome} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onHome()}>
          <img src={isDark ? '/resources/icone.png' : '/resources/icon.png'} alt="Nexont" />
          <span>Nexont</span>
        </div>
        <div className="nx-cart-search">
          <span className="nx-cart-icon">search</span>
          <input type="text" placeholder="Buscar productos..." aria-label="Buscar productos" />
        </div>
        <nav className="nx-cart-actions">
          <button className="nx-cart-link nx-cart-link-active" onClick={onCart}>Carrito</button> 
          <div className="nx-cart-actions-group">
            <button
              className="nx-cart-icon-btn"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              <span className="nx-cart-icon">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button className="nx-cart-link" onClick={onLogin}>Login</button>
            <button className="nx-cart-icon-btn" onClick={onCart} aria-label="Ver carrito">
              <span className="nx-cart-icon">shopping_cart</span>
              {cartCount > 0 && <span className="nx-cart-badge">{cartCount}</span>}
            </button>
            <div className="nx-cart-avatar" aria-label="Perfil de usuario">
              {avatarUrl ? (
                <img src={avatarUrl} alt={initials || 'Perfil'} />
              ) : (
                <span>{initials || 'U'}</span>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default CartTopBar;
