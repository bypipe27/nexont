import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
        letterSpacing: '0.5px'
      }}>
        <img src="/resources/icone.png" alt="Nexont" style={{ height: '32px', width: 'auto' }} />
        <span style={{ fontSize: '1.3rem', margin: 0 }}>Nexont</span>
      </Link>
    </nav>
  );
}

function Login() {
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {

      const response = await api.post('/auth/login', formData);

      const { token, refreshToken, user } = response.data;


      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/');

    } catch (err) {

      setError(
        err.response?.data?.error ||
        'Error al iniciar sesión. Inténtalo de nuevo.'
      );

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
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>Iniciar sesión</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', margin: '0 0 1.5rem 0' }}>
          Accede a tu cuenta
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
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
              name="password"
              value={formData.password}
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
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: '#6b7280'
        }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{
            color: '#667eea',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Regístrate
          </Link>
        </p>
      </div>
      </div>
    </>
  );
}

export default Login;
