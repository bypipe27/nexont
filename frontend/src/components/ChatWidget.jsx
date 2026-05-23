import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';

// Obtiene usuario_id y nombres desde el objeto 'user' en localStorage
const getUserContextAndRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user && user.id) {
    const contexto = { usuario_id: user.id, nombres: user.nombres };
    const rol = user.esVendedorVerificado ? 'vendedor' : 'comprador';
    return { contexto, rol };
  }
  return { contexto: {}, rol: 'comprador' };
};

const ChatWidget = ({ onClose, initialInput = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chatbotUrl = import.meta.env.VITE_CHATBOT_URL || '/chat';

  // Cargar mensajes iniciales desde localStorage o usar el saludo por defecto
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('nexont_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: '¡Hola! Soy Cardel, tu asistente de Nexont. ¿En qué puedo ayudarte hoy?' }
    ];
  });

  const [input, setInput] = useState(initialInput);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Guardar mensajes en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('nexont_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialInput) setInput(initialInput);
  }, [initialInput]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const url = chatbotUrl;
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

  // Estilos en bloque para usar variables de tema
  const STYLES = `
    .cw-root {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 420px;
      height: 600px;
      max-height: 80vh;
      background: var(--cw-surface);
      border: 1px solid var(--cw-border);
      border-radius: 20px;
      box-shadow: 0 12px 48px var(--cw-shadow);
      display: flex;
      flex-direction: column;
      z-index: 2000;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
      animation: cw-slide-up 0.3s ease;
    }
    @keyframes cw-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cw-header {
      background: var(--cw-primary);
      color: var(--cw-primary-contrast);
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cw-header-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cw-title { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
    .cw-close { background: none; border: none; color: inherit; cursor: pointer; font-size: 20px; padding: 4px; display: flex; align-items: center; opacity: 0.8; transition: opacity 0.2s; }
    .cw-close:hover { opacity: 1; }
    
    .cw-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: var(--cw-bg);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .cw-msg {
      padding: 12px 16px;
      border-radius: 16px;
      max-width: 85%;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .cw-msg.user {
      background: var(--cw-primary);
      color: var(--cw-primary-contrast);
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .cw-msg.assistant {
      background: var(--cw-surface);
      color: var(--cw-on-surface);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      border: 1px solid var(--cw-border);
    }
    
    .cw-input-area {
      padding: 16px;
      background: var(--cw-surface);
      border-top: 1px solid var(--cw-border);
      display: flex;
      gap: 10px;
    }
    .cw-input {
      flex: 1;
      background: var(--cw-bg);
      border: 1px solid var(--cw-border);
      border-radius: 12px;
      padding: 10px 14px;
      color: var(--cw-on-surface);
      font-family: inherit;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .cw-input:focus { border-color: var(--cw-primary); box-shadow: 0 0 0 3px var(--cw-focus); }
    .cw-send {
      background: var(--cw-primary);
      color: var(--cw-primary-contrast);
      border: none;
      border-radius: 12px;
      padding: 0 16px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .cw-send:disabled { opacity: 0.5; cursor: not-allowed; }
    
    :root {
      --cw-bg: #f7f9fd;
      --cw-surface: #ffffff;
      --cw-on-surface: #191c1f;
      --cw-border: #e2e4e9;
      --cw-primary: #000000;
      --cw-primary-contrast: #ffffff;
      --cw-shadow: rgba(0, 0, 0, 0.1);
      --cw-focus: rgba(0, 0, 0, 0.05);
    }
    [data-theme='dark'] {
      --cw-bg: #09090b;
      --cw-surface: #18181b;
      --cw-on-surface: #fafafa;
      --cw-border: #27272a;
      --cw-primary: #ffffff;
      --cw-primary-contrast: #09090b;
      --cw-shadow: rgba(0, 0, 0, 0.4);
      --cw-focus: rgba(255, 255, 255, 0.1);
    }
  `;

  return (
    <div className="cw-root">
      <style>{STYLES}</style>
      <div className="cw-header">
        <div className="cw-header-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
          <span className="cw-title">Cardel - Asistente Nexont</span>
        </div>
        <button className="cw-close" onClick={onClose} aria-label="Cerrar chat">×</button>
      </div>
      <div className="cw-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`cw-msg ${msg.role}`}>
            <ReactMarkdown components={{
              p: ({node, ...props}) => <p style={{margin: 0, whiteSpace: 'pre-wrap'}} {...props} />
            }}>
              {msg.content}
            </ReactMarkdown>
          </div>
        ))}
        {loading && <div className="cw-msg assistant">Escribiendo...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form className="cw-input-area" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="¿En qué puedo ayudarte?"
          disabled={loading}
          className="cw-input"
        />
        <button type="submit" className="cw-send" disabled={loading || !input.trim()}>
          {loading ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
