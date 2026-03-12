import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no encontrado.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (err) {
        setStatus('error');

        if (err.response?.data?.error) {
          setMessage(err.response.data.error);
        } else {
          setMessage('El enlace de verificación es inválido o ha expirado.');
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '80px auto',
        padding: '30px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        textAlign: 'center'
      }}
    >
      {status === 'loading' && (
        <>
          <h2>Verificando tu correo...</h2>
          <p>Por favor espera un momento.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <h2 style={{ color: '#28a745' }}>✅ ¡Correo verificado!</h2>
          <p>{message}</p>

          <Link to="/login">
            <button
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Iniciar sesión
            </button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <h2 style={{ color: '#dc3545' }}>❌ Enlace inválido</h2>
          <p>{message}</p>

          <Link to="/register">
            <button
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Volver al registro
            </button>
          </Link>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;
