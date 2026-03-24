import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --cream:#F5F0E8; --cream-dark:#EDE8DF; --ink:#1A1714; --ink-mid:#3D3830; --ink-soft:#7A7268; --ink-ghost:#B8B0A6; --amber:#C4973A; --white:#FDFBF8; --border:rgba(26,23,20,0.12); }

  .nx-reg-root { min-height:100vh; background:var(--cream); font-family:'DM Sans',sans-serif; display:flex; flex-direction:column; }

  .nx-reg-bar { height:68px; background:var(--white); border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 3rem; }
  .nx-reg-brand { display:flex; align-items:center; gap:0.75rem; text-decoration:none; }
  .nx-reg-brand img { height:28px; }
  .nx-reg-brand-name { font-family:'Cormorant Garamond',serif; font-size:1.65rem; font-weight:600; color:var(--ink); letter-spacing:0.06em; }

  .nx-reg-body { flex:1; display:grid; grid-template-columns:5fr 7fr; min-height:calc(100vh - 68px); }

  /* Left panel */
  .nx-reg-left { background:var(--white); border-right:1px solid var(--border); padding:4rem 3rem; display:flex; flex-direction:column; justify-content:center; }
  .nx-reg-left-tag { font-size:0.6rem; font-weight:600; letter-spacing:0.26em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.65rem; }
  .nx-reg-left-tag::before { content:''; display:block; width:22px; height:1px; background:var(--ink-soft); }

  .nx-reg-left-title {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(2.5rem,4vw,4rem);
    font-weight:200;
    color:var(--ink);
    margin-bottom:0.6rem;
    line-height:0.95;
    letter-spacing:-0.025em;
  }
  .nx-reg-left-title em { font-style:italic; color:var(--amber); display:block; }

  .nx-reg-left-sub { font-size:0.85rem; color:var(--ink-soft); line-height:1.8; margin-bottom:3rem; font-weight:300; max-width:260px; }
  .nx-reg-steps { display:flex; flex-direction:column; gap:0; border-top:1px solid var(--border); }
  .nx-reg-step { display:flex; gap:1.1rem; padding:1.1rem 0; border-bottom:1px solid var(--border); }
  .nx-reg-step-n { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:200; color:var(--amber); flex-shrink:0; width:24px; padding-top:1px; line-height:1; }
  .nx-reg-step-title { font-size:0.82rem; font-weight:500; color:var(--ink); margin-bottom:0.2rem; }
  .nx-reg-step-sub { font-size:0.72rem; color:var(--ink-ghost); line-height:1.5; }
  .nx-reg-stats { display:flex; gap:2.5rem; margin-top:2.5rem; padding-top:2rem; border-top:1px solid var(--border); }
  .nx-reg-stat-val { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:200; color:var(--ink); display:block; letter-spacing:-0.02em; }
  .nx-reg-stat-lbl { font-size:0.6rem; color:var(--ink-ghost); letter-spacing:0.12em; text-transform:uppercase; }

  /* Right panel */
  .nx-reg-right { display:flex; align-items:center; justify-content:center; padding:3rem 2rem; background:var(--cream); overflow-y:auto; }
  .nx-reg-card { width:100%; max-width:440px; }
  .nx-reg-card-tag { font-size:0.6rem; font-weight:600; letter-spacing:0.24em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:0.85rem; display:flex; align-items:center; gap:0.65rem; }
  .nx-reg-card-tag::before { content:''; display:block; width:22px; height:1px; background:var(--ink-soft); }

  .nx-reg-card-title {
    font-family:'Cormorant Garamond',serif;
    font-size:3rem;
    font-weight:200;
    color:var(--ink);
    margin-bottom:0.4rem;
    letter-spacing:-0.025em;
    line-height:1;
  }
  .nx-reg-card-sub { font-size:0.85rem; color:var(--ink-soft); margin-bottom:2.25rem; line-height:1.7; font-weight:300; }

  .nx-rf { margin-bottom:1.1rem; }
  .nx-rf label { display:block; font-size:0.6rem; font-weight:600; color:var(--ink-soft); margin-bottom:0.45rem; letter-spacing:0.16em; text-transform:uppercase; }
  .nx-rf input { width:100%; height:44px; padding:0 0.95rem; background:var(--white); border:1px solid var(--border); color:var(--ink); font-size:0.88rem; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
  .nx-rf input:focus { border-color:var(--ink); }
  .nx-rf input::placeholder { color:var(--ink-ghost); }
  .nx-rf input.err { border-color:#DC2626; }
  .nx-rf-row { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }

  .nx-reg-err { display:flex; align-items:flex-start; gap:0.55rem; background:#FEF2F2; border:1px solid #FCA5A5; border-left:3px solid #DC2626; padding:0.7rem 1rem; margin-bottom:1.1rem; animation:nx-err-in 0.2s ease; }
  .nx-reg-err-icon { color:#DC2626; font-size:0.8rem; flex-shrink:0; margin-top:1px; }
  .nx-reg-err-text { font-size:0.78rem; color:#DC2626; line-height:1.5; }
  .nx-reg-ok { display:flex; align-items:flex-start; gap:0.55rem; background:#F0FDF4; border:1px solid #86EFAC; border-left:3px solid #16A34A; padding:0.7rem 1rem; margin-bottom:1.1rem; animation:nx-err-in 0.2s ease; }
  .nx-reg-ok-icon { color:#16A34A; font-size:0.8rem; flex-shrink:0; margin-top:1px; }
  .nx-reg-ok-text { font-size:0.78rem; color:#16A34A; line-height:1.5; }
  @keyframes nx-err-in { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }

  .nx-reg-submit { width:100%; height:50px; background:var(--ink); color:var(--cream); font-family:'DM Sans',sans-serif; font-weight:500; font-size:0.76rem; letter-spacing:0.14em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.2s; margin-top:0.5rem; }
  .nx-reg-submit:hover:not(:disabled) { background:var(--ink-mid); }
  .nx-reg-submit:disabled { opacity:0.45; cursor:not-allowed; }
  .nx-reg-terms { font-size:0.72rem; color:var(--ink-ghost); text-align:center; margin-top:1.1rem; line-height:1.7; }
  .nx-reg-foot { text-align:center; margin-top:1.75rem; font-size:0.82rem; color:var(--ink-soft); }
  .nx-reg-foot a { color:var(--ink); font-weight:500; text-decoration:none; border-bottom:1px solid var(--ink); padding-bottom:1px; }
  .nx-reg-foot a:hover { color:var(--amber); border-bottom-color:var(--amber); }

  @media (max-width:900px) { .nx-reg-body { grid-template-columns:1fr; } .nx-reg-left { display:none; } .nx-reg-right { padding:2.5rem 1.5rem; min-height:calc(100vh - 68px); align-items:flex-start; padding-top:3rem; } }
`;
if (!document.getElementById('nx-reg-styles')) { const el = document.createElement('style'); el.id='nx-reg-styles'; el.textContent=STYLES; document.head.appendChild(el); }

const parseError = err => { const d = err.response?.data; if (!d) return 'Error de conexión.'; if (d.details?.length) return d.details.join(' · '); return d.error || 'Error al registrar.'; };

function Register() {
  const [form, setForm] = useState({ nombres:'', apellidos:'', correo:'', contrasena:'' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});
  const handleSubmit = async e => {
    e.preventDefault(); setError(null); setSuccess(null); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setSuccess(data.message || '¡Cuenta creada! Revisa tu correo para verificarla.');
      setForm({ nombres:'', apellidos:'', correo:'', contrasena:'' });
    } catch (err) { setError(parseError(err)); }
    finally { setLoading(false); }
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
          <div className="nx-reg-left-tag">Únete hoy</div>
          <h2 className="nx-reg-left-title">
            Empieza a<br />vender en<br />
            <em>Nexont</em>
          </h2>
          <p className="nx-reg-left-sub">Crea tu cuenta gratis y conecta con miles de compradores en Colombia.</p>
          <div className="nx-reg-steps">
            {[['1','Crea tu cuenta','Regístrate en menos de 2 minutos'],['2','Verifica tu correo','Confirma tu identidad'],['3','Publica y vende','Llega a miles de compradores']].map(([n,t,s]) => (
              <div key={n} className="nx-reg-step">
                <div className="nx-reg-step-n">{n}</div>
                <div><div className="nx-reg-step-title">{t}</div><div className="nx-reg-step-sub">{s}</div></div>
              </div>
            ))}
          </div>
          <div className="nx-reg-stats">
            <div><span className="nx-reg-stat-val">100%</span><span className="nx-reg-stat-lbl">Verificados</span></div>
            <div><span className="nx-reg-stat-val">24h</span><span className="nx-reg-stat-lbl">Soporte</span></div>
          </div>
        </div>
        <div className="nx-reg-right">
          <div className="nx-reg-card">
            <div className="nx-reg-card-tag">Nueva cuenta</div>
            <h2 className="nx-reg-card-title">Crear cuenta</h2>
            <p className="nx-reg-card-sub">Únete al marketplace colombiano</p>
            <form onSubmit={handleSubmit}>
              <div className="nx-rf-row">
                <div className="nx-rf"><label>Nombre</label><input type="text" name="nombres" value={form.nombres} onChange={handleChange} required placeholder="Tu nombre" className={error?'err':''} /></div>
                <div className="nx-rf"><label>Apellido</label><input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} required placeholder="Tu apellido" className={error?'err':''} /></div>
              </div>
              <div className="nx-rf"><label>Correo electrónico</label><input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="tu@email.com" className={error?'err':''} /></div>
              <div className="nx-rf"><label>Contraseña</label><input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} required placeholder="Mínimo 8 caracteres" className={error?'err':''} /></div>
              {error   && <div className="nx-reg-err"><span className="nx-reg-err-icon">⚠</span><span className="nx-reg-err-text">{error}</span></div>}
              {success && <div className="nx-reg-ok"><span className="nx-reg-ok-icon">✓</span><span className="nx-reg-ok-text">{success}</span></div>}
              <button type="submit" className="nx-reg-submit" disabled={loading}>{loading?'Creando cuenta…':'Crear cuenta →'}</button>
            </form>
            <p className="nx-reg-terms">Al registrarte aceptas nuestros Términos y Política de privacidad.</p>
            <p className="nx-reg-foot">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Register;