import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
  .nx-reg-root { min-height:100vh; background:#0a0908; font-family:'Inter',sans-serif; display:flex; flex-direction:column; }
  .nx-reg-bar { height:56px; background:rgba(10,9,8,0.95); border-bottom:1px solid rgba(212,163,62,0.12); display:flex; align-items:center; padding:0 2rem; flex-shrink:0; }
  .nx-reg-brand { display:flex; align-items:center; gap:0.65rem; text-decoration:none; }
  .nx-reg-brand img { height:28px; }
  .nx-reg-brand-name { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:800; color:#f0ece4; letter-spacing:0.02em; }
  .nx-reg-body { flex:1; display:grid; grid-template-columns:1fr 1fr; min-height:calc(100vh - 56px); }
  .nx-reg-left { position:relative; overflow:hidden; background:#0d0b09; display:flex; flex-direction:column; justify-content:center; padding:4rem 3.5rem; }
  .nx-reg-left-bg { position:absolute; inset:0; background: radial-gradient(ellipse 60% 50% at 25% 45%, rgba(212,163,62,0.13) 0%, transparent 62%), radial-gradient(ellipse 45% 65% at 85% 75%, rgba(139,105,20,0.07) 0%, transparent 55%), #0d0b09; }
  .nx-reg-left-grid { position:absolute; inset:0; opacity:0.025; background-image:linear-gradient(rgba(212,163,62,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,163,62,1) 1px, transparent 1px); background-size:56px 56px; }
  .nx-reg-left-line { position:absolute; right:0; top:0; bottom:0; width:1px; background:linear-gradient(to bottom, transparent, rgba(212,163,62,0.3) 30%, rgba(212,163,62,0.3) 70%, transparent); }
  .nx-reg-left-content { position:relative; z-index:2; }
  .nx-reg-pill { display:inline-flex; align-items:center; gap:0.45rem; background:rgba(212,163,62,0.1); border:1px solid rgba(212,163,62,0.22); color:#d4a33e; font-size:0.68rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; padding:0.32rem 0.9rem; border-radius:2rem; margin-bottom:2rem; }
  .nx-reg-headline { font-family:'Syne',sans-serif; font-size:clamp(2.2rem,3.5vw,3.4rem); font-weight:800; line-height:1.06; color:#f0ece4; margin-bottom:1.5rem; letter-spacing:-0.01em; }
  .nx-reg-headline em { font-style:italic; color:#d4a33e; }
  .nx-reg-desc { font-size:0.95rem; line-height:1.85; color:rgba(240,236,228,0.42); font-weight:300; max-width:380px; margin-bottom:3rem; letter-spacing:0.01em; }
  .nx-reg-steps { display:flex; flex-direction:column; gap:0; }
  .nx-reg-step { display:flex; gap:1rem; align-items:flex-start; padding:1rem 0; position:relative; }
  .nx-reg-step:not(:last-child)::after { content:''; position:absolute; left:17px; top:calc(1rem + 34px); bottom:0; width:1px; background:rgba(212,163,62,0.15); }
  .nx-reg-step-num { width:34px; height:34px; border-radius:50%; flex-shrink:0; background:rgba(212,163,62,0.1); border:1px solid rgba(212,163,62,0.25); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:0.78rem; font-weight:800; color:#d4a33e; }
  .nx-reg-step-title { font-size:0.88rem; font-weight:600; color:rgba(240,236,228,0.75); margin-bottom:0.18rem; }
  .nx-reg-step-sub { font-size:0.76rem; color:rgba(240,236,228,0.3); line-height:1.5; letter-spacing:0.01em; }
  .nx-reg-right { display:flex; align-items:center; justify-content:center; padding:2.5rem 2rem; background:#0a0908; overflow-y:auto; }
  .nx-reg-card { width:100%; max-width:420px; }
  .nx-reg-tag { font-size:0.68rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:#d4a33e; margin-bottom:0.6rem; display:block; }
  .nx-reg-title { font-family:'Syne',sans-serif; font-size:2rem; font-weight:800; color:#f0ece4; margin-bottom:0.5rem; letter-spacing:-0.01em; }
  .nx-reg-sub { font-size:0.88rem; color:rgba(240,236,228,0.38); margin-bottom:2rem; line-height:1.6; letter-spacing:0.01em; }
  .nx-rfield { margin-bottom:1.1rem; }
  .nx-rfield label { display:block; font-size:0.75rem; font-weight:600; color:rgba(240,236,228,0.5); margin-bottom:0.45rem; letter-spacing:0.06em; text-transform:uppercase; }
  .nx-rfield input { width:100%; height:42px; padding:0 0.95rem; background:rgba(255,255,255,0.04); border:1px solid rgba(212,163,62,0.14); border-radius:7px; color:#f0ece4; font-size:0.88rem; font-family:'Inter',sans-serif; outline:none; transition:border-color 0.2s; box-sizing:border-box; letter-spacing:0.01em; }
  .nx-rfield input:focus { border-color:rgba(212,163,62,0.45); background:rgba(255,255,255,0.055); }
  .nx-rfield input::placeholder { color:rgba(240,236,228,0.2); }
  .nx-rfield input.has-error { border-color:rgba(239,68,68,0.5); }
  .nx-rfield-row { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }

  /* ── Alertas sutiles ── */
  .nx-reg-err {
    display:flex; align-items:flex-start; gap:0.6rem;
    background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.18);
    border-left:3px solid #ef4444;
    border-radius:7px; padding:0.65rem 0.9rem; margin-bottom:1.1rem;
    animation: nx-err-in 0.2s ease;
  }
  .nx-reg-err-icon { color:#ef4444; font-size:0.85rem; flex-shrink:0; margin-top:1px; }
  .nx-reg-err-text { font-size:0.8rem; color:rgba(239,68,68,0.9); line-height:1.5; letter-spacing:0.01em; }
  .nx-reg-ok {
    display:flex; align-items:flex-start; gap:0.6rem;
    background:rgba(74,222,128,0.07); border:1px solid rgba(74,222,128,0.18);
    border-left:3px solid #4ade80;
    border-radius:7px; padding:0.65rem 0.9rem; margin-bottom:1.1rem;
    animation: nx-err-in 0.2s ease;
  }
  .nx-reg-ok-icon { color:#4ade80; font-size:0.85rem; flex-shrink:0; margin-top:1px; }
  .nx-reg-ok-text { font-size:0.8rem; color:rgba(74,222,128,0.9); line-height:1.5; }

  @keyframes nx-err-in { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }

  .nx-reg-submit { width:100%; height:46px; border-radius:8px; border:none; background:#d4a33e; color:#0a0908; font-family:'Syne',sans-serif; font-weight:800; font-size:0.9rem; letter-spacing:0.05em; cursor:pointer; transition:all 0.2s; margin-top:0.5rem; }
  .nx-reg-submit:hover:not(:disabled) { background:#e8b84b; transform:translateY(-1px); box-shadow:0 8px 24px rgba(212,163,62,0.3); }
  .nx-reg-submit:disabled { opacity:0.45; cursor:not-allowed; }
  .nx-reg-terms { font-size:0.74rem; color:rgba(240,236,228,0.25); text-align:center; margin-top:1rem; line-height:1.6; letter-spacing:0.01em; }
  .nx-reg-foot { text-align:center; margin-top:1.5rem; font-size:0.84rem; color:rgba(240,236,228,0.32); }
  .nx-reg-foot a { color:#d4a33e; font-weight:600; text-decoration:none; }
  .nx-reg-foot a:hover { color:#e8b84b; }
  @media (max-width:820px) { .nx-reg-body { grid-template-columns:1fr; } .nx-reg-left { display:none; } .nx-reg-right { padding:2.5rem 1.5rem; min-height:calc(100vh - 56px); align-items:flex-start; padding-top:3rem; } }
`;

if (!document.getElementById('nx-reg-styles')) {
  const el = document.createElement('style');
  el.id = 'nx-reg-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

// ── Parsear error del backend a mensaje legible ───────────────────────────────
const parseError = (err) => {
  const data = err.response?.data;
  if (!data) return 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
  // Joi devuelve { error: 'Datos inválidos', details: ['msg1', 'msg2'] }
  if (data.details?.length) return data.details.join(' · ');
  return data.error || 'Error al registrar. Inténtalo de nuevo.';
};

function Register() {
  const [formData, setFormData] = useState({ nombres: '', apellidos: '', correo: '', contrasena: '' });
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      setSuccess(data.message || '¡Cuenta creada! Revisa tu correo para verificarla.');
      setFormData({ nombres: '', apellidos: '', correo: '', contrasena: '' });
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nx-reg-root">
      <header className="nx-reg-bar">
        <Link to="/" className="nx-reg-brand">
          <img src="/resources/icone.png" alt="Nexont" />
          <span className="nx-reg-brand-name">Nexont</span>
        </Link>
      </header>
      <div className="nx-reg-body">
        <div className="nx-reg-left">
          <div className="nx-reg-left-bg" /><div className="nx-reg-left-grid" /><div className="nx-reg-left-line" />
          <div className="nx-reg-left-content">
            <div className="nx-reg-pill">✦ &nbsp; Únete hoy</div>
            <h1 className="nx-reg-headline">Comienza a<br />vender en<br /><em>Nexont</em></h1>
            <p className="nx-reg-desc">Crea tu cuenta gratis y empieza a conectar con miles de compradores en Colombia en minutos.</p>
            <div className="nx-reg-steps">
              {[['Crea tu cuenta','Regístrate gratis en menos de 2 minutos'],['Verifica tu correo','Confirma tu identidad para mayor seguridad'],['Explora y vende','Accede al marketplace y publica tus productos']].map(([t,s],i) => (
                <div key={i} className="nx-reg-step">
                  <div className="nx-reg-step-num">{i+1}</div>
                  <div><div className="nx-reg-step-title">{t}</div><div className="nx-reg-step-sub">{s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="nx-reg-right">
          <div className="nx-reg-card">
            <span className="nx-reg-tag">Nueva cuenta</span>
            <h2 className="nx-reg-title">Crear cuenta</h2>
            <p className="nx-reg-sub">Únete a Nexont y descubre el marketplace colombiano</p>
            <form onSubmit={handleSubmit}>
              <div className="nx-rfield-row">
                <div className="nx-rfield">
                  <label>Nombre</label>
                  <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required placeholder="Tu nombre" className={error ? 'has-error' : ''} />
                </div>
                <div className="nx-rfield">
                  <label>Apellido</label>
                  <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required placeholder="Tu apellido" className={error ? 'has-error' : ''} />
                </div>
              </div>
              <div className="nx-rfield">
                <label>Correo electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} required placeholder="tu@email.com" className={error ? 'has-error' : ''} />
              </div>
              <div className="nx-rfield">
                <label>Contraseña</label>
                <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required placeholder="Mínimo 8 caracteres" className={error ? 'has-error' : ''} />
              </div>

              {error && (
                <div className="nx-reg-err">
                  <span className="nx-reg-err-icon">⚠</span>
                  <span className="nx-reg-err-text">{error}</span>
                </div>
              )}
              {success && (
                <div className="nx-reg-ok">
                  <span className="nx-reg-ok-icon">✓</span>
                  <span className="nx-reg-ok-text">{success}</span>
                </div>
              )}

              <button type="submit" className="nx-reg-submit" disabled={loading}>
                {loading ? 'Creando cuenta…' : 'Crear cuenta →'}
              </button>
            </form>
            <p className="nx-reg-terms">Al registrarte aceptas nuestros Términos de servicio y Política de privacidad.</p>
            <p className="nx-reg-foot">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;