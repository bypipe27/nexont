import { useState, useEffect } from 'react';

function HelpCenter() {
  const [open, setOpen] = useState(false);

  const panelStyle = {
    position: 'relative',
    width: 'min(960px,95%)',
    maxHeight: '85vh',
    overflow: 'auto',
    background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
    borderRadius: 18,
    padding: 24,
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.22)',
    border: '1px solid rgba(148, 163, 184, 0.28)',
  };

  const titleStyle = {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.2,
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  };

  const sectionStyle = {
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    background: '#f8fafc',
    border: '1px solid rgba(148, 163, 184, 0.18)',
  };

  const sectionTitleStyle = {
    margin: '0 0 10px',
    fontSize: 16,
    lineHeight: 1.3,
    fontWeight: 700,
    color: '#1e293b',
  };

  const textStyle = {
    margin: 0,
    color: '#334155',
    lineHeight: 1.65,
  };

  const faqItemStyle = {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    background: '#ffffff',
    border: '1px solid rgba(226, 232, 240, 1)',
  };

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Centro de ayuda"
        title="Ayuda"
        style={{
          position: 'fixed', bottom: 112, right: 32, zIndex: 1000,
          background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '50%', width: 56, height: 56,
          boxShadow: '0 12px 30px rgba(2, 132, 199, 0.35)',
          fontSize: 24, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease'
        }}
      >
        ?
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Centro de ayuda"
          style={{
            position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', backdropFilter: 'blur(6px)'
          }}
        >
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.46)' }}
          />

          <div style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 10px', borderRadius: 999, background: 'rgba(6, 182, 212, 0.10)', color: '#0f766e', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Soporte interno
                </div>
                <h2 style={titleStyle}>Centro de Ayuda</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                style={{
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: '#fff',
                  color: '#0f172a',
                  fontSize: 18,
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              >
                ✕
              </button>
            </div>

            <section style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Guía básica de uso</h3>
              <ol style={{ margin: 0, paddingLeft: 20, color: '#334155', lineHeight: 1.8 }}>
                <li>Explora el catálogo desde la página principal.</li>
                <li>Usa el carrito para agregar y revisar productos.</li>
                <li>Completa el pago en la sección de carrito con tarjeta.</li>
                <li>Revisa tus órdenes en el apartado "Orders".</li>
              </ol>
            </section>

            <section style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Preguntas frecuentes (FAQ)</h3>
              <dl style={{ margin: 0 }}>
                <div style={faqItemStyle}>
                  <dt style={{ marginBottom: 6 }}><strong style={{ color: '#0f172a' }}>¿Cómo recupero mi contraseña?</strong></dt>
                  <dd style={{ ...textStyle, marginLeft: 0 }}>Ve a la página de login y selecciona "¿Olvidaste tu contraseña?" para recibir instrucciones por correo.</dd>
                </div>

                <div style={faqItemStyle}>
                  <dt style={{ marginBottom: 6 }}><strong style={{ color: '#0f172a' }}>¿Puedo vender aquí?</strong></dt>
                  <dd style={{ ...textStyle, marginLeft: 0 }}>Sí, regístrate y visita "My Products" para publicar y gestionar tus productos.</dd>
                </div>

                <div style={faqItemStyle}>
                  <dt style={{ marginBottom: 6 }}><strong style={{ color: '#0f172a' }}>¿Cómo contacto soporte?</strong></dt>
                  <dd style={{ ...textStyle, marginLeft: 0 }}>Usa el widget de chat (ícono 💬) o envía un correo a soporte@example.com.</dd>
                </div>
              </dl>
            </section>

            <section style={{ ...sectionStyle, marginBottom: 0, background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)' }}>
              <h3 style={sectionTitleStyle}>Accesibilidad</h3>
              <p style={textStyle}>Este centro de ayuda es accesible desde cualquier módulo y puede cerrarse con la tecla <strong>Esc</strong>.</p>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

export default HelpCenter;
