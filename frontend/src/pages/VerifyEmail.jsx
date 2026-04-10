import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --cream:#F5F0E8; --cream-dark:#EDE8DF; --ink:#1A1714; --ink-soft:#7A7268; --ink-ghost:#B8B0A6; --amber:#C4973A; --white:#FDFBF8; --border:rgba(26,23,20,0.1); }

  .nxve-root { min-height:100vh; background:var(--cream); font-family:'DM Sans',sans-serif; display:flex; flex-direction:column; }

  .nxve-bar { height:68px; background:var(--white); border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 3rem; }
  .nxve-brand { display:flex; align-items:center; gap:0.75rem; text-decoration:none; }
  .nxve-brand img { height:28px; }
  .nxve-brand-name { font-family:'Cormorant Garamond',serif; font-size:1.65rem; font-weight:600; color:var(--ink); letter-spacing:0.06em; }

  .nxve-body { flex:1; display:flex; align-items:center; justify-content:center; padding:3rem 1.5rem; }

  .nxve-card { width:100%; max-width:420px; background:var(--white); border:1px solid var(--border); padding:3.5rem 3rem; text-align:center; box-shadow:0 12px 48px rgba(26,23,20,0.08); }

  .nxve-icon { width:64px; height:64px; border:1px solid var(--border); margin:0 auto 2rem; display:flex; align-items:center; justify-content:center; font-size:1.4rem; }
  .nxve-icon.loading { animation:nxve-pulse 1.5s ease infinite; }
  .nxve-spinner { width:26px; height:26px; border:2px solid var(--border); border-top-color:var(--ink); border-radius:50%; animation:nxve-spin 0.8s linear infinite; }

  .nxve-tag { font-size:0.6rem; font-weight:600; letter-spacing:0.24em; text-transform:uppercase; display:flex; align-items:center; justify-content:center; gap:0.65rem; margin-bottom:0.85rem; }
  .nxve-tag::before, .nxve-tag::after { content:''; display:block; width:22px; height:1px; background:currentColor; }
  .nxve-tag.loading { color:var(--ink-ghost); }
  .nxve-tag.success { color:#16A34A; }
  .nxve-tag.error   { color:#DC2626; }

  .nxve-title {
    font-family:'Cormorant Garamond',serif;
    font-size:2.5rem;
    font-weight:200;
    color:var(--ink);
    margin-bottom:0.85rem;
    letter-spacing:-0.02em;
    line-height:1;
  }
  .nxve-msg { font-size:0.85rem; color:var(--ink-soft); line-height:1.8; margin-bottom:2.25rem; font-weight:300; }

  .nxve-btn { display:inline-flex; align-items:center; gap:0.4rem; height:46px; padding:0 2.25rem; background:var(--ink); color:var(--cream); font-family:'DM Sans',sans-serif; font-weight:500; font-size:0.74rem; letter-spacing:0.14em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.2s; text-decoration:none; }
  .nxve-btn:hover { background:var(--ink-mid,#3D3830); }
  .nxve-btn-ghost { display:inline-flex; align-items:center; gap:0.4rem; height:46px; padding:0 2.25rem; background:transparent; color:var(--ink); border:1px solid var(--border); font-family:'DM Sans',sans-serif; font-size:0.74rem; letter-spacing:0.12em; text-transform:uppercase; cursor:pointer; transition:all 0.18s; text-decoration:none; }
  .nxve-btn-ghost:hover { border-color:var(--ink); background:var(--cream-dark,#EDE8DF); }
  .nxve-btns { display:flex; gap:0.85rem; justify-content:center; flex-wrap:wrap; }

  .nxve-divider { border:none; border-top:1px solid var(--border); margin:2rem 0; }
  .nxve-foot { font-size:0.78rem; color:var(--ink-ghost); }
  .nxve-foot a { color:var(--ink); text-decoration:none; border-bottom:1px solid var(--ink); padding-bottom:1px; }
  .nxve-foot a:hover { color:var(--amber); border-bottom-color:var(--amber); }

  @keyframes nxve-spin { to { transform:rotate(360deg); } }
  @keyframes nxve-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
`;
if (!document.getElementById('nxve-styles')) { const el=document.createElement('style'); el.id='nxve-styles'; el.textContent=STYLES; document.head.appendChild(el); }

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);
  const [status, setStatus]   = useState('loading');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (hasRun.current) return; hasRun.current=true;
    const token=searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('Token de verificación no encontrado.'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.error||'El enlace de verificación es inválido o ha expirado.'); });
  }, [searchParams]);
  return (
    <div className="nxve-root">
      <header className="nxve-bar"><Link to="/" className="nxve-brand"><img src="/resources/icone.png" alt="Nexont" /><span className="nxve-brand-name">Nexont</span></Link></header>
      <div className="nxve-body">
        <div className="nxve-card">
          {status==='loading' && <>
            <div className="nxve-icon loading"><div className="nxve-spinner" /></div>
            <div className="nxve-tag loading">Verificando</div>
            <h1 className="nxve-title">Un momento…</h1>
            <p className="nxve-msg">Estamos confirmando tu cuenta, esto solo tardará un segundo.</p>
          </>}
          {status==='success' && <>
            <div className="nxve-icon" style={{borderColor:'#16A34A',color:'#16A34A',fontSize:'1.2rem'}}>✓</div>
            <div className="nxve-tag success">Verificado</div>
            <h1 className="nxve-title">Correo verificado</h1>
            <p className="nxve-msg">{message}</p>
            <Link to="/login" className="nxve-btn">Iniciar sesión →</Link>
            <hr className="nxve-divider" />
            <p className="nxve-foot">¿Quieres explorar primero? <Link to="/">Ver el catálogo</Link></p>
          </>}
          {status==='error' && <>
            <div className="nxve-icon" style={{borderColor:'#DC2626',color:'#DC2626',fontSize:'1.2rem'}}>✕</div>
            <div className="nxve-tag error">Error</div>
            <h1 className="nxve-title">Enlace inválido</h1>
            <p className="nxve-msg">{message}</p>
            <div className="nxve-btns">
              <Link to="/register" className="nxve-btn">Registrarme →</Link>
              <Link to="/login" className="nxve-btn-ghost">Iniciar sesión</Link>
            </div>
            <hr className="nxve-divider" />
            <p className="nxve-foot">¿Necesitas ayuda? <a href="mailto:nexontcolombia@gmail.com">Contactar soporte</a></p>
          </>}
        </div>
      </div>
    </div>
  );
}
export default VerifyEmail;