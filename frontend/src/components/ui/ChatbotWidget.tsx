import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/api.service';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      sender: 'bot',
      text: '¡Hola! 👋 Soy Nawi-Bot, tu asistente clínico inteligente. ¿En qué sección del sistema o flujo médico te gustaría que te guíe hoy? (Prueba preguntándome sobre Citas, Pacientes o Recetas).',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Mapear historial para la API
      const history = messages
        .filter((m) => m.id !== 'init-msg') // Evitar el inicial de bienvenida en el historial si es necesario
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          message: m.text,
        }));

      // Llamar al endpoint del backend
      const result = await apiService.create<{ respuesta: string }>('chatbot/chat', {
        mensaje: userMessage.text,
        history,
      });

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: result.respuesta || 'No he podido obtener una respuesta clara.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Error al comunicarse con el chatbot:', err);
      const errorMessage: Message = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: 'Disculpa, ha ocurrido un error al procesar tu pregunta. Por favor, inténtalo de nuevo más tarde.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convertir texto markdown simple a HTML básico (negritas y saltos de línea)
  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Reemplazar **negrita**
      const formattedLine = line.split('**').map((part, i) => {
        return i % 2 === 1 ? <strong key={i}>{part}</strong> : part;
      });
      return (
        <span key={idx}>
          {formattedLine}
          <br />
        </span>
      );
    });
  };

  return (
    <>
      <style>{`
        /* --- ESTILOS DEL CHATBOT --- */
        .nawi-chat-trigger {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0c3c60 0%, #157ac1 100%);
          box-shadow: 0 4px 16px rgba(12, 60, 96, 0.3);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .nawi-chat-trigger:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(12, 60, 96, 0.4);
        }

        .nawi-chat-trigger:active {
          transform: scale(0.95);
        }

        .nawi-chat-container {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 380px;
          height: 500px;
          max-height: calc(100vh - 120px);
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform: scale(0.9) translateY(20px);
          opacity: 0;
          pointer-events: none;
        }

        .nawi-chat-container.open {
          transform: scale(1) translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .nawi-chat-header {
          padding: 16px;
          background: linear-gradient(135deg, #0c3c60 0%, #157ac1 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nawi-chat-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nawi-chat-header-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .nawi-chat-header-title h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
        }

        .nawi-chat-header-title span {
          font-size: 11px;
          opacity: 0.8;
          display: block;
        }

        .nawi-chat-close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .nawi-chat-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .nawi-chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nawi-message-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13.5px;
          line-height: 1.45;
          word-break: break-word;
        }

        .nawi-message-bubble.bot {
          align-self: flex-start;
          background-color: #ffffff;
          color: #1e293b;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .nawi-message-bubble.user {
          align-self: flex-end;
          background-color: #0c3c60;
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 2px 4px rgba(12, 60, 96, 0.15);
        }

        .nawi-chat-loading {
          align-self: flex-start;
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: #ffffff;
          border-radius: 12px;
          border-bottom-left-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .nawi-dot {
          width: 8px;
          height: 8px;
          background-color: #94a3b8;
          border-radius: 50%;
          animation: nawiBounce 1.4s infinite ease-in-out both;
        }

        .nawi-dot:nth-child(1) { animation-delay: -0.32s; }
        .nawi-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes nawiBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .nawi-chat-footer {
          padding: 12px;
          background: white;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        .nawi-chat-form {
          display: flex;
          gap: 8px;
        }

        .nawi-chat-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.2s;
        }

        .nawi-chat-input:focus {
          border-color: #0c3c60;
        }

        .nawi-chat-send-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: #0c3c60;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, transform 0.1s;
        }

        .nawi-chat-send-btn:hover {
          background-color: #157ac1;
        }

        .nawi-chat-send-btn:active {
          transform: scale(0.95);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .nawi-chat-container {
            bottom: 0;
            right: 0;
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
        }
      `}</style>

      {/* Botón flotante para abrir chat */}
      <button 
        className="nawi-chat-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        title="Asistente Nawi"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '26px', height: '26px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Contenedor del Chat */}
      <div className={`nawi-chat-container ${isOpen ? 'open' : ''}`}>
        <div className="nawi-chat-header">
          <div className="nawi-chat-header-info">
            <div className="nawi-chat-header-avatar">N</div>
            <div className="nawi-chat-header-title">
              <h3>Asistente Nawi-Bot</h3>
              <span>Online • Soporte Clínico</span>
            </div>
          </div>
          <button className="nawi-chat-close-btn" onClick={() => setIsOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="nawi-chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`nawi-message-bubble ${msg.sender}`}>
              {formatText(msg.text)}
            </div>
          ))}
          {isLoading && (
            <div className="nawi-chat-loading">
              <div className="nawi-dot"></div>
              <div className="nawi-dot"></div>
              <div className="nawi-dot"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="nawi-chat-footer">
          <form onSubmit={handleSend} className="nawi-chat-form">
            <input
              type="text"
              className="nawi-chat-input"
              placeholder="Escribe tu mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="nawi-chat-send-btn" disabled={isLoading || !inputValue.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '18px', height: '18px', transform: 'rotate(-45deg)', marginRight: '-2px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
