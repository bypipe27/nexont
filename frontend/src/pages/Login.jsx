import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import AssistedTopBar from '../components/assisted/AssistedTopBar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --cream:#F5F0E8; --cream-dark:#EDE8DF; --ink:#1A1714; --ink-mid:#3D3830; --ink-soft:#7A7268; --ink-ghost:#B8B0A6; --amber:#C4973A; --white:#FDFBF8; --border:rgba(26,23,20,0.12); }

  .nx-login-root { min-height:100vh; background:var(--cream); font-family:'DM Sans',sans-serif; display:flex; flex-direction:column; }


  .nx-login-body { flex:1; display:grid; grid-template-columns:1fr 1fr; min-height:calc(100vh - 68px); }

  .nx-login-left { position:relative; overflow:hidden; background:var(--ink); display:flex; flex-direction:column; justify-content:flex-end; padding:5rem; }
  .nx-login-left-img { position:absolute; inset:0; background:linear-gradient(160deg, #2a2420 0%, #1A1714 60%); }
  .nx-login-left-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(26,23,20,0.97) 0%, rgba(26,23,20,0.3) 60%, transparent 100%); }
  .nx-login-left-content { position:relative; z-index:2; }

  .nx-login-tag { font-size:0.6rem; font-weight:500; letter-spacing:0.28em; text-transform:uppercase; color:var(--amber); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.85rem; }
  .nx-login-tag::before { content:''; display:block; width:28px; height:1px; background:var(--amber); }

  /* THE BIG CHANGE — HEADLINE */
  .nx-login-headline {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(3.5rem,5.5vw,6rem);
    font-weight:200;
    color:var(--cream);
    line-height:0.95;
    margin-bottom:1.5rem;
    letter-spacing:-0.025em;
  }
  .nx-login-headline em { font-style:italic; color:var(--amber); display:block; }

  .nx-login-desc { font-size:0.9rem; color:rgba(245,240,232,0.45); line-height:1.9; max-width:340px; font-weight:300; }
  .nx-login-feats { margin-top:3rem; display:flex; flex-direction:column; gap:1rem; }
  .nx-login-feat { display:flex; align-items:center; gap:0.9rem; }
  .nx-login-feat-dot { width:3px; height:3px; border-radius:50%; background:var(--amber); flex-shrink:0; }
  .nx-login-feat-txt { font-size:0.8rem; color:rgba(245,240,232,0.45); letter-spacing:0.02em; }
  .nx-login-feat-txt b { color:rgba(245,240,232,0.8); font-weight:500; }

  .nx-login-right { display:flex; align-items:center; justify-content:center; padding:3rem 2rem; background:var(--cream); }
  .nx-login-card { width:100%; max-width:390px; }

  .nx-login-card-tag { font-size:0.6rem; font-weight:600; letter-spacing:0.24em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:0.85rem; display:flex; align-items:center; gap:0.65rem; }
  .nx-login-card-tag::before { content:''; display:block; width:22px; height:1px; background:var(--ink-soft); }

  .nx-login-card-title {
    font-family:'Cormorant Garamond',serif;
    font-size:3rem;
    font-weight:200;
    color:var(--ink);
    margin-bottom:0.4rem;
    letter-spacing:-0.025em;
    line-height:1;
  }
  .nx-login-card-sub { font-size:0.85rem; color:var(--ink-soft); margin-bottom:2.75rem; line-height:1.7; font-weight:300; }

  .nx-lf { margin-bottom:1.35rem; }
  .nx-lf label { display:block; font-size:0.6rem; font-weight:600; color:var(--ink-soft); margin-bottom:0.5rem; letter-spacing:0.16em; text-transform:uppercase; }
  .nx-lf input { width:100%; height:46px; padding:0 1rem; background:var(--white); border:1px solid var(--border); color:var(--ink); font-size:0.88rem; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
  .nx-lf input:focus { border-color:var(--ink); }
  .nx-lf input::placeholder { color:var(--ink-ghost); }
  .nx-lf input.err { border-color:#DC2626; }

  .nx-login-err { display:flex; align-items:flex-start; gap:0.55rem; background:#FEF2F2; border:1px solid #FCA5A5; border-left:3px solid #DC2626; padding:0.7rem 1rem; margin-bottom:1.25rem; animation:nx-err-in 0.2s ease; }
  .nx-login-err-icon { color:#DC2626; font-size:0.8rem; flex-shrink:0; margin-top:1px; }
  .nx-login-err-text { font-size:0.78rem; color:#DC2626; line-height:1.5; }
  @keyframes nx-err-in { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }

  .nx-login-submit { width:100%; height:50px; background:var(--ink); color:var(--cream); font-family:'DM Sans',sans-serif; font-weight:500; font-size:0.76rem; letter-spacing:0.14em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.2s; margin-top:0.5rem; }
  .nx-login-submit:hover:not(:disabled) { background:var(--ink-mid); }
  .nx-login-submit:disabled { opacity:0.45; cursor:not-allowed; }

  .nx-login-foot { text-align:center; margin-top:2rem; font-size:0.82rem; color:var(--ink-soft); }
  .nx-login-foot a { color:var(--ink); font-weight:500; text-decoration:none; border-bottom:1px solid var(--ink); padding-bottom:1px; }
  .nx-login-foot a:hover { color:var(--amber); border-bottom-color:var(--amber); }

  @media (max-width:820px) { .nx-login-body { grid-template-columns:1fr; } .nx-login-left { display:none; } .nx-login-right { padding:2.5rem 1.5rem; min-height:calc(100vh - 68px); } }
`;
if (!document.getElementById('nx-login-styles')) { const el = document.createElement('style'); el.id = 'nx-login-styles'; el.textContent = STYLES; document.head.appendChild(el); }

const parseError = err => { const d = err.response?.data; if (!d) return 'Error de conexión. Verifica tu internet.'; if (d.details?.length) return d.details.join(' · '); return d.error || 'Credenciales inválidas.'; };

function Login() {
  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) { setError(parseError(err)); }
    finally { setLoading(false); }
  };
  return (
    <div className="nx-login-root">
      <AssistedTopBar />
      <div className="nx-login-body">
        <div className="nx-login-left">
          <div className="nx-login-left-img" />
          <div className="nx-login-left-overlay" />
          <div className="nx-login-left-content">
            <div className="nx-login-tag">Marketplace Colombiano</div>
            <h1 className="nx-login-headline">
              Bienvenido<br />de vuelta a<br />
              <em>Nexont</em>
            </h1>
            <p className="nx-login-desc">Accede a tu cuenta para explorar productos únicos y conectar con vendedores verificados.</p>
            <div className="nx-login-feats">
              {[['Miles de productos únicos', 'Catálogo curado de vendedores verificados'], ['Compras 100% seguras', 'Transacciones protegidas en todo momento'], ['Soporte 24/7', 'Estamos aquí cuando nos necesites']].map(([t, s]) => (
                <div key={t} className="nx-login-feat">
                  <div className="nx-login-feat-dot" />
                  <div className="nx-login-feat-txt"><b>{t}</b> — {s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="nx-login-right">
          <div className="nx-login-card">
            <div className="nx-login-card-tag">Acceso</div>
            <h2 className="nx-login-card-title">Iniciar sesión</h2>
            <p className="nx-login-card-sub">Ingresa tus credenciales para continuar</p>
            <form onSubmit={handleSubmit}>
              <div className="nx-lf">
                <label>Correo electrónico</label>
                <input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="tu@email.com" className={error ? 'err' : ''} />
              </div>
              <div className="nx-lf">
                <label>Contraseña</label>
                <input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} required placeholder="••••••••" className={error ? 'err' : ''} />
              </div>
              {error && <div className="nx-login-err"><span className="nx-login-err-icon">⚠</span><span className="nx-login-err-text">{error}</span></div>}
              <button type="submit" className="nx-login-submit" disabled={loading}>{loading ? 'Verificando…' : 'Iniciar sesión →'}</button>
            </form>
            <p className="nx-login-foot">¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;