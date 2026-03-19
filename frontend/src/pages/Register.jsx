import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

function NavBar() {
  return (
    <nav style={{
      background: '#1a1a1a',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      borderBottom: '1px solid #333'
    }}>
      <Link to="/" style={{
        color: 'white',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontWeight: '700',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        transition: 'opacity 0.3s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <img src="/resources/icone.png" alt="Nexont" style={{ height: '32px', width: 'auto' }} />
        <span style={{ fontSize: '1.3rem', margin: 0 }}>Nexont</span>
      </Link>
    </nav>
  );
}

function Register() {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    contrasena: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      setSuccess(response.data.message);
      setFormData({ nombres: '', apellidos: '', correo: '', contrasena: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div style={{
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>Crear cuenta</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', margin: '0 0 1.5rem 0' }}>
            Únete a Nexont hoy
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
                Nombre
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
                Apellido
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                placeholder="Tu apellido"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
                Email
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
                Contraseña
              </label>
              <input
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '1rem'
                }}
              />
            </div>

            {error && (
              <p style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                {error}
              </p>
            )}

            {success && (
              <p style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            color: '#6b7280'
          }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{
              color: '#667eea',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;

