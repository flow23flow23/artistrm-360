import React, { useState } from 'react';
import { FiMessageCircle, FiX } from 'react-icons/fi';

interface ZeusAssistantProps {
  isOpen: boolean;
  toggleZeus: () => void;
}

const ZeusAssistant: React.FC<ZeusAssistantProps> = ({ isOpen, toggleZeus }) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    { role: 'assistant', content: '¡Hola! Soy Zeus, tu asistente IA. ¿En qué puedo ayudarte hoy?' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to conversation
    const newConversation = [
      ...conversation,
      { role: 'user', content: message }
    ];
    setConversation(newConversation);
    setMessage('');

    // Simulate AI response (in a real app, this would call the Gemini API)
    setTimeout(() => {
      let response;
      const userMessage = message.toLowerCase();
      
      if (userMessage.includes('proyecto') || userMessage.includes('crear')) {
        response = 'Puedo ayudarte a crear un nuevo proyecto. Ve a la sección de Proyectos y haz clic en "Nuevo Proyecto" para comenzar.';
      } else if (userMessage.includes('analytic') || userMessage.includes('estadística')) {
        response = 'Tus estadísticas muestran un aumento del 15% en reproducciones este mes. ¿Quieres ver el informe completo?';
      } else if (userMessage.includes('spotify') || userMessage.includes('integración')) {
        response = 'La integración con Spotify está activa. Tus últimas 5 canciones han acumulado 12,500 reproducciones en la última semana.';
      } else if (userMessage.includes('ayuda') || userMessage.includes('tutorial')) {
        response = 'Puedo mostrarte tutoriales sobre cualquier función de Artist RM. ¿Sobre qué área necesitas ayuda específicamente?';
      } else {
        response = 'Entiendo. ¿Hay algo específico en lo que pueda ayudarte con tu gestión artística hoy?';
      }

      setConversation([
        ...newConversation,
        { role: 'assistant', content: response }
      ]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="zeus-panel animate-slide-in-right">
      <div className="zeus-header">
        <h3 className="text-lg font-medium">Zeus IA</h3>
        <button onClick={toggleZeus} className="text-white hover:text-gray-200">
          <FiX className="h-5 w-5" />
        </button>
      </div>
      
      <div className="zeus-messages">
        {conversation.map((msg, index) => (
          <div 
            key={index} 
            className={msg.role === 'user' ? 'zeus-message-user' : 'zeus-message-assistant'}
          >
            {msg.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSendMessage} className="zeus-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300"
        />
        <button 
          type="submit"
          className="ml-2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <FiMessageCircle className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ZeusAssistant;
