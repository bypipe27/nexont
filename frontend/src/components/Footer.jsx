import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  
  return (
    <footer className="nx-footer" data-theme={theme}>
      <div className="nx-footer-container">
        <div className="nx-footer-grid">
          <div className="nx-footer-brand">
            <h3 className="nx-footer-logo">Nexont</h3>
            <p className="nx-footer-tagline">El marketplace colombiano de nueva generación.</p>
          </div>
          
          <div className="nx-footer-links">
            <div className="nx-footer-col">
              <h4>Plataforma</h4>
              <Link to="/">Inicio</Link>
              <Link to="/products">Productos</Link>
              <Link to="/categories">Categorías</Link>
            </div>
            <div className="nx-footer-col">
              <h4>Cuenta</h4>
              <Link to="/login">Iniciar Sesión</Link>
              <Link to="/register">Registro</Link>
              <Link to="/profile">Mi Perfil</Link>
            </div>
            <div className="nx-footer-col">
              <h4>Soporte</h4>
              <Link to="/help">Centro de Ayuda</Link>
              <Link to="/terms">Términos</Link>
              <Link to="/privacy">Privacidad</Link>
            </div>
          </div>
        </div>
        
        <div className="nx-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Nexont. Todos los derechos reservados.</p>
          <div className="nx-footer-social">
            {/* Aquí irían iconos sociales */}
          </div>
        </div>
      </div>

      <style>{`
        .nx-footer {
          --footer-bg: #ffffff;
          --footer-border: #f1f1f4;
          --footer-text: #71717a;
          --footer-heading: #18181b;
          --footer-link-hover: #7c3aed;
          
          background: var(--footer-bg);
          border-top: 1px solid var(--footer-border);
          padding: 2rem 2rem 1.25rem;
          margin-top: auto;
          transition: all 0.3s ease;
        }

        .nx-footer[data-theme='dark'] {
          --footer-bg: #09090b;
          --footer-border: rgba(255, 255, 255, 0.08);
          --footer-text: #a1a1aa;
          --footer-heading: #f4f4f5;
          --footer-link-hover: #a78bfa;
        }

        .nx-footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .nx-footer-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
          align-items: flex-start;
        }

        .nx-footer-logo {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--footer-heading);
          margin-bottom: 0.4rem;
          letter-spacing: -0.02em;
        }

        .nx-footer-tagline {
          font-size: 0.8rem;
          color: var(--footer-text);
          max-width: 250px;
          line-height: 1.4;
        }

        .nx-footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .nx-footer-col h4 {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--footer-heading);
          margin-bottom: 0.75rem;
        }

        .nx-footer-col a {
          display: block;
          font-size: 0.8rem;
          color: var(--footer-text);
          text-decoration: none;
          margin-bottom: 0.35rem;
          transition: color 0.15s;
        }

        .nx-footer-col a:hover {
          color: var(--footer-link-hover);
        }

        .nx-footer-bottom {
          padding-top: 1.25rem;
          border-top: 1px solid var(--footer-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--footer-text);
        }

        @media (max-width: 768px) {
          .nx-footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .nx-footer-links {
            grid-template-columns: repeat(2, 1fr);
          }
          .nx-footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .nx-footer-links {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
