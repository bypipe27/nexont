import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  .nx-ve-root {
    min-height: 100vh; background: #0a0908;
    font-family: 'Inter', sans-serif; color: #f0ece4;
    display: flex; flex-direction: column;
  }
  .nx-ve-bar {
    height: 56px; background: rgba(10,9,8,0.96);
    border-bottom: 1px solid rgba(212,163,62,0.12);
    display: flex; align-items: center; padding: 0 2rem;
  }
  .nx-ve-brand { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
  .nx-ve-brand img { height: 28px; }
  .nx-ve-brand-name { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800; color: #f0ece4; }

  .nx-ve-body {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 3rem 1.5rem;
    background:
      radial-gradient(ellipse 55% 50% at 50% 40%, rgba(212,163,62,0.1) 0%, transparent 65%),
      #0a0908;
  }

  .nx-ve-card {
    width: 100%; max-width: 420px; text-align: center;
    background: rgba(255,255,255,0.022); border: 1px solid rgba(212,163,62,0.12);
    border-radius: 12px; padding: 2.5rem 2rem;
    box-shadow: 0 24px 60px rgba(0,0,0,0.4);
  }

  .nx-ve-icon {
    width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 1.5rem;
    display: flex; align-items: center; justify-content: center; font-size: 1.75rem;
  }
  .nx-ve-icon.loading { background: rgba(212,163,62,0.1); border: 1px solid rgba(212,163,62,0.2); animation: nx-ve-pulse 1.5s ease infinite; }
  .nx-ve-icon.success { background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25); }
  .nx-ve-icon.error   { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.25); }

  .nx-ve-tag { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.6rem; display: block; }
  .nx-ve-tag.loading { color: #d4a33e; }
  .nx-ve-tag.success { color: #4ade80; }
  .nx-ve-tag.error   { color: #ef4444; }

  .nx-ve-title { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; color: #f0ece4; margin-bottom: 0.75rem; letter-spacing: -0.01em; }
  .nx-ve-msg { font-size: 0.88rem; color: rgba(240,236,228,0.42); line-height: 1.75; margin-bottom: 2rem; letter-spacing: 0.01em; }

  .nx-ve-spinner {
    width: 28px; height: 28px; border: 2px solid rgba(212,163,62,0.2);
    border-top-color: #d4a33e; border-radius: 50%;
    animation: nx-ve-spin 0.8s linear infinite; margin: 0 auto 0.5rem;
  }

  .nx-ve-btn {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.85rem;
    letter-spacing: 0.04em; padding: 0 1.75rem; height: 44px;
    border-radius: 8px; border: none; cursor: pointer;
    text-decoration: none; transition: all 0.2s; display: inline-flex; align-items: center;
  }
  .nx-ve-btn:hover { background: #e8b84b; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,163,62,0.3); }

  .nx-ve-btn-ghost {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: transparent; color: rgba(240,236,228,0.45);
    font-family: 'Inter', sans-serif; font-weight: 500; font-size: 0.85rem;
    padding: 0 1.75rem; height: 44px; border-radius: 8px;
    border: 1px solid rgba(240,236,228,0.12); cursor: pointer;
    text-decoration: none; transition: all 0.2s;
  }
  .nx-ve-btn-ghost:hover { border-color: rgba(212,163,62,0.35); color: #d4a33e; }

  .nx-ve-divider { border: none; border-top: 1px solid rgba(212,163,62,0.08); margin: 1.5rem 0; }
  .nx-ve-footer { font-size: 0.78rem; color: rgba(240,236,228,0.25); }
  .nx-ve-footer a { color: #d4a33e; text-decoration: none; font-weight: 600; }

  @keyframes nx-ve-spin { to { transform: rotate(360deg); } }
  @keyframes nx-ve-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
`;

if (!document.getElementById('nx-ve-styles')) {
  const el = document.createElement('style');
  el.id = 'nx-ve-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);
  const [status, setStatus]   = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setMessage('Token de verificación no encontrado.'); return; }

    api.get(`/auth/verify-email?token=${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message); })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'El enlace de verificación es inválido o ha expirado.');
      });
  }, [searchParams]);

  return (
    <div className="nx-ve-root">
      <header className="nx-ve-bar">
        <Link to="/" className="nx-ve-brand">
          <img src="/resources/icone.png" alt="Nexont" />
          <span className="nx-ve-brand-name">Nexont</span>
        </Link>
      </header>

      <div className="nx-ve-body">
        <div className="nx-ve-card">
          {status === 'loading' && (
            <>
              <div className="nx-ve-icon loading">
                <div className="nx-ve-spinner" />
              </div>
              <span className="nx-ve-tag loading">Verificando</span>
              <h1 className="nx-ve-title">Verificando tu correo…</h1>
              <p className="nx-ve-msg">Por favor espera un momento mientras confirmamos tu cuenta.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="nx-ve-icon success">✓</div>
              <span className="nx-ve-tag success">Verificado</span>
              <h1 className="nx-ve-title">¡Correo verificado!</h1>
              <p className="nx-ve-msg">{message}</p>
              <Link to="/login" className="nx-ve-btn">Iniciar sesión →</Link>
              <hr className="nx-ve-divider" />
              <p className="nx-ve-footer">
                ¿Quieres explorar primero? <Link to="/">Ver el catálogo</Link>
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="nx-ve-icon error">✕</div>
              <span className="nx-ve-tag error">Error</span>
              <h1 className="nx-ve-title">Enlace inválido</h1>
              <p className="nx-ve-msg">{message}</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="nx-ve-btn">Registrarme de nuevo →</Link>
                <Link to="/login" className="nx-ve-btn-ghost">Iniciar sesión</Link>
              </div>
              <hr className="nx-ve-divider" />
              <p className="nx-ve-footer">
                ¿Necesitas ayuda? <a href="mailto:nexontcolombia@gmail.com">Contactar soporte</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;