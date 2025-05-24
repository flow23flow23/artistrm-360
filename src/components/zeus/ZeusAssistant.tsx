import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Fab, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Zoom,
  Slide,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Mic as MicIcon, 
  MicOff as MicOffIcon, 
  Close as CloseIcon,
  Send as SendIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Settings as SettingsIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveUI } from '@/hooks/useResponsiveUI';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/utils/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Importar logos de plataformas
import spotifyLogo from '@/assets/logos/spotify.png';
import youtubeLogo from '@/assets/logos/youtube.png';
import instagramLogo from '@/assets/logos/instagram.png';
import tiktokLogo from '@/assets/logos/tiktok.png';
import soundcloudLogo from '@/assets/logos/soundcloud.png';
import appleMusicLogo from '@/assets/logos/apple-music.png';

// Tipos para comandos de voz
interface VoiceCommand {
  id: string;
  name: string;
  description: string;
  examples: string[];
  category: 'analytics' | 'content' | 'projects' | 'artists' | 'general' | 'integrations';
  icon: React.ReactNode;
}

// Tipos para historial de conversación
interface ConversationMessage {
  id: string;
  text: string;
  sender: 'user' | 'zeus';
  timestamp: Date;
  isProcessing?: boolean;
  relatedData?: any;
}

/**
 * Componente Zeus - Asistente inteligente con capacidades de voz y NLP
 */
const Zeus: React.FC = () => {
  const theme = useTheme();
  const { isMobile, isTablet, responsiveValue } = useResponsiveUI();
  const { user } = useAuth();
  
  // Estados para el asistente
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [availableCommands, setAvailableCommands] = useState<VoiceCommand[]>([]);
  const [userPreferences, setUserPreferences] = useState<any>({
    voiceEnabled: true,
    voiceVolume: 0.8,
    voiceRate: 1.0,
    voicePitch: 1.0,
    preferredLanguage: 'es-ES',
    showSuggestions: true,
    darkTheme: true,
    autoOpen: false
  });
  
  // Referencias
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  
  // Cargar preferencias del usuario
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user) return;
      
      try {
        const prefsDoc = await getDoc(doc(db, 'user_preferences', user.uid));
        if (prefsDoc.exists()) {
          const prefs = prefsDoc.data();
          if (prefs.zeus) {
            setUserPreferences(prev => ({
              ...prev,
              ...prefs.zeus
            }));
          }
        }
      } catch (error) {
        console.error('Error al cargar preferencias de Zeus:', error);
      }
    };
    
    loadUserPreferences();
  }, [user]);
  
  // Cargar comandos disponibles
  useEffect(() => {
    const loadAvailableCommands = async () => {
      if (!user) return;
      
      // En una implementación real, estos comandos vendrían de Firestore
      // Simulamos datos para la demostración
      const commands: VoiceCommand[] = [
        {
          id: 'cmd_analytics_summary',
          name: 'Resumen de Analytics',
          description: 'Obtén un resumen de las métricas clave de todas las plataformas',
          examples: ['Muéstrame un resumen de analytics', 'Dame las métricas principales'],
          category: 'analytics',
          icon: <img src={spotifyLogo} alt="Spotify" width={24} height={24} />
        },
        {
          id: 'cmd_platform_stats',
          name: 'Estadísticas por Plataforma',
          description: 'Consulta métricas específicas de una plataforma',
          examples: ['Estadísticas de Spotify del último mes', 'Métricas de YouTube de esta semana'],
          category: 'analytics',
          icon: <img src={youtubeLogo} alt="YouTube" width={24} height={24} />
        },
        {
          id: 'cmd_content_schedule',
          name: 'Programación de Contenido',
          description: 'Gestiona la programación de publicaciones',
          examples: ['Programa un post para Instagram mañana', 'Muestra mi calendario de contenido'],
          category: 'content',
          icon: <img src={instagramLogo} alt="Instagram" width={24} height={24} />
        },
        {
          id: 'cmd_project_status',
          name: 'Estado de Proyectos',
          description: 'Consulta el estado de proyectos activos',
          examples: ['Estado del proyecto Lanzamiento Álbum', 'Actualiza el estado de la gira'],
          category: 'projects',
          icon: <PsychologyIcon />
        },
        {
          id: 'cmd_artist_info',
          name: 'Información de Artistas',
          description: 'Obtén datos sobre artistas gestionados',
          examples: ['Información del artista Luna Azul', 'Muestra el perfil de Carlos Mendoza'],
          category: 'artists',
          icon: <PsychologyIcon />
        }
      ];
      
      setAvailableCommands(commands);
    };
    
    loadAvailableCommands();
  }, [user]);
  
  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = userPreferences.preferredLanguage;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setTranscript(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    } else {
      console.warn('El reconocimiento de voz no está soportado en este navegador');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, userPreferences.preferredLanguage]);
  
  // Inicializar síntesis de voz
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
      speechSynthesisRef.current.lang = userPreferences.preferredLanguage;
      speechSynthesisRef.current.volume = userPreferences.voiceVolume;
      speechSynthesisRef.current.rate = userPreferences.voiceRate;
      speechSynthesisRef.current.pitch = userPreferences.voicePitch;
    } else {
      console.warn('La síntesis de voz no está soportada en este navegador');
    }
  }, [userPreferences]);
  
  // Desplazar al final de la conversación cuando hay nuevos mensajes
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);
  
  // Función para iniciar/detener escucha
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      
      // Si hay texto transcrito, procesarlo
      if (transcript.trim()) {
        processCommand(transcript);
      }
    } else {
      setTranscript('');
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      setIsListening(true);
    }
  };
  
  // Función para procesar comandos
  const processCommand = async (command: string) => {
    if (!command.trim()) return;
    
    // Añadir mensaje del usuario a la conversación
    const userMessageId = `msg_${Date.now()}`;
    const userMessage: ConversationMessage = {
      id: userMessageId,
      text: command,
      sender: 'user',
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setTranscript('');
    setIsProcessing(true);
    
    // Guardar mensaje en Firestore
    if (user) {
      try {
        await setDoc(doc(db, 'zeus_conversations', `${user.uid}_${userMessageId}`), {
          userId: user.uid,
          messageId: userMessageId,
          text: command,
          sender: 'user',
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error('Error al guardar mensaje de usuario:', error);
      }
    }
    
    // Simular procesamiento de IA
    setTimeout(async () => {
      // En una implementación real, esto sería una llamada a Cloud Functions o Vertex AI
      let zeusResponse = '';
      
      if (command.toLowerCase().includes('estadística') || command.toLowerCase().includes('métrica')) {
        zeusResponse = 'Aquí tienes las estadísticas solicitadas. En el último mes, tus streams en Spotify han aumentado un 15%, con 45,000 reproducciones totales. Tu canción más popular ha sido "Amanecer" con 12,500 reproducciones.';
      } else if (command.toLowerCase().includes('proyecto') || command.toLowerCase().includes('lanzamiento')) {
        zeusResponse = 'El proyecto "Lanzamiento Álbum Renacimiento" está al 75% de completitud. Las tareas pendientes son: finalizar diseño de portada, aprobar mezcla final de 2 canciones y coordinar campaña de marketing digital.';
      } else if (command.toLowerCase().includes('programa') || command.toLowerCase().includes('calendario')) {
        zeusResponse = 'He programado el contenido para Instagram. Se publicará mañana a las 18:00h. También te recuerdo que tienes 3 publicaciones más programadas esta semana: 2 para TikTok y 1 para YouTube.';
      } else if (command.toLowerCase().includes('artista') || command.toLowerCase().includes('perfil')) {
        zeusResponse = 'El perfil del artista Luna Azul muestra un crecimiento del 23% en seguidores este mes. Sus plataformas más fuertes son Instagram (15K) y Spotify (8K). Recomiendo enfocar esfuerzos en TikTok, donde el crecimiento es más lento.';
      } else {
        zeusResponse = 'Entiendo tu solicitud. ¿Puedes proporcionar más detalles para ayudarte mejor? Puedo asistirte con estadísticas, proyectos, programación de contenido o información de artistas.';
      }
      
      // Añadir respuesta de Zeus a la conversación
      const zeusMessageId = `msg_${Date.now()}`;
      const zeusMessage: ConversationMessage = {
        id: zeusMessageId,
        text: zeusResponse,
        sender: 'zeus',
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, zeusMessage]);
      setResponse(zeusResponse);
      setIsProcessing(false);
      
      // Guardar respuesta en Firestore
      if (user) {
        try {
          await setDoc(doc(db, 'zeus_conversations', `${user.uid}_${zeusMessageId}`), {
            userId: user.uid,
            messageId: zeusMessageId,
            text: zeusResponse,
            sender: 'zeus',
            timestamp: serverTimestamp(),
            relatedToMessage: userMessageId
          });
        } catch (error) {
          console.error('Error al guardar respuesta de Zeus:', error);
        }
      }
      
      // Reproducir respuesta por voz si está habilitado
      if (userPreferences.voiceEnabled && !isMuted && speechSynthesisRef.current) {
        speechSynthesisRef.current.text = zeusResponse;
        window.speechSynthesis.speak(speechSynthesisRef.current);
      }
    }, 2000);
  };
  
  // Función para enviar mensaje de texto
  const sendTextMessage = () => {
    if (transcript.trim()) {
      processCommand(transcript);
    }
  };
  
  // Función para limpiar conversación
  const clearConversation = () => {
    setConversation([]);
    setResponse('');
    setTranscript('');
  };
  
  // Función para guardar preferencias
  const savePreferences = async () => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, 'user_preferences', user.uid), {
        zeus: userPreferences,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error al guardar preferencias de Zeus:', error);
    }
  };
  
  // Renderizar mensaje de conversación
  const renderMessage = (message: ConversationMessage) => {
    const isUser = message.sender === 'user';
    
    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 2,
            maxWidth: '80%',
            borderRadius: 2,
            bgcolor: isUser 
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.secondary.main, 0.1),
            border: '1px solid',
            borderColor: isUser 
              ? alpha(theme.palette.primary.main, 0.2)
              : alpha(theme.palette.secondary.main, 0.2)
          }}
        >
          <Typography variant="body1">
            {message.text}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {message.timestamp.toLocaleTimeString()}
          </Typography>
        </Paper>
      </Box>
    );
  };
  
  return (
    <>
      {/* Botón flotante de Zeus */}
      <Zoom in={!isOpen}>
        <Fab
          color="secondary"
          aria-label="Zeus"
          sx={{
            position: 'fixed',
            bottom: responsiveValue(16, 24, 32),
            right: responsiveValue(16, 24, 32),
            background: 'linear-gradient(135deg, #FF0000 0%, #FF0000 100%)',
            boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF0000 30%, #FF3300 100%)',
            }
          }}
          onClick={() => setIsOpen(true)}
        >
          <PsychologyIcon />
        </Fab>
      </Zoom>
      
      {/* Diálogo de Zeus */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background: 'linear-gradient(135deg, #111111 0%, #222222 100%)',
            height: isMobile ? '100%' : '80vh',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'rgba(255, 215, 0, 0.2)',
          background: 'linear-gradient(90deg, rgba(255, 0, 0, 0.1) 0%, rgba(255, 0, 0, 0.05) 100%)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PsychologyIcon sx={{ mr: 1, color: '#FF0000' }} />
            <Typography variant="h6" component="div">
              Zeus, multi agente de IA
            </Typography>
          </Box>
          <Box>
            <Tooltip title={isMuted ? "Activar voz" : "Silenciar"}>
              <IconButton onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Configuración">
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cerrar">
              <IconButton edge="end" onClick={() => setIsOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          {/* Área de conversación */}
          <Box sx={{ 
            flexGrow: 1, 
            overflowY: 'auto',
            mb: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.1),
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1)
          }}>
            {conversation.length === 0 ? (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                textAlign: 'center',
                p: 3
              }}>
                <PsychologyIcon sx={{ fontSize: 60, color: '#FF0000', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  ¡Hola! Soy Zeus, tu asistente inteligente
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mb: 3 }}>
                  Puedo ayudarte con estadísticas, gestión de proyectos, programación de contenido y mucho más. 
                  Prueba a hablarme o escribe tu consulta.
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: responsiveValue('1fr', '1fr 1fr', '1fr 1fr 1fr'),
                  gap: 2,
                  width: '100%',
                  maxWidth: 800
                }}>
                  {availableCommands.slice(0, 6).map(command => (
                    <Paper
                      key={command.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.paper, 0.1),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.2),
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.background.paper, 0.2),
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => processCommand(command.examples[0])}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {command.icon}
                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                          {command.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {command.examples[0]}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            ) : (
              <>
                {conversation.map(renderMessage)}
                {isProcessing && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.secondary.main, 0.2),
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <CircularProgress size={20} sx={{ mr: 2 }} />
                      <Typography variant="body2">Zeus está pensando...</Typography>
                    </Paper>
                  </Box>
                )}
                <div ref={conversationEndRef} />
              </>
            )}
          </Box>
          
          {/* Área de entrada */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 1,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.1),
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.2)
          }}>
            <Box sx={{ flexGrow: 1, mr: 1 }}>
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Escribe o habla a Zeus..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: alpha(theme.palette.background.paper, 0.2),
                  color: theme.palette.text.primary,
                  fontSize: '16px',
                  outline: 'none'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendTextMessage();
                  }
                }}
              />
            </Box>
            
            <Tooltip title={isListening ? "Detener escucha" : "Activar micrófono"}>
              <IconButton 
                color={isListening ? "error" : "primary"}
                onClick={toggleListening}
                sx={{
                  bgcolor: isListening ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                  mr: 1
                }}
              >
                {isListening ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Enviar mensaje">
              <IconButton 
                color="primary"
                onClick={sendTextMessage}
                disabled={!transcript.trim()}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          borderTop: '1px solid',
          borderColor: 'rgba(255, 215, 0, 0.2)',
          p: 2
        }}>
          <Button 
            startIcon={<RefreshIcon />}
            onClick={clearConversation}
            color="inherit"
            sx={{ mr: 'auto' }}
          >
            Nueva conversación
          </Button>
          <Button onClick={() => setIsOpen(false)} color="inherit">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Zeus;
