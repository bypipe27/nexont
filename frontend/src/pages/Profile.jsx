import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import AssistedTopBar from '../components/assisted/AssistedTopBar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;0,700;1,200;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pf-root {
    min-height: 100vh;
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
  }

  /* NAV */
  .pf-nav {
    position: sticky; top: 0; z-index: 200;
    height: 68px;
    background: rgba(245,240,232,0.94);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 3rem; gap: 1.5rem;
  }
  [data-theme="dark"] .pf-nav { background: rgba(14,12,10,0.94); }
  .pf-nav-brand {
    display: flex; align-items: center; gap: 0.75rem;
    text-decoration: none; flex-shrink: 0;
  }
  .pf-nav-brand img { height: 28px; }
  .pf-nav-wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem; font-weight: 600;
    color: var(--ink); letter-spacing: 0.06em;
  }
  .pf-nav-back {
    display: flex; align-items: center; gap: 0.4rem;
    height: 36px; padding: 0 1rem;
    background: transparent; border: 1px solid var(--border);
    color: var(--ink-soft); font-size: 0.75rem;
    font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; cursor: pointer;
    transition: all 0.18s; font-family: 'DM Sans', sans-serif;
    text-decoration: none;
  }
  .pf-nav-back:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }

  /* LAYOUT */
  .pf-layout {
    max-width: 720px;
    margin: 0 auto;
    padding: 3.5rem 2rem 5rem;
  }

  /* HEADER */
  .pf-eyebrow {
    font-size: 0.6rem; font-weight: 600; letter-spacing: 0.25em;
    text-transform: uppercase; color: var(--ink-soft);
    margin-bottom: 0.6rem;
    display: flex; align-items: center; gap: 0.6rem;
  }
  .pf-eyebrow::before {
    content: ''; display: block; width: 24px; height: 1px; background: var(--ink-soft);
  }
  .pf-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.8rem; font-weight: 200;
    color: var(--ink); line-height: 1.05;
    letter-spacing: -0.02em; margin-bottom: 2.5rem;
  }

  /* AVATAR SECTION */
  .pf-avatar-section {
    display: flex; align-items: center; gap: 2rem;
    padding: 1.75rem;
    border: 1px solid var(--border);
    background: var(--cream-dark);
    margin-bottom: 2rem;
  }
  .pf-avatar-wrap { position: relative; flex-shrink: 0; }
  .pf-avatar {
    width: 90px; height: 90px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; border: 2px solid var(--border);
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem; font-weight: 300;
    cursor: pointer; transition: opacity 0.2s;
  }
  .pf-avatar:hover { opacity: 0.85; }
  .pf-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .pf-avatar-spinner {
    position: absolute; inset: 0; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.35);
  }
  .pf-spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    animation: pf-spin 0.7s linear infinite;
  }
  @keyframes pf-spin { to { transform: rotate(360deg); } }

  .pf-avatar-info { flex: 1; }
  .pf-avatar-label {
    font-size: 0.78rem; font-weight: 600; color: var(--ink);
    margin-bottom: 0.3rem;
  }
  .pf-avatar-hint {
    font-size: 0.72rem; color: var(--ink-soft); line-height: 1.6;
    margin-bottom: 0.75rem;
  }
  .pf-avatar-btn {
    height: 34px; padding: 0 1rem;
    background: transparent; border: 1px solid var(--border);
    color: var(--ink); font-size: 0.7rem; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .pf-avatar-btn:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }
  .pf-avatar-err {
    font-size: 0.72rem; color: #DC2626; margin-top: 0.5rem;
    border: 1px solid #FCA5A5; background: #FEF2F2;
    padding: 0.4rem 0.75rem;
  }

  /* FORM */
  .pf-form { display: flex; flex-direction: column; gap: 1.5rem; }
  .pf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  .pf-field { display: flex; flex-direction: column; gap: 0.45rem; }
  .pf-field.full { grid-column: 1 / -1; }
  .pf-label {
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--ink-soft);
  }
  .pf-input {
    height: 44px; padding: 0 1rem;
    background: var(--white); border: 1px solid var(--border);
    color: var(--ink); font-size: 0.88rem;
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s;
  }
  .pf-input:focus { border-color: var(--ink); }
  .pf-input:disabled { opacity: 0.5; cursor: not-allowed; background: var(--cream-dark); }
  .pf-hint { font-size: 0.68rem; color: var(--ink-ghost); }

  /* ACTIONS */
  .pf-actions {
    display: flex; align-items: center; gap: 1rem;
    padding-top: 1.5rem; border-top: 1px solid var(--border);
    margin-top: 0.5rem;
  }
  .pf-save {
    height: 44px; padding: 0 2rem;
    background: var(--ink); color: var(--cream);
    border: none; cursor: pointer;
    font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em;
    text-transform: uppercase; font-family: 'DM Sans', sans-serif;
    transition: background 0.18s;
  }
  .pf-save:hover:not(:disabled) { background: var(--ink-mid); }
  .pf-save:disabled { opacity: 0.5; cursor: not-allowed; }
  .pf-cancel {
    height: 44px; padding: 0 1.5rem;
    background: transparent; border: 1px solid var(--border);
    color: var(--ink-soft); font-size: 0.78rem; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif; text-decoration: none;
    display: inline-flex; align-items: center;
  }
  .pf-cancel:hover { border-color: var(--ink); color: var(--ink); }

  /* TOAST */
  .pf-toast {
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
    background: #16A34A; color: #fff;
    padding: 0.85rem 1.75rem; font-size: 0.82rem;
    font-weight: 500; letter-spacing: 0.04em;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    z-index: 9999; white-space: nowrap;
    animation: pf-fadein 0.25s ease;
  }
  @keyframes pf-fadein { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  /* DIVIDER */
  .pf-divider {
    border: none; border-top: 1px solid var(--border); margin: 0.5rem 0;
  }

  @media (max-width: 600px) {
    .pf-layout { padding: 2rem 1.25rem 4rem; }
    .pf-nav { padding: 0 1.25rem; }
    .pf-row { grid-template-columns: 1fr; }
    .pf-title { font-size: 2rem; }
    .pf-avatar-section { flex-direction: column; align-items: flex-start; }
  }
`;

if (!document.getElementById('pf-styles')) {
  const el = document.createElement('style');
  el.id = 'pf-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

const AVATAR_COLORS = [
  { bg: '#F0F4FF', color: '#3B5BDB' },
  { bg: '#FFF0F6', color: '#C2255C' },
  { bg: '#F3FCF0', color: '#2F9E44' },
  { bg: '#FFF9DB', color: '#E67700' },
  { bg: '#F8F0FC', color: '#7950F2' },
  { bg: '#E8FAF0', color: '#0CA678' },
];
function getAvatarColor(name = '') {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

export default function Profile() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const fileRef = useRef(null);
  const docRef = useRef(null);
  const personalRef = useRef(null);

  const [form, setForm] = useState({ nombres: '', apellidos: '', correo: '' });
  const [preview, setPreview] = useState(null);   // URL preview local
  const [photoFile, setPhotoFile] = useState(null);   // File a subir
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoErr, setPhotoErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [docSelected, setDocSelected] = useState(false);
  const [personalSelected, setPersonalSelected] = useState(false);
  const [verificationForm, setVerificationForm] = useState({ fullName: '', documentNumber: '', ciudad: '' });
  const [submittingVerificationForm, setSubmittingVerificationForm] = useState(false);
  const [verificationFormError, setVerificationFormError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Cargar datos actuales del usuario
  useEffect(() => {
    api.get('/users/me')
      .then(({ data }) => {
        const u = data.user;
        setForm({ nombres: u.nombres || '', apellidos: u.apellidos || '', correo: u.correo || '' });
        if (u.fotoPerfil) setPreview(u.fotoPerfil);
        // load verification status
        fetchVerification();
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const fetchVerification = async () => {
    try {
      const { data } = await api.get('/users/me/verification');
      setVerificationStatus(data.status);
    } catch (err) {
      // ignore
    }
  };

  // Polling helper while pending
  useEffect(() => {
    let timer;
    if (verificationStatus === 'pendiente') {
      timer = setInterval(fetchVerification, 30000);
    }
    return () => clearInterval(timer);
  }, [verificationStatus]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Selección de foto — previsualización inmediata
  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setPhotoErr('Solo se permiten imágenes JPG, PNG o WEBP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoErr('La imagen no puede superar 5 MB');
      return;
    }
    setPhotoErr('');
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    setPhotoErr('');
    try {
      const formData = new FormData();
      if (form.nombres) formData.append('nombres', form.nombres.trim());
      if (form.apellidos) formData.append('apellidos', form.apellidos.trim());
      if (form.correo) formData.append('correo', form.correo.trim());
      if (photoFile) formData.append('fotoPerfil', photoFile);

      const { data } = await api.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Actualizar localStorage para que el navbar refleje los cambios sin recargar
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, ...data.user };
      localStorage.setItem('user', JSON.stringify(updated));

      // Disparar evento para que componentes escuchen el cambio
      window.dispatchEvent(new Event('user-updated'));

      setPhotoFile(null);
      showToast('✓ Perfil actualizado correctamente');
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al guardar los cambios';
      if (msg.toLowerCase().includes('correo') || msg.toLowerCase().includes('email')) {
        // Error de correo duplicado — mostrar inline
        setPhotoErr(msg);
      } else {
        setPhotoErr(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const initials = `${(form.nombres[0] || '').toUpperCase()}${(form.apellidos[0] || '').toUpperCase()}`;
  const avatarColor = getAvatarColor(form.nombres);

  if (loading) {
    return (
      <div className="pf-root" data-theme={theme}>
        <nav className="pf-nav">
          <Link to="/" className="pf-nav-brand">
            <img src="/resources/icon.png" alt="Nexont" />
            <span className="pf-nav-wordmark">Nexont</span>
          </Link>
        </nav>
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--ink-ghost)', fontSize: '0.85rem' }}>
          Cargando…
        </div>
      </div>
    );
  }

  return (
    <div className="pf-root" data-theme={theme}>
      <AssistedTopBar active="tienda" />

      <div className="pf-layout">
        <div className="pf-eyebrow">Mi cuenta</div>
        <h1 className="pf-title">Editar perfil</h1>

        {/* FOTO DE PERFIL */}
        <div className="pf-avatar-section">
          <div className="pf-avatar-wrap">
            <div
              className="pf-avatar"
              style={!preview ? { background: avatarColor.bg, color: avatarColor.color } : {}}
              onClick={() => fileRef.current?.click()}
              title="Cambiar foto"
            >
              {preview
                ? <img src={preview} alt="Foto de perfil" />
                : initials || '?'
              }
            </div>
            {uploadingPhoto && (
              <div className="pf-avatar-spinner">
                <div className="pf-spinner" />
              </div>
            )}
          </div>

          <div className="pf-avatar-info">
            <div className="pf-avatar-label">Foto de perfil</div>
            <div className="pf-avatar-hint">
              JPG, PNG o WEBP · Máximo 5 MB<br />
              {photoFile && <span style={{ color: 'var(--amber)' }}>Imagen seleccionada — guarda para aplicar</span>}
            </div>
            {/* Vendor verification form (N26) */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div className="pf-avatar-label">Formulario de verificación</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.6rem' }}>
                <div>
                  <label className="pf-label">Nombre completo</label>
                  <input className="pf-input" value={verificationForm.fullName} onChange={e => setVerificationForm(f => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div>
                  <label className="pf-label">Número de documento</label>
                  <input className="pf-input" value={verificationForm.documentNumber} onChange={e => { setVerificationForm(f => ({ ...f, documentNumber: e.target.value })); setVerificationFormError(''); }} />
                  {verificationFormError && <div className="pf-avatar-err" style={{ marginTop: 8 }}>{verificationFormError}</div>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="pf-label">Ciudad</label>
                  <input className="pf-input" value={verificationForm.ciudad} onChange={e => setVerificationForm(f => ({ ...f, ciudad: e.target.value }))} />
                </div>
              </div>
              {/* single action: enviar verificación será el botón único más abajo */}
            </div>
            <button className="pf-avatar-btn" onClick={() => fileRef.current?.click()}>
              Elegir imagen
            </button>
            {photoErr && <div className="pf-avatar-err">{photoErr}</div>}
            {/* Document upload (cedula + foto personal) */}
            <div style={{ marginTop: '0.6rem' }}>
              <div className="pf-avatar-label">Subir documento y foto</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="pf-avatar-btn" onClick={() => docRef.current?.click()} disabled={uploadingDocs}>Seleccionar cédula {docSelected && <span style={{ color: '#16A34A', marginLeft: 8 }}>✓</span>}</button>
                <button className="pf-avatar-btn" onClick={() => personalRef.current?.click()} disabled={uploadingDocs}>Seleccionar foto personal {personalSelected && <span style={{ color: '#16A34A', marginLeft: 8 }}>✓</span>}</button>
              </div>
              <input ref={docRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={(e) => setDocSelected(!!e.target.files?.[0])} />
              <input ref={personalRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={(e) => setPersonalSelected(!!e.target.files?.[0])} />
            </div>
            {/* Verification status block */}
            <div style={{ marginTop: '0.6rem' }}>
              <div className="pf-avatar-label">Verificación de vendedor</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '0.5rem' }}>
                {verificationStatus === 'verificado' && 'Estado: verificado'}
                {verificationStatus === 'pendiente' && 'Estado: pendiente — procesando...'}
                {verificationStatus === 'rechazado' && 'Estado: rechazado'}
                {verificationStatus === null && 'Estado: rechazado'}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  className="pf-save"
                  onClick={async () => {
                    // single combined submit: form -> files -> request verification
                    if (!verificationForm.fullName.trim() || !verificationForm.documentNumber.trim() || !verificationForm.ciudad.trim()) {
                      showToast('Completa todos los campos del formulario antes de enviar');
                      return;
                    }
                    if (!/^\d{4,}$/.test(verificationForm.documentNumber.trim())) {
                      setVerificationFormError('El número de documento debe tener al menos 4 dígitos');
                      return;
                    }

                    const hasDoc = !!docRef.current?.files?.[0];
                    const hasPersonal = !!personalRef.current?.files?.[0];
                    if (!hasDoc && !hasPersonal && !preview) {
                      // if no new files and no existing profile photo
                      showToast('Adjunta al menos una imagen: cédula o foto personal (JPG/PNG)');
                      return;
                    }

                    try {
                      setSubmittingVerificationForm(true);
                      // submit form
                      await api.post('/users/me/verification/form', verificationForm);
                      // upload files if present
                      if (hasDoc || hasPersonal) {
                        setUploadingDocs(true);
                        const fd = new FormData();
                        if (hasDoc) fd.append('documentoIdentidad', docRef.current.files[0]);
                        if (hasPersonal) fd.append('fotoPersonal', personalRef.current.files[0]);
                        await api.post('/users/me/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                      }
                      // request verification
                      const { data } = await api.post('/users/me/verification');
                      if (data?.status === 'verificado') {
                        // refresh user and navigate to dashboard
                        try { const res = await api.get('/users/me'); const updated = res.data?.user; if (updated) { localStorage.setItem('user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('user') || '{}')), ...updated })); window.dispatchEvent(new Event('user-updated')); } } catch (_) { }
                        setVerificationStatus('verificado');
                        showToast('¡Verificado! Redirigiendo al dashboard...');
                        setTimeout(() => navigate('/dashboard'), 600);
                      } else {
                        setVerificationStatus('pendiente');
                        showToast('Solicitud enviada. Estado: pendiente');
                        // refresh verification status
                        fetchVerification();
                        // navigate user to profile to finish if needed
                        // (we stay on profile so they can see status)
                      }

                      // cleanup
                      setVerificationForm({ fullName: '', documentNumber: '', ciudad: '' });
                      if (docRef.current) docRef.current.value = '';
                      if (personalRef.current) personalRef.current.value = '';
                      setDocSelected(false); setPersonalSelected(false);
                    } catch (err) {
                      showToast(err.response?.data?.error || 'Error al enviar verificación');
                    } finally {
                      setSubmittingVerificationForm(false); setUploadingDocs(false);
                    }
                  }}
                  disabled={verificationStatus === 'verificado' || submittingVerificationForm}
                >
                  {submittingVerificationForm ? 'Enviando…' : (verificationStatus === 'verificado' ? 'Verificado' : 'Enviar verificación')}
                </button>
              </div>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* FORMULARIO */}
        <form className="pf-form" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div className="pf-row">
            <div className="pf-field">
              <label className="pf-label">Nombres</label>
              <input
                className="pf-input"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                placeholder="Tu nombre"
                autoComplete="given-name"
              />
            </div>
            <div className="pf-field">
              <label className="pf-label">Apellidos</label>
              <input
                className="pf-input"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                placeholder="Tu apellido"
                autoComplete="family-name"
              />
            </div>
          </div>

          <hr className="pf-divider" />

          <div className="pf-field">
            <label className="pf-label">Correo electrónico</label>
            <input
              className="pf-input"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
            <span className="pf-hint">
              Si cambias tu correo, tendrás que volver a verificarlo.
            </span>
          </div>

          <div className="pf-actions">
            <button type="submit" className="pf-save" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <Link to="/" className="pf-cancel">Cancelar</Link>
          </div>
        </form>
      </div>

      {/* TOAST */}
      {toast && <div className="pf-toast">{toast}</div>}
    </div>
  );
}