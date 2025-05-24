import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

const ZeusPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchArtists = async () => {
      if (!user) return;
      
      const db = getFirestore();
      const artistsRef = collection(db, 'artists');
      const artistsQuery = query(
        artistsRef,
        where('managerId', '==', user.uid),
        orderBy('name')
      );
      
      try {
        const querySnapshot = await getDocs(artistsQuery);
        const artistsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArtists(artistsList);
        
        if (artistsList.length > 0 && !selectedArtist) {
          setSelectedArtist(artistsList[0].id);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };
    
    fetchArtists();
  }, [user, selectedArtist]);

  // Simulación de mensajes iniciales
  useEffect(() => {
    if (user && !messages.length) {
      setMessages([
        {
          id: 1,
          sender: 'zeus',
          text: '¡Hola! Soy Zeus, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [user, messages.length]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsProcessing(true);
    
    // Simulación de respuesta del asistente Zeus
    setTimeout(() => {
      const zeusResponse = generateZeusResponse(userMessage.text);
      setMessages(prev => [...prev, zeusResponse]);
      setIsProcessing(false);
    }, 1500);
  };

  const generateZeusResponse = (userText) => {
    const lowerText = userText.toLowerCase();
    let response = '';
    
    if (lowerText.includes('analítica') || lowerText.includes('estadística') || lowerText.includes('datos')) {
      response = 'Basado en los datos de las últimas semanas, he detectado un aumento del 15% en las reproducciones en Spotify. Te recomendaría aumentar la inversión en promoción en esta plataforma para maximizar el crecimiento.';
    } else if (lowerText.includes('calendario') || lowerText.includes('agenda') || lowerText.includes('evento')) {
      response = 'Tienes 3 eventos importantes programados para la próxima semana: una entrevista en Radio Nacional el martes, una sesión de fotos el jueves y una reunión con la discográfica el viernes.';
    } else if (lowerText.includes('tendencia') || lowerText.includes('popular')) {
      response = 'Las tendencias actuales muestran un aumento en la popularidad de colaboraciones entre géneros. Podría ser un buen momento para explorar una colaboración con artistas de géneros complementarios.';
    } else if (lowerText.includes('redes') || lowerText.includes('social') || lowerText.includes('instagram') || lowerText.includes('tiktok')) {
      response = 'El contenido en TikTok está generando un 23% más de engagement que en otras plataformas. Recomendaría aumentar la frecuencia de publicación allí y explorar colaboraciones con creadores populares.';
    } else if (lowerText.includes('ingreso') || lowerText.includes('finanza') || lowerText.includes('dinero')) {
      response = 'Los ingresos por streaming han aumentado un 18% este trimestre. La mayor parte proviene de Spotify (45%), seguido por Apple Music (30%) y YouTube Music (15%).';
    } else if (lowerText.includes('fan') || lowerText.includes('audiencia') || lowerText.includes('público')) {
      response = 'Tu audiencia ha crecido un 12% en el último mes. El grupo demográfico principal sigue siendo jóvenes de 18-24 años (35%), seguido por el grupo de 25-34 años (28%).';
    } else if (lowerText.includes('idea') || lowerText.includes('creativo') || lowerText.includes('inspiración')) {
      response = 'Basado en las tendencias actuales y el perfil de tu audiencia, podrías considerar crear contenido que muestre el proceso creativo detrás de tus canciones. Este tipo de contenido está generando alto engagement en artistas similares.';
    } else if (lowerText.includes('competencia') || lowerText.includes('similar') || lowerText.includes('comparar')) {
      response = 'He analizado artistas similares en tu género y he detectado que aquellos con mayor crecimiento están publicando contenido consistente en TikTok y realizando sesiones en vivo mensuales con sus fans.';
    } else if (lowerText.includes('gracias') || lowerText.includes('genial') || lowerText.includes('excelente')) {
      response = '¡Es un placer ayudarte! Si necesitas cualquier otra información o análisis, no dudes en preguntarme.';
    } else {
      response = 'Entiendo tu consulta. Permíteme analizar la información disponible para ofrecerte la mejor recomendación. ¿Hay algún aspecto específico sobre el que necesites más detalles?';
    }
    
    return {
      id: Date.now(),
      sender: 'zeus',
      text: response,
      timestamp: new Date().toISOString()
    };
  };

  const startListening = () => {
    setIsListening(true);
    
    // Simulación de reconocimiento de voz
    setTimeout(() => {
      setIsListening(false);
      setMessage('¿Cuáles son las tendencias actuales en mi género musical?');
    }, 2000);
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4 md:mb-0">Zeus - Asistente Inteligente</h1>
          
          <select
            className="bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
          >
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de chat */}
          <div className="lg:col-span-2 bg-card rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
            <div className="p-4 bg-primary/10 border-b border-border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-lg font-bold">Z</span>
                </div>
                <div>
                  <h3 className="font-bold">Zeus</h3>
                  <p className="text-sm text-muted-foreground">Asistente IA multiagente</p>
                </div>
                <div className="ml-auto flex space-x-2">
                  <button className="p-2 rounded-full hover:bg-background/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full hover:bg-background/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-muted">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-border">
              <div className="flex items-center">
                <button
                  onClick={startListening}
                  className={`p-3 rounded-full mr-2 ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-primary/10 hover:bg-primary/20'
                  }`}
                  disabled={isListening}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe tu mensaje o haz una pregunta..."
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isListening}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isListening}
                  className="p-3 rounded-full ml-2 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Panel de capacidades */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Capacidades de Zeus</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Análisis de Datos</h4>
                    <p className="text-sm text-muted-foreground">Analiza tendencias, métricas y KPIs para ofrecer insights accionables.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Gestión de Calendario</h4>
                    <p className="text-sm text-muted-foreground">Recuerda eventos, programa actividades y optimiza tu agenda.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Monitoreo de Redes Sociales</h4>
                    <p className="text-sm text-muted-foreground">Analiza el rendimiento en plataformas digitales y sugiere estrategias.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Asistencia Creativa</h4>
                    <p className="text-sm text-muted-foreground">Proporciona ideas, referencias y tendencias para impulsar la creatividad.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold">Análisis Competitivo</h4>
                    <p className="text-sm text-muted-foreground">Compara tu rendimiento con artistas similares e identifica oportunidades.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Comandos Rápidos</h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setMessage('¿Cuáles son mis estadísticas de esta semana?')}
                  className="text-left px-4 py-2 rounded-lg bg-background hover:bg-primary/10 transition-colors"
                >
                  📊 Estadísticas semanales
                </button>
                <button
                  onClick={() => setMessage('¿Cuáles son las tendencias actuales en mi género?')}
                  className="text-left px-4 py-2 rounded-lg bg-background hover:bg-primary/10 transition-colors"
                >
                  📈 Tendencias actuales
                </button>
                <button
                  onClick={() => setMessage('¿Cómo está funcionando mi contenido en redes sociales?')}
                  className="text-left px-4 py-2 rounded-lg bg-background hover:bg-primary/10 transition-colors"
                >
                  📱 Rendimiento en redes
                </button>
                <button
                  onClick={() => setMessage('¿Cuáles son mis próximos eventos?')}
                  className="text-left px-4 py-2 rounded-lg bg-background hover:bg-primary/10 transition-colors"
                >
                  📅 Próximos eventos
                </button>
                <button
                  onClick={() => setMessage('Dame ideas para mi próximo lanzamiento')}
                  className="text-left px-4 py-2 rounded-lg bg-background hover:bg-primary/10 transition-colors"
                >
                  💡 Ideas creativas
                </button>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Integraciones Activas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <span>Spotify</span>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Conectado</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#FF0000] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">Y</span>
                    </div>
                    <span>YouTube</span>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Conectado</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#C13584] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">I</span>
                    </div>
                    <span>Instagram</span>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Conectado</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <span>TikTok</span>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Conectado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botón flotante de Zeus */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={startListening}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-primary'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </Layout>
  );
};

export default ZeusPage;
