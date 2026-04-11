import React, { useState, useRef, useEffect } from 'react';


// Obtiene usuario_id y nombres desde el objeto 'user' en localStorage (como en Home.jsx)
const getUserContextAndRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.id) {
    const contexto = { usuario_id: user.id, nombres: user.nombres };
    const rol = user.esVendedorVerificado ? 'vendedor' : 'comprador';
    return { contexto, rol };
  }
  return { contexto: {}, rol: 'comprador' };
};

const ChatWidget = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const url = '/chat';
      console.log('[ChatWidget] Enviando petición a:', url);
      const { contexto, rol } = getUserContextAndRole();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: input, rol, historial: messages, contexto }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { role: 'assistant', content: data.respuesta || 'Error de respuesta.' }]);
    } catch {
      setMessages((msgs) => [...msgs, { role: 'assistant', content: 'Hubo un error al conectar con el chat.' }]);
    }
    setLoading(false);
  };

  // Estilos en línea
  const styles = {
    widget: {
      position: 'fixed', bottom: 24, right: 24, width: 340, maxHeight: 480,
      background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      display: 'flex', flexDirection: 'column', zIndex: 1000, fontFamily: 'inherit',
    },
    header: {
      background: '#2d6cdf', color: '#fff', padding: '12px 16px', borderRadius: '16px 16px 0 0',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600,
    },
    closeBtn: {
      background: 'none', border: 'none', color: '#fff', fontSize: '1.3em', cursor: 'pointer',
    },
    messages: {
      flex: 1, overflowY: 'auto', padding: 16, background: '#f7f8fa',
      display: 'flex', flexDirection: 'column',
    },
    msg: {
      marginBottom: 10, padding: '8px 12px', borderRadius: 12, maxWidth: '80%', wordBreak: 'break-word',
    },
    user: {
      background: '#e3e8f7', alignSelf: 'flex-end', marginLeft: 'auto',
    },
    assistant: {
      background: '#eaf6ff', alignSelf: 'flex-start', marginRight: 'auto',
    },
    inputWrap: {
      display: 'flex', borderTop: '1px solid #e0e0e0', padding: 10, background: '#fff', borderRadius: '0 0 16px 16px',
    },
    input: {
      flex: 1, border: 'none', outline: 'none', padding: '8px 12px', borderRadius: 8, fontSize: '1em', background: '#f2f4f8', marginRight: 8,
    },
    sendBtn: {
      background: '#2d6cdf', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '1em', cursor: 'pointer', transition: 'background 0.2s',
      ...(loading || !input.trim() ? { background: '#b3c6e6', cursor: 'not-allowed' } : {}),
    },
  };

  return (
    <div style={styles.widget}>
      <div style={styles.header}>
        <span>Cardel - Chat</span>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
      </div>
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{ ...styles.msg, ...(msg.role === 'user' ? styles.user : styles.assistant) }}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form style={styles.inputWrap} onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={loading}
          style={styles.input}
        />
        <button type="submit" style={styles.sendBtn} disabled={loading || !input.trim()}>Enviar</button>
      </form>
    </div>
  );
};

export default ChatWidget;
