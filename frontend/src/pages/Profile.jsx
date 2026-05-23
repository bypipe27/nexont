import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import AssistedTopBar from '../components/assisted/AssistedTopBar';
import { ensureProfileStyles } from '../components/profile/profileStyles';

ensureProfileStyles();

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
    const isDark = theme === 'dark';
    return (
      <div className="pf-root" data-theme={theme}>
        <nav className="pf-nav">
          <Link to="/" className="pf-nav-brand">
            <img 
              src={isDark ? '/resources/icone.png' : '/resources/icon.png'} 
              alt="Nexont" 
              width="28" 
              height="28" 
              style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
            />
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

        <div className="pf-panel">
          {/* Tarjeta 1: Información Personal (Formulario + Avatar) */}
          <form className="pf-card form" onSubmit={e => { e.preventDefault(); handleSave(); }}>
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
                  {photoFile && <span style={{ color: 'var(--ar-accent)' }}>Imagen seleccionada — guarda para aplicar</span>}
                </div>
                <button type="button" className="pf-avatar-btn" onClick={() => fileRef.current?.click()}>
                  Elegir imagen
                </button>
                {photoErr && <div className="pf-avatar-err">{photoErr}</div>}
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

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

          {/* Tarjeta 2: Verificación de Vendedor */}
          <section className="pf-card" style={{ padding: '2rem' }}>
            <div className="pf-eyebrow" style={{ marginBottom: '1rem' }}>Verificación</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 0.5rem 0', color: 'var(--ar-on-surface)' }}>
              Verificación de vendedor
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--ar-on-surface-variant)', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
              Para publicar y vender productos en la plataforma de Nexont, debes completar la verificación de identidad.
            </p>

            {/* Banner de Estado de Verificación */}
            <div style={{
              background: verificationStatus === 'verificado' ? 'rgba(22, 163, 74, 0.06)' : (verificationStatus === 'pendiente' ? 'rgba(230, 119, 0, 0.06)' : 'var(--ar-surface-low)'),
              border: `1px solid ${verificationStatus === 'verificado' ? 'rgba(22, 163, 74, 0.2)' : (verificationStatus === 'pendiente' ? 'rgba(230, 119, 0, 0.2)' : 'var(--ar-outline-variant)')}`,
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <span className="pf-label" style={{ display: 'block', marginBottom: '0.2rem', color: verificationStatus === 'verificado' ? '#16A34A' : (verificationStatus === 'pendiente' ? '#E67700' : 'var(--ar-secondary)') }}>
                  Estado de solicitud
                </span>
                <span style={{ fontSize: '0.92rem', fontWeight: 800 }}>
                  {verificationStatus === 'verificado' && '✓ Verificado exitosamente'}
                  {verificationStatus === 'pendiente' && '⏳ En revisión (Pendiente)'}
                  {verificationStatus === 'rechazado' && '✕ Solicitud rechazada'}
                  {verificationStatus === null && 'No Iniciada'}
                </span>
              </div>
              {verificationStatus === 'pendiente' && (
                <span style={{ fontSize: '0.72rem', color: 'var(--ar-on-surface-variant)' }}>
                  Estamos procesando tus datos. Esto puede tardar unos minutos.
                </span>
              )}
            </div>

            {/* Formulario de Verificación (solo se muestra si NO está verificado) */}
            {verificationStatus !== 'verificado' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="pf-row">
                  <div className="pf-field">
                    <label className="pf-label">Nombre completo</label>
                    <input 
                      className="pf-input" 
                      value={verificationForm.fullName} 
                      onChange={e => setVerificationForm(f => ({ ...f, fullName: e.target.value }))} 
                      placeholder="Tu nombre completo (como aparece en tu documento)"
                    />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">Número de documento</label>
                    <input 
                      className="pf-input" 
                      value={verificationForm.documentNumber} 
                      onChange={e => { setVerificationForm(f => ({ ...f, documentNumber: e.target.value })); setVerificationFormError(''); }} 
                      placeholder="Cédula, DNI o Pasaporte"
                    />
                    {verificationFormError && <div className="pf-avatar-err" style={{ marginTop: 8 }}>{verificationFormError}</div>}
                  </div>
                </div>

                <div className="pf-field">
                  <label className="pf-label">Ciudad</label>
                  <input 
                    className="pf-input" 
                    value={verificationForm.ciudad} 
                    onChange={e => setVerificationForm(f => ({ ...f, ciudad: e.target.value }))} 
                    placeholder="Ciudad de residencia"
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--ar-outline-variant)', paddingTop: '1.25rem', marginTop: '0.25rem' }}>
                  <span className="pf-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Cargar Documentos de Soporte</span>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <button 
                      type="button" 
                      className="pf-avatar-btn" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: '40px' }}
                      onClick={() => docRef.current?.click()} 
                      disabled={uploadingDocs}
                    >
                      📁 Cargar cédula 
                      {docSelected ? <span style={{ color: '#16A34A', fontWeight: 900 }}>✓</span> : <span style={{ color: 'var(--ar-on-surface-variant)' }}>+</span>}
                    </button>
                    <button 
                      type="button" 
                      className="pf-avatar-btn" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: '40px' }}
                      onClick={() => personalRef.current?.click()} 
                      disabled={uploadingDocs}
                    >
                      👤 Foto personal
                      {personalSelected ? <span style={{ color: '#16A34A', fontWeight: 900 }}>✓</span> : <span style={{ color: 'var(--ar-on-surface-variant)' }}>+</span>}
                    </button>
                  </div>
                  <span className="pf-hint">
                    Formatos permitidos: JPG, PNG. Asegúrate de que las imágenes sean nítidas y legibles.
                  </span>
                  
                  <input ref={docRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={(e) => setDocSelected(!!e.target.files?.[0])} />
                  <input ref={personalRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={(e) => setPersonalSelected(!!e.target.files?.[0])} />
                </div>

                <div style={{ borderTop: '1px solid var(--ar-outline-variant)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-start' }}>
                  <button
                    type="button"
                    className="pf-save"
                    style={{ height: '42px', padding: '0 2rem' }}
                    onClick={async () => {
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
                        showToast('Adjunta al menos una imagen: cédula o foto personal (JPG/PNG)');
                        return;
                      }

                      try {
                        setSubmittingVerificationForm(true);
                        await api.post('/users/me/verification/form', verificationForm);
                        if (hasDoc || hasPersonal) {
                          setUploadingDocs(true);
                          const fd = new FormData();
                          if (hasDoc) fd.append('documentoIdentidad', docRef.current.files[0]);
                          if (hasPersonal) fd.append('fotoPersonal', personalRef.current.files[0]);
                          await api.post('/users/me/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                        }
                        const { data } = await api.post('/users/me/verification');
                        if (data?.status === 'verificado') {
                          try { const res = await api.get('/users/me'); const updated = res.data?.user; if (updated) { localStorage.setItem('user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('user') || '{}')), ...updated })); window.dispatchEvent(new Event('user-updated')); } } catch (_) { }
                          setVerificationStatus('verificado');
                          showToast('¡Verificado! Redirigiendo al dashboard...');
                          setTimeout(() => navigate('/dashboard'), 600);
                        } else {
                          setVerificationStatus('pendiente');
                          showToast('Solicitud enviada. Estado: pendiente');
                          fetchVerification();
                        }

                        setVerificationForm({ fullName: '', documentNumber: '', ciudad: '' });
                        if (docRef.current) docRef.current.value = '';
                        if (personalRef.current) personalRef.current.value = '';
                        setDocSelected(false);
                        setPersonalSelected(false);
                      } catch (err) {
                        showToast(err.response?.data?.error || 'Error al enviar verificación');
                      } finally {
                        setSubmittingVerificationForm(false);
                        setUploadingDocs(false);
                      }
                    }}
                    disabled={verificationStatus === 'verificado' || submittingVerificationForm}
                  >
                    {submittingVerificationForm ? 'Enviando…' : (verificationStatus === 'verificado' ? 'Verificado' : 'Enviar verificación')}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* TOAST */}
      {toast && <div className="pf-toast">{toast}</div>}
    </div>
  );
}