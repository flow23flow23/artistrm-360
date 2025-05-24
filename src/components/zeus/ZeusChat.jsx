import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db, functions } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Box, TextField, Button, Typography, Paper, CircularProgress, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// Componente principal de chat de Zeus
const ZeusChat = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  
  // Generar ID de sesión único al cargar
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  }, []);
  
  // Escuchar mensajes de la conversación actual
  useEffect(() => {
    if (!user || !sessionId) return;
    
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', user.uid),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.messages && Array.isArray(data.messages)) {
          newMessages.push(...data.messages);
        }
      });
      
      setMessages(newMessages);
      scrollToBottom();
    });
    
    return () => unsubscribe();
  }, [user, sessionId]);
  
  // Función para desplazarse al final del chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Manejar envío de mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || !user || loading) return;
    
    try {
      setLoading(true);
      
      // Llamar a Cloud Function
      const processQuery = httpsCallable(functions, 'processQuery');
      await processQuery({
        query: input,
        sessionId,
        conversationHistory: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });
      
      // Limpiar input (la respuesta llegará por el listener de Firestore)
      setInput('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      // Añadir mensaje de error al chat
      setMessages([
        ...messages,
        {
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '600px' }}>
      {/* Encabezado */}
      <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'primary.dark', color: 'white' }}>
        <Typography variant="h6">Zeus IA - Tu asistente inteligente</Typography>
        <Typography variant="body2">
          Consulta cualquier información sobre tu carrera musical
        </Typography>
      </Paper>
      
      {/* Área de mensajes */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        p: 2, 
        bgcolor: 'background.default',
        borderRadius: 1,
        mb: 2
      }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            opacity: 0.7
          }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              ¡Hola! Soy Zeus, tu asistente de gestión artística.
            </Typography>
            <Typography variant="body2">
              Puedes preguntarme sobre tus estadísticas, próximos eventos o solicitar recomendaciones.
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                mb: 2,
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                  mr: msg.role === 'user' ? 0 : 1,
                  ml: msg.role === 'user' ? 1 : 0,
                }}
              >
                {msg.role === 'user' ? 'U' : 'Z'}
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: msg.role === 'user' ? 'primary.light' : 'background.paper',
                  color: msg.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1">{msg.content}</Typography>
              </Paper>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Formulario de entrada */}
      <Paper 
        component="form" 
        elevation={3} 
        sx={{ p: 1, display: 'flex', alignItems: 'center' }}
        onSubmit={handleSendMessage}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          size="small"
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          type="submit"
          disabled={loading || !input.trim()}
        >
          {loading ? 'Enviando' : 'Enviar'}
        </Button>
      </Paper>
    </Box>
  );
};

export default ZeusChat;
