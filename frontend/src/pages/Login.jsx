import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
  .nx-auth-root { min-height:100vh; background:#0a0908; font-family:'Inter',sans-serif; display:flex; flex-direction:column; }
  .nx-auth-bar { height:56px; background:rgba(10,9,8,0.95); border-bottom:1px solid rgba(212,163,62,0.12); display:flex; align-items:center; padding:0 2rem; flex-shrink:0; }
  .nx-auth-brand { display:flex; align-items:center; gap:0.65rem; text-decoration:none; }
  .nx-auth-brand img { height:28px; }
  .nx-auth-brand-name { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:800; color:#f0ece4; letter-spacing:0.02em; }
  .nx-auth-body { flex:1; display:grid; grid-template-columns:1fr 1fr; min-height:calc(100vh - 56px); }
  .nx-auth-left { position:relative; overflow:hidden; background:#0d0b09; display:flex; flex-direction:column; justify-content:center; padding:4rem 3.5rem; }
  .nx-auth-left-bg { position:absolute; inset:0; background:radial-gradient(ellipse 80% 60% at 30% 50%, rgba(212,163,62,0.14) 0%, transparent 65%), radial-gradient(ellipse 50% 70% at 80% 80%, rgba(139,105,20,0.07) 0%, transparent 55%), #0d0b09; }
  .nx-auth-left-grid { position:absolute; inset:0; opacity:0.025; background-image:linear-gradient(rgba(212,163,62,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,163,62,1) 1px, transparent 1px); background-size:56px 56px; }
  .nx-auth-left-line { position:absolute; right:0; top:0; bottom:0; width:1px; background:linear-gradient(to bottom, transparent, rgba(212,163,62,0.3) 30%, rgba(212,163,62,0.3) 70%, transparent); }
  .nx-auth-left-content { position:relative; z-index:2; }
  .nx-auth-pill { display:inline-flex; align-items:center; gap:0.45rem; background:rgba(212,163,62,0.1); border:1px solid rgba(212,163,62,0.22); color:#d4a33e; font-size:0.68rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; padding:0.32rem 0.9rem; border-radius:2rem; margin-bottom:2rem; }
  .nx-auth-headline { font-family:'Syne',sans-serif; font-size:clamp(2.2rem,3.5vw,3.4rem); font-weight:800; line-height:1.06; color:#f0ece4; margin-bottom:1.5rem; letter-spacing:-0.01em; }
  .nx-auth-headline em { font-style:italic; color:#d4a33e; }
  .nx-auth-desc { font-size:0.95rem; line-height:1.85; color:rgba(240,236,228,0.42); font-weight:300; max-width:380px; margin-bottom:3rem; letter-spacing:0.01em; }
  .nx-auth-features { display:flex; flex-direction:column; gap:1rem; }
  .nx-auth-feat { display:flex; align-items:center; gap:0.85rem; }
  .nx-auth-feat-icon { width:36px; height:36px; border-radius:8px; background:rgba(212,163,62,0.1); border:1px solid rgba(212,163,62,0.18); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1rem; }
  .nx-auth-feat-text { font-size:0.85rem; color:rgba(240,236,228,0.55); letter-spacing:0.01em; line-height:1.5; }
  .nx-auth-feat-text b { color:rgba(240,236,228,0.82); font-weight:600; display:block; margin-bottom:0.1rem; }
  .nx-auth-right { display:flex; align-items:center; justify-content:center; padding:3rem 2rem; background:#0a0908; }
  .nx-auth-card { width:100%; max-width:400px; }
  .nx-auth-card-tag { font-size:0.68rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:#d4a33e; margin-bottom:0.6rem; display:block; }
  .nx-auth-card-title { font-family:'Syne',sans-serif; font-size:2rem; font-weight:800; color:#f0ece4; margin-bottom:0.5rem; line-height:1.1; letter-spacing:-0.01em; }
  .nx-auth-card-sub { font-size:0.88rem; color:rgba(240,236,228,0.38); margin-bottom:2.25rem; line-height:1.6; letter-spacing:0.01em; }
  .nx-field { margin-bottom:1.25rem; }
  .nx-field label { display:block; font-size:0.78rem; font-weight:600; color:rgba(240,236,228,0.55); margin-bottom:0.5rem; letter-spacing:0.06em; text-transform:uppercase; }
  .nx-field input { width:100%; height:44px; padding:0 1rem; background:rgba(255,255,255,0.04); border:1px solid rgba(212,163,62,0.14); border-radius:7px; color:#f0ece4; font-size:0.9rem; font-family:'Inter',sans-serif; outline:none; transition:border-color 0.2s; box-sizing:border-box; letter-spacing:0.01em; }
  .nx-field input:focus { border-color:rgba(212,163,62,0.45); background:rgba(255,255,255,0.06); }
  .nx-field input::placeholder { color:rgba(240,236,228,0.2); }
  .nx-field input.has-error { border-color:rgba(239,68,68,0.5); }

  /* ── Alerta error sutil ── */
  .nx-auth-err {
    display:flex; align-items:flex-start; gap:0.6rem;
    background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.18);
    border-left:3px solid #ef4444;
    border-radius:7px; padding:0.65rem 0.9rem; margin-bottom:1.25rem;
    animation: nx-err-slide 0.2s ease;
  }
  .nx-auth-err-icon { color:#ef4444; font-size:0.85rem; flex-shrink:0; margin-top:1px; }
  .nx-auth-err-text { font-size:0.8rem; color:rgba(239,68,68,0.9); line-height:1.5; letter-spacing:0.01em; }

  @keyframes nx-err-slide { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }

  .nx-auth-submit { width:100%; height:46px; border-radius:8px; border:none; background:#d4a33e; color:#0a0908; font-family:'Syne',sans-serif; font-weight:800; font-size:0.9rem; letter-spacing:0.05em; cursor:pointer; transition:all 0.2s; margin-top:0.5rem; }
  .nx-auth-submit:hover:not(:disabled) { background:#e8b84b; transform:translateY(-1px); box-shadow:0 8px 24px rgba(212,163,62,0.3); }
  .nx-auth-submit:disabled { opacity:0.45; cursor:not-allowed; }
  .nx-auth-foot { text-align:center; margin-top:1.75rem; font-size:0.84rem; color:rgba(240,236,228,0.32); letter-spacing:0.01em; }
  .nx-auth-foot a { color:#d4a33e; font-weight:600; text-decoration:none; }
  .nx-auth-foot a:hover { color:#e8b84b; }
  @media (max-width:820px) { .nx-auth-body { grid-template-columns:1fr; } .nx-auth-left { display:none; } .nx-auth-right { padding:2.5rem 1.5rem; min-height:calc(100vh - 56px); } }
`;

if (!document.getElementById('nx-auth-styles')) {
  const el = document.createElement('style');
  el.id = 'nx-auth-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

const parseError = (err) => {
  const data = err.response?.data;
  if (!data) return 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
  if (data.details?.length) return data.details.join(' · ');
  return data.error || 'Credenciales inválidas. Inténtalo de nuevo.';
};

function Login() {
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nx-auth-root">
      <header className="nx-auth-bar">
        <Link to="/" className="nx-auth-brand">
          <img src="/resources/icone.png" alt="Nexont" />
          <span className="nx-auth-brand-name">Nexont</span>
        </Link>
      </header>
      <div className="nx-auth-body">
        <div className="nx-auth-left">
          <div className="nx-auth-left-bg" /><div className="nx-auth-left-grid" /><div className="nx-auth-left-line" />
          <div className="nx-auth-left-content">
            <div className="nx-auth-pill">✦ &nbsp; Marketplace Colombiano</div>
            <h1 className="nx-auth-headline">Bienvenido<br />de vuelta a<br /><em>Nexont</em></h1>
            <p className="nx-auth-desc">Accede a tu cuenta para explorar productos, gestionar tus pedidos y conectar con vendedores verificados.</p>
            <div className="nx-auth-features">
              {[['🛍️','Miles de productos','Catálogo curado de vendedores verificados'],['🔒','Compra segura','Transacciones protegidas en todo momento'],['⚡','Soporte 24/7','Estamos aquí cuando nos necesites']].map(([icon,title,sub]) => (
                <div key={title} className="nx-auth-feat">
                  <div className="nx-auth-feat-icon">{icon}</div>
                  <div className="nx-auth-feat-text"><b>{title}</b>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="nx-auth-right">
          <div className="nx-auth-card">
            <span className="nx-auth-card-tag">Acceso a tu cuenta</span>
            <h2 className="nx-auth-card-title">Iniciar sesión</h2>
            <p className="nx-auth-card-sub">Ingresa tus credenciales para continuar</p>
            <form onSubmit={handleSubmit}>
              <div className="nx-field">
                <label>Correo electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} required placeholder="tu@email.com" className={error ? 'has-error' : ''} />
              </div>
              <div className="nx-field">
                <label>Contraseña</label>
                <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required placeholder="••••••••" className={error ? 'has-error' : ''} />
              </div>

              {error && (
                <div className="nx-auth-err">
                  <span className="nx-auth-err-icon">⚠</span>
                  <span className="nx-auth-err-text">{error}</span>
                </div>
              )}

              <button type="submit" className="nx-auth-submit" disabled={loading}>
                {loading ? 'Entrando…' : 'Iniciar sesión →'}
              </button>
            </form>
            <p className="nx-auth-foot">¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;