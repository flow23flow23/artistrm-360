import React, { useState } from 'react';
import { useTheme } from '@/context/theme-context';

const FloatingZeusButton = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState('');

  const toggleZeus = () => {
    setIsOpen(!isOpen);
    if (isListening) {
      stopListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    // Aquí iría la implementación real de reconocimiento de voz
    // Por ahora simulamos con un timeout
    setTimeout(() => {
      setQuery('¿Cómo van mis streams en Spotify este mes?');
      stopListening();
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Aquí procesaríamos la consulta
      console.log('Procesando consulta:', query);
      // Limpiar después de enviar
      setQuery('');
    }
  };

  return (
    <>
      {/* Botón flotante de Zeus */}
      <button
        onClick={toggleZeus}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          flex items-center justify-center
          ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500'}
          text-white shadow-lg
          hover:${theme === 'dark' ? 'bg-purple-700' : 'bg-purple-600'}
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
        `}
      >
        <span className="material-icons text-2xl">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </button>

      {/* Panel de Zeus */}
      {isOpen && (
        <div className={`
          fixed bottom-24 right-6 z-50
          w-80 md:w-96 rounded-lg shadow-xl
          ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
          border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          overflow-hidden
          transition-all duration-300 ease-in-out
        `}>
          {/* Cabecera */}
          <div className={`
            p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-100'}
            border-b ${theme === 'dark' ? 'border-gray-600' : 'border-purple-200'}
            flex items-center
          `}>
            <div className={`
              w-10 h-10 rounded-full
              ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500'}
              flex items-center justify-center
              text-white mr-3
            `}>
              <span className="material-icons">smart_toy</span>
            </div>
            <div>
              <h3 className="font-medium">Zeus IA</h3>
              <p className="text-sm text-gray-400">Tu asistente inteligente</p>
            </div>
          </div>

          {/* Área de chat (simplificada) */}
          <div className="h-80 overflow-y-auto p-4">
            {/* Mensaje de bienvenida */}
            <div className="flex mb-4">
              <div className={`
                w-8 h-8 rounded-full
                ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500'}
                flex items-center justify-center
                text-white mr-2 flex-shrink-0
              `}>
                <span className="material-icons text-sm">smart_toy</span>
              </div>
              <div className={`
                max-w-xs rounded-lg p-3
                ${theme === 'dark' ? 'bg-gray-700' : 'bg-purple-100'}
              `}>
                <p>Hola, soy Zeus. ¿En qué puedo ayudarte hoy?</p>
              </div>
            </div>

            {/* Sugerencias */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Sugerencias:</p>
              <div className="flex flex-wrap gap-2">
                <button className={`
                  text-sm px-3 py-1 rounded-full
                  ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                  transition-colors
                `}>
                  Analizar streams
                </button>
                <button className={`
                  text-sm px-3 py-1 rounded-full
                  ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                  transition-colors
                `}>
                  Próximos eventos
                </button>
                <button className={`
                  text-sm px-3 py-1 rounded-full
                  ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                  transition-colors
                `}>
                  Resumen financiero
                </button>
              </div>
            </div>
          </div>

          {/* Formulario de entrada */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pregunta a Zeus..."
              className={`
                flex-grow px-4 py-2 rounded-l-full
                ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}
                focus:outline-none
              `}
              disabled={isListening}
            />
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`
                p-2 ${isListening ? 'bg-red-500' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}
                hover:${isListening ? 'bg-red-600' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                focus:outline-none
              `}
            >
              <span className="material-icons">
                {isListening ? 'mic' : 'mic_none'}
              </span>
            </button>
            <button
              type="submit"
              className={`
                p-2 rounded-r-full
                ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500'}
                text-white
                hover:${theme === 'dark' ? 'bg-purple-700' : 'bg-purple-600'}
                focus:outline-none
              `}
              disabled={!query.trim() || isListening}
            >
              <span className="material-icons">send</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingZeusButton;
