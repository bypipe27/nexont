import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import AssistedTopBar from '../components/assisted/AssistedTopBar';
import DarkVeil from '../components/animations/DarkVeil';
import { ensureAuthStyles } from '../components/auth/authStyles';

ensureAuthStyles();

const parseError = err => { const d = err.response?.data; if (!d) return 'Error de conexión.'; if (d.details?.length) return d.details.join(' · '); return d.error || 'Error al registrar.'; };

function Register() {
  const [form, setForm] = useState({ nombres: '', apellidos: '', correo: '', contrasena: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault(); setError(null); setSuccess(null); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setSuccess(data.message || '¡Cuenta creada! Revisa tu correo para verificarla.');
      setForm({ nombres: '', apellidos: '', correo: '', contrasena: '' });
    } catch (err) { setError(parseError(err)); }
    finally { setLoading(false); }
  };
  return (
    <div className="nx-auth-root" data-theme={theme}>
      <AssistedTopBar />
      <main className="nx-auth-main register">
        <section className="nx-auth-visual">
          <div className="nx-auth-visual-bg">
            <DarkVeil 
              hueShift={isDark ? 0 : 210} 
              noiseIntensity={0} 
              scanlineIntensity={0} 
              speed={0.35} 
              scanlineFrequency={0} 
              warpAmount={0.2} 
              isDark={isDark} 
            />
          </div>
          <div className="nx-auth-visual-content">
            <div className="nx-auth-kicker">Únete hoy</div>
            <h1 className="nx-auth-title">
              Crea tu cuenta y empieza a <em>vender</em>
            </h1>
            <p className="nx-auth-desc">
              Regístrate con una interfaz alineada al dashboard principal y conserva la misma experiencia visual en toda la aplicación.
            </p>
            <div className="nx-auth-points">
              {[
                ['Registro simple', 'Completa tus datos básicos y continúa en pocos pasos.'],
                ['Base visual unificada', 'El flujo de registro comparte el mismo diseño del resto de la app.'],
                ['Listo para crecer', 'La estructura mantiene la lógica actual sin tocar backend.']
              ].map(([title, text]) => (
                <div key={title} className="nx-auth-point">
                  <div className="nx-auth-point-bullet" />
                  <div><strong>{title}</strong><span>{text}</span></div>
                </div>
              ))}
            </div>
            <div className="nx-auth-mini">
              <div className="nx-auth-mini-card"><strong>100%</strong><span>Compatibilidad con autenticación existente</span></div>
              <div className="nx-auth-mini-card"><strong>Responsive</strong><span>Se adapta a móviles y escritorio</span></div>
            </div>
          </div>
        </section>
        <section className="nx-auth-card-wrap">
          <div className="nx-auth-card">
            <div className="nx-auth-card-tag">Nueva cuenta</div>
            <h2 className="nx-auth-card-title">Crear cuenta</h2>
            <p className="nx-auth-card-sub">Únete al marketplace colombiano.</p>
            <form className="nx-auth-form" onSubmit={handleSubmit}>
              <div className="nx-auth-row">
                <div className="nx-auth-field">
                  <label>Nombre</label>
                  <input type="text" name="nombres" value={form.nombres} onChange={handleChange} required placeholder="Tu nombre" className={`nx-auth-input${error ? ' err' : ''}`} />
                </div>
                <div className="nx-auth-field">
                  <label>Apellido</label>
                  <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} required placeholder="Tu apellido" className={`nx-auth-input${error ? ' err' : ''}`} />
                </div>
              </div>
              <div className="nx-auth-field"><label>Correo electrónico</label><input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="tu@email.com" className={`nx-auth-input${error ? ' err' : ''}`} /></div>
              <div className="nx-auth-field"><label>Contraseña</label><input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} required placeholder="Mínimo 8 caracteres" className={`nx-auth-input${error ? ' err' : ''}`} /></div>
              {error && <div className="nx-auth-alert"><span className="nx-auth-alert-icon">⚠</span><span>{error}</span></div>}
              {success && <div className="nx-auth-alert success"><span className="nx-auth-alert-icon">✓</span><span>{success}</span></div>}
              <button type="submit" className="nx-auth-submit" disabled={loading}>{loading ? 'Creando cuenta…' : 'Crear cuenta'}</button>
            </form>
            <p className="nx-auth-foot">Al registrarte aceptas nuestros Términos y Política de privacidad. ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </section>
      </main>
    </div>
  );
}
export default Register;