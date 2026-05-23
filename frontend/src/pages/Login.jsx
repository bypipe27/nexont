import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';
import AssistedTopBar from '../components/assisted/AssistedTopBar';
import DarkVeil from '../components/animations/DarkVeil';
import { ensureAuthStyles } from '../components/auth/authStyles';

ensureAuthStyles();

const parseError = err => { const d = err.response?.data; if (!d) return 'Error de conexión. Verifica tu internet.'; if (d.details?.length) return d.details.join(' · '); return d.error || 'Credenciales inválidas.'; };

function Login() {
  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
    <div className="nx-auth-root" data-theme={theme}>
      <AssistedTopBar />
      <main className="nx-auth-main login">
        <section className="nx-auth-visual">
          <div className="nx-auth-visual-bg">
            <DarkVeil 
              hueShift={isDark ? 0 : 210} 
              noiseIntensity={0} 
              scanlineIntensity={0} 
              speed={0.35} 
              scanlineFrequency={0} 
              warpAmount={0.18} 
              isDark={isDark} 
            />
          </div>
          <div className="nx-auth-visual-content">
            <div className="nx-auth-kicker">Marketplace colombiano</div>
            <h1 className="nx-auth-title">
              Bienvenido de vuelta a <em>Nexont</em>
            </h1>
            <p className="nx-auth-desc">
              Accede a tu cuenta para continuar con una experiencia visual consistente, rápida y alineada con el nuevo lenguaje de la aplicación.
            </p>
            <div className="nx-auth-points">
              {[
                ['Diseño unificado', 'La autenticación usa el mismo sistema visual del dashboard principal.'],
                ['Interfaz responsive', 'La experiencia se adapta sin perder jerarquía ni claridad.'],
                ['Acceso seguro', 'La lógica de autenticación se mantiene intacta.']
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
            <div className="nx-auth-card-tag">Acceso</div>
            <h2 className="nx-auth-card-title">Iniciar sesión</h2>
            <p className="nx-auth-card-sub">Ingresa tus credenciales para continuar.</p>
            <form className="nx-auth-form" onSubmit={handleSubmit}>
              <div className="nx-auth-field">
                <label>Correo electrónico</label>
                <input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="tu@email.com" className={`nx-auth-input${error ? ' err' : ''}`} />
              </div>
              <div className="nx-auth-field">
                <label>Contraseña</label>
                <input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} required placeholder="••••••••" className={`nx-auth-input${error ? ' err' : ''}`} />
              </div>
              {error && <div className="nx-auth-alert"><span className="nx-auth-alert-icon">⚠</span><span>{error}</span></div>}
              <button type="submit" className="nx-auth-submit" disabled={loading}>{loading ? 'Verificando…' : 'Iniciar sesión'}</button>
            </form>
            <p className="nx-auth-foot">¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link></p>
          </div>
        </section>
      </main>
    </div>
  );
}
export default Login;