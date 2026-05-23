import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/api';
import { useHybridCart } from '../../hooks/useHybridCart';

const NAV_LINKS = [
  { key: 'tienda', label: 'Tienda', to: '/' },
  { key: 'recomendados', label: 'Recomendados', to: '/recomendados' },
  { key: 'tendencias', label: 'Tendencias', to: '/#tendencias' },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@200..700&display=swap');

  :root { 
    --ar-surface: #ffffff; 
    --ar-surface-low: #f2f4f8; 
    --ar-on-surface: #191c1f; 
    --ar-on-surface-variant: #45464c; 
    --ar-outline-variant: #c6c6cd; 
    --ar-primary: #000000; 
    --ar-primary-contrast: #ffffff; 
    --ar-secondary: #5c5f60; 
    --ar-error: #ba1a1a; 
    --ar-shadow: rgba(0, 0, 0, 0.08); 
  }
  [data-theme='dark'] { 
    --ar-surface: #191c1e; 
    --ar-surface-low: #2d3134; 
    --ar-on-surface: #eff1f5; 
    --ar-on-surface-variant: #c6c6cd; 
    --ar-outline-variant: #45464c; 
    --ar-primary: #c0c6db; 
    --ar-primary-contrast: #191c1f; 
    --ar-shadow: rgba(0, 0, 0, 0.35); 
  }

  .ar-icon { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-size: 20px; line-height: 1; }
  
  .ar-nav { position: sticky; top: 0; z-index: 1000; background: var(--ar-surface); border-bottom: 1px solid var(--ar-outline-variant); width: 100%; transition: all 0.3s ease; font-family: 'Inter', sans-serif; }
  .ar-nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  
  .ar-brand { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 900; color: var(--ar-on-surface); text-decoration: none; letter-spacing: -0.02em; }
  .ar-brand img { width: 28px; height: 28px; }

  .ar-search-container { flex: 1; max-width: 400px; position: relative; display: flex; align-items: center; }
  .ar-search-icon { position: absolute; left: 12px; color: var(--ar-on-surface-variant); pointer-events: none; font-size: 18px; }
  .ar-search-input { width: 100%; height: 40px; padding: 0 16px 0 40px; border-radius: 12px; border: 1px solid var(--ar-outline-variant); background: var(--ar-surface-low); color: var(--ar-on-surface); font-size: 14px; transition: all 0.2s ease; outline: none; font-family: inherit; }
  .ar-search-input:focus { border-color: var(--ar-primary); background: var(--ar-surface); box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05); }
  
  .ar-nav-links { display: flex; align-items: center; gap: 24px; }
  .ar-nav-link { text-decoration: none; font-size: 14px; font-weight: 500; color: var(--ar-on-surface-variant); padding-bottom: 4px; border-bottom: 2px solid transparent; transition: all 0.2s ease; }
  .ar-nav-link.active { color: var(--ar-on-surface); border-bottom-color: var(--ar-on-surface); }
  .ar-nav-link:hover { color: var(--ar-on-surface); }
  
  .ar-nav-actions { display: flex; align-items: center; gap: 12px; }
  
  .ar-icon-btn { position: relative; width: 40px; height: 40px; border-radius: 999px; border: 1px solid var(--ar-outline-variant); background: transparent; color: var(--ar-on-surface); display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none; transition: all 0.2s ease; }
  .ar-icon-btn:hover { background: var(--ar-surface-low); transform: translateY(-1px); }
  
  .ar-cart-dot { position: absolute; top: -2px; right: -2px; background: var(--ar-primary); color: var(--ar-primary-contrast); font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--ar-surface); }

  .ar-user-wrap { position: relative; }
  .ar-user-pill { display: flex; align-items: center; gap: 10px; padding: 4px 12px 4px 4px; border-radius: 999px; border: 1px solid var(--ar-outline-variant); background: var(--ar-surface); cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
  .ar-user-pill:hover { border-color: var(--ar-on-surface); background: var(--ar-surface-low); }
  
  .ar-user-av { width: 32px; height: 32px; border-radius: 50%; background: var(--ar-primary); color: var(--ar-primary-contrast); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; overflow: hidden; }
  .ar-user-av img { width: 100%; height: 100%; object-fit: cover; }
  
  .ar-user-name { font-size: 14px; font-weight: 600; color: var(--ar-on-surface); max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ar-user-chev { font-size: 12px; color: var(--ar-on-surface-variant); }

  .ar-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 240px; background: var(--ar-surface); border: 1px solid var(--ar-outline-variant); border-radius: 16px; box-shadow: 0 12px 32px var(--ar-shadow); overflow: hidden; animation: ar-fade-in 0.2s ease; }
  @keyframes ar-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  
  .ar-dd-sec { padding: 8px 0; border-bottom: 1px solid var(--ar-outline-variant); }
  .ar-dd-sec:last-child { border-bottom: none; }
  
  .ar-dd-lbl { padding: 8px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ar-secondary); }
  
  .ar-dd-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 16px; border: none; background: transparent; color: var(--ar-on-surface); font-size: 14px; font-weight: 500; cursor: pointer; text-align: left; transition: all 0.2s ease; font-family: inherit; }
  .ar-dd-item:hover { background: var(--ar-surface-low); padding-left: 20px; }
  .ar-dd-item.danger { color: var(--ar-error); }
  .ar-dd-item.highlight { color: #2563eb; font-weight: 700; background: rgba(37, 99, 235, 0.05); }
  .ar-dd-item.highlight:hover { background: rgba(37, 99, 235, 0.1); }

  .ar-auth-btns { display: flex; align-items: center; gap: 12px; }
  .ar-btn-outline { height: 40px; padding: 0 20px; border-radius: 12px; border: 1px solid var(--ar-outline-variant); background: transparent; color: var(--ar-on-surface); font-size: 14px; font-weight: 600; text-decoration: none; display: flex; align-items: center; transition: all 0.2s ease; }
  .ar-btn-outline:hover { background: var(--ar-surface-low); border-color: var(--ar-on-surface); }
  
  .ar-nav-cta { height: 40px; padding: 0 20px; border-radius: 12px; background: var(--ar-primary); color: var(--ar-primary-contrast); font-size: 14px; font-weight: 600; text-decoration: none; display: flex; align-items: center; transition: all 0.2s ease; }
  .ar-nav-cta:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px var(--ar-shadow); }

  @media (max-width: 768px) {
    .ar-nav-links { display: none; }
    .ar-user-name { display: none; }
    .ar-nav-inner { padding: 0 16px; }
  }
`;

function AssistedTopBar({ active }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { cart } = useHybridCart();
  const isDark = theme === 'dark';

  const [ddOpen, setDdOpen] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const token = localStorage.getItem('token');

  const initials = user ? `${(user.nombres || '')[0] || ''}${(user.apellidos || '')[0] || ''}`.toUpperCase() : '';

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    };
    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, []);

  useEffect(() => {
    const h = e => { if (ddOpen && !e.target.closest('.ar-user-wrap')) setDdOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [ddOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };


  return (
    <nav className="ar-nav">
      <style>{STYLES}</style>
      <div className="ar-nav-inner">
        <Link to="/" className="ar-brand">
          <img src={isDark ? '/resources/icone.png' : '/resources/icon.png'} alt="Nexont" />
          <span>Nexont</span>
        </Link>


        <div className="ar-nav-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              className={`ar-nav-link${active === link.key ? ' active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="ar-nav-actions">
          <button
            type="button"
            className="ar-icon-btn"
            onClick={toggleTheme}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            <span className="ar-icon">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          
          {token && user && (
            <Link to="/cart" className="ar-icon-btn" title="Carrito">
              <span className="ar-icon">shopping_bag</span>
              {cart.totalItems > 0 && <span className="ar-cart-dot">{cart.totalItems}</span>}
            </Link>
          )}

          {window.location.pathname === '/' && (
            <button className="ar-icon-btn" onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })} title="Catálogo">
              <span className="ar-icon">grid_view</span>
            </button>
          )}


          {token && user ? (
            <div className="ar-user-wrap">
              <button 
                className="ar-user-pill" 
                onClick={() => setDdOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={ddOpen}
              >
                <div className="ar-user-av">
                  {user.fotoPerfil ? <img src={user.fotoPerfil} alt={initials} /> : initials}
                </div>
                <span className="ar-user-name">{user.nombres}</span>
                <span className="ar-user-chev">▾</span>
              </button>

              {ddOpen && (
                <div className="ar-dropdown">
                  <div className="ar-dd-sec">
                    <div className="ar-dd-lbl">Mi cuenta</div>
                    <button className="ar-dd-item" onClick={() => { setDdOpen(false); navigate('/profile'); }}>👤 Mi perfil</button>
                    <button className="ar-dd-item" onClick={() => { setDdOpen(false); navigate('/orders'); }}>📦 Mis órdenes</button>
                  </div>

                  {user.esVendedorVerificado && (
                    <div className="ar-dd-sec">
                      <div className="ar-dd-lbl">Vendedor</div>
                      <button className="ar-dd-item" onClick={() => { setDdOpen(false); navigate('/dashboard'); }}>📊 Mi dashboard</button>
                      <button className="ar-dd-item" onClick={() => { setDdOpen(false); navigate('/my-products'); }}>🏪 Mis productos</button>
                    </div>
                  )}

                    {!user.esVendedorVerificado && (
                      <div className="ar-dd-sec">
                        <button
                          className="ar-dd-item highlight"
                          onClick={async () => {
                            try {
                              const { data } = await api.post('/users/me/verification');
                              if (data?.status === 'verificado') {
                                try {
                                  const res = await api.get('/users/me');
                                  const updated = res.data?.user;
                                  if (updated) {
                                    localStorage.setItem('user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('user') || '{}')), ...updated }));
                                    window.dispatchEvent(new Event('user-updated'));
                                  }
                                } catch (_) { }
                                navigate('/dashboard');
                              } else {
                                setDdOpen(false);
                                navigate('/profile');
                              }
                            } catch (err) {
                              setDdOpen(false);
                              navigate('/profile');
                            }
                          }}
                        >⭐ Verificarse como vendedor</button>
                      </div>
                    )}

                  <div className="ar-dd-sec">
                    <button className="ar-dd-item danger" onClick={handleLogout}>🚪 Cerrar sesión</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ar-auth-btns">
              <Link to="/login" className="ar-btn-outline">Ingresar</Link>
              <Link to="/register" className="ar-nav-cta">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AssistedTopBar;
