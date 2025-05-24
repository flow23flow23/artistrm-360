# Integración de OCR y Capacidades Avanzadas de IA - ArtistRM

Este documento detalla la implementación de las nuevas capacidades solicitadas para la plataforma ArtistRM, incluyendo OCR para procesamiento de documentos, integración con Gemini para asistencia IA avanzada, y funcionalidades de manos.im para indexación y búsqueda de contenido multimedia.

## 1. Procesamiento OCR de Documentos

### Arquitectura

La funcionalidad OCR se implementará como un servicio independiente dentro de la plataforma ArtistRM, utilizando la API de manos.im para el procesamiento de documentos. La arquitectura incluirá:

- **Frontend**: Componente de carga y visualización de documentos
- **Backend**: Cloud Functions para procesamiento y almacenamiento
- **Almacenamiento**: Firebase Storage para documentos originales y procesados
- **Base de datos**: Firestore para metadatos y resultados de OCR

### Implementación Backend

```typescript
// /functions/src/ocr/documents.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket();

// Procesar documento con OCR
export const processDocument = functions.storage
  .object()
  .onFinalize(async (object) => {
    // Verificar si es un documento que debe procesarse
    const filePath = object.name;
    if (!filePath.startsWith('documents/') || object.contentType.indexOf('application/') === -1) {
      console.log('No es un documento para procesar con OCR');
      return null;
    }

    try {
      // Obtener URL firmada del documento
      const [url] = await bucket.file(filePath).getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutos
      });

      // Enviar a API de OCR
      const response = await axios.post(
        process.env.OCR_API_ENDPOINT,
        {
          documentUrl: url,
          outputFormat: 'json',
          extractText: true,
          extractTables: true,
          extractForms: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OCR_API_KEY}`,
          },
        }
      );

      // Guardar resultados en Firestore
      const documentId = filePath.split('/').pop().split('.')[0];
      const userId = filePath.split('/')[1]; // Asumiendo estructura: documents/{userId}/{documentId}.pdf
      
      await db.collection('documents').doc(documentId).set({
        userId,
        originalPath: filePath,
        fileName: object.name.split('/').pop(),
        contentType: object.contentType,
        size: object.size,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        ocrStatus: 'completed',
        ocrData: response.data,
        searchableText: response.data.text,
        metadata: {
          pages: response.data.pages.length,
          hasText: response.data.text.length > 0,
          hasTables: response.data.tables && response.data.tables.length > 0,
          hasForms: response.data.forms && response.data.forms.length > 0,
        }
      });

      // Indexar para búsqueda
      await indexDocumentContent(documentId, response.data.text, userId);

      return null;
    } catch (error) {
      console.error('Error procesando documento con OCR:', error);
      
      // Registrar error
      const documentId = filePath.split('/').pop().split('.')[0];
      await db.collection('documents').doc(documentId).set({
        originalPath: filePath,
        ocrStatus: 'error',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      
      return null;
    }
  });

// Indexar contenido del documento para búsqueda
async function indexDocumentContent(documentId, text, userId) {
  // Dividir texto en fragmentos para indexación
  const chunks = splitTextIntoChunks(text, 1000);
  
  // Guardar cada fragmento con referencias al documento original
  const batch = db.batch();
  
  chunks.forEach((chunk, index) => {
    const docRef = db.collection('document_index').doc(`${documentId}_${index}`);
    batch.set(docRef, {
      documentId,
      userId,
      chunk,
      chunkIndex: index,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  
  await batch.commit();
}

// Dividir texto en fragmentos para indexación
function splitTextIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

// Buscar en documentos
export const searchDocuments = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'La función requiere autenticación'
    );
  }

  const { query, limit = 10 } = data;
  const userId = context.auth.uid;

  try {
    // Buscar en índice de documentos
    const querySnapshot = await db.collection('document_index')
      .where('userId', '==', userId)
      .where('chunk', '>=', query)
      .where('chunk', '<=', query + '\uf8ff')
      .limit(limit)
      .get();

    // Agrupar resultados por documento
    const documentMatches = {};
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (!documentMatches[data.documentId]) {
        documentMatches[data.documentId] = {
          documentId: data.documentId,
          matchCount: 0,
          matches: []
        };
      }
      
      documentMatches[data.documentId].matchCount++;
      documentMatches[data.documentId].matches.push({
        chunk: data.chunk,
        chunkIndex: data.chunkIndex
      });
    });

    // Obtener detalles completos de los documentos
    const documentIds = Object.keys(documentMatches);
    const documentsSnapshot = await db.collection('documents')
      .where(admin.firestore.FieldPath.documentId(), 'in', documentIds.length > 0 ? documentIds : ['placeholder'])
      .get();

    const results = [];
    
    documentsSnapshot.forEach(doc => {
      const documentData = doc.data();
      results.push({
        ...documentData,
        id: doc.id,
        matches: documentMatches[doc.id].matches,
        matchCount: documentMatches[doc.id].matchCount
      });
    });

    // Ordenar por relevancia (número de coincidencias)
    results.sort((a, b) => b.matchCount - a.matchCount);

    return { results };
  } catch (error) {
    console.error('Error en búsqueda de documentos:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Implementación Frontend

```typescript
// /src/components/Documents/DocumentUploader.tsx

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { storage } from '@/utils/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';

const DocumentUploader: React.FC = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!user) return;
    
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      for (const file of acceptedFiles) {
        // Generar nombre de archivo único
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
        const filePath = `documents/${user.uid}/${fileName}`;
        
        // Crear referencia al archivo en Storage
        const storageRef = ref(storage, filePath);
        
        // Iniciar carga con seguimiento de progreso
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        // Monitorear progreso
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Error al subir documento:', error);
            setUploadError('Error al subir el documento. Por favor, inténtalo de nuevo.');
            setUploading(false);
          },
          async () => {
            // Carga completada
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setSuccessMessage('Documento subido correctamente. El procesamiento OCR comenzará automáticamente.');
            setUploading(false);
            setUploadProgress(0);
          }
        );
      }
    } catch (error) {
      console.error('Error en carga de documentos:', error);
      setUploadError('Error al procesar los archivos. Por favor, inténtalo de nuevo.');
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <PdfIcon fontSize="large" />;
    if (fileType.includes('image')) return <ImageIcon fontSize="large" />;
    return <DocIcon fontSize="large" />;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra y suelta documentos aquí'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            O haz clic para seleccionar archivos
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            Formatos soportados: PDF, DOC, DOCX, JPG, PNG (máx. 20MB)
          </Typography>
          
          {uploading && (
            <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
              <CircularProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.round(uploadProgress)}% completado
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => document.getElementById('fileInput')?.click()}
          disabled={uploading}
        >
          Seleccionar Documentos
        </Button>
      </Box>
      
      <Snackbar 
        open={!!uploadError} 
        autoHideDuration={6000} 
        onClose={() => setUploadError(null)}
      >
        <Alert severity="error" onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage(null)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentUploader;
```

## 2. Integración con Gemini para Asistencia IA Avanzada

### Arquitectura

La integración con Gemini permitirá mejorar las capacidades del asistente Zeus, proporcionando:

- Análisis avanzado de contenido
- Generación de recomendaciones personalizadas
- Asistencia contextual basada en datos del usuario
- Automatización de tareas complejas

### Implementación Backend

```typescript
// /functions/src/zeus/gemini.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

const db = admin.firestore();

// Inicializar Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Procesar consulta con Gemini
export const processQuery = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'La función requiere autenticación'
    );
  }

  const { query, conversationId, contextData } = data;
  const userId = context.auth.uid;

  try {
    // Obtener historial de conversación si existe
    let conversationHistory = [];
    
    if (conversationId) {
      const conversationDoc = await db.collection('zeus_conversations')
        .doc(conversationId)
        .get();
      
      if (conversationDoc.exists) {
        const conversationData = conversationDoc.data();
        conversationHistory = conversationData.messages || [];
      }
    }
    
    // Obtener datos contextuales del usuario
    const userContext = await getUserContext(userId, contextData);
    
    // Construir prompt con contexto
    const fullPrompt = buildPromptWithContext(query, userContext, conversationHistory);
    
    // Llamar a Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();
    
    // Guardar en historial de conversación
    const newMessage = {
      role: 'user',
      content: query,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const newResponse = {
      role: 'assistant',
      content: response,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    let newConversationId = conversationId;
    
    if (!newConversationId) {
      // Crear nueva conversación
      const newConversationRef = db.collection('zeus_conversations').doc();
      newConversationId = newConversationRef.id;
      
      await newConversationRef.set({
        userId,
        title: generateConversationTitle(query),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        messages: [newMessage, newResponse]
      });
    } else {
      // Actualizar conversación existente
      await db.collection('zeus_conversations').doc(newConversationId).update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        messages: admin.firestore.FieldValue.arrayUnion(newMessage, newResponse)
      });
    }
    
    // Analizar acciones recomendadas
    const actions = extractRecommendedActions(response);
    
    return {
      response,
      conversationId: newConversationId,
      actions
    };
  } catch (error) {
    console.error('Error procesando consulta con Gemini:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Obtener contexto del usuario
async function getUserContext(userId, requestedContext = {}) {
  const context = {
    user: null,
    artists: [],
    projects: [],
    recentActivity: [],
    ...requestedContext
  };
  
  // Obtener datos del usuario
  if (context.user === null) {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      context.user = userDoc.data();
    }
  }
  
  // Obtener artistas del usuario
  if (context.artists.length === 0) {
    const artistsSnapshot = await db.collection('artists')
      .where('managers', 'array-contains', userId)
      .limit(5)
      .get();
    
    context.artists = artistsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  
  // Obtener proyectos del usuario
  if (context.projects.length === 0) {
    const projectsSnapshot = await db.collection('projects')
      .where('members', 'array-contains', userId)
      .orderBy('updatedAt', 'desc')
      .limit(5)
      .get();
    
    context.projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  
  // Obtener actividad reciente
  if (context.recentActivity.length === 0) {
    const activitySnapshot = await db.collection('activity')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    context.recentActivity = activitySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
  
  return context;
}

// Construir prompt con contexto
function buildPromptWithContext(query, context, conversationHistory) {
  let prompt = '';
  
  // Añadir instrucciones del sistema
  prompt += 'Eres Zeus, un asistente inteligente especializado en gestión de artistas musicales. ';
  prompt += 'Tu objetivo es proporcionar respuestas útiles, precisas y personalizadas basadas en el contexto del usuario. ';
  prompt += 'Puedes sugerir acciones concretas cuando sea apropiado, utilizando el formato [ACCIÓN: nombre_acción]. ';
  prompt += 'Mantén un tono profesional pero amigable.\n\n';
  
  // Añadir contexto del usuario
  prompt += 'CONTEXTO DEL USUARIO:\n';
  
  if (context.user) {
    prompt += `Nombre: ${context.user.displayName || 'No disponible'}\n`;
    prompt += `Rol: ${context.user.role || 'Usuario'}\n`;
  }
  
  if (context.artists && context.artists.length > 0) {
    prompt += 'Artistas gestionados:\n';
    context.artists.forEach(artist => {
      prompt += `- ${artist.name} (Género: ${artist.genre || 'No especificado'})\n`;
    });
  }
  
  if (context.projects && context.projects.length > 0) {
    prompt += 'Proyectos recientes:\n';
    context.projects.forEach(project => {
      prompt += `- ${project.name} (Estado: ${project.status || 'No especificado'})\n`;
    });
  }
  
  // Añadir historial de conversación
  if (conversationHistory && conversationHistory.length > 0) {
    prompt += '\nHISTORIAL DE CONVERSACIÓN:\n';
    conversationHistory.forEach(message => {
      prompt += `${message.role === 'user' ? 'Usuario' : 'Zeus'}: ${message.content}\n`;
    });
  }
  
  // Añadir consulta actual
  prompt += `\nCONSULTA ACTUAL: ${query}\n`;
  prompt += '\nRESPUESTA:';
  
  return prompt;
}

// Generar título para la conversación
function generateConversationTitle(query) {
  // Simplificar y acortar la consulta para usarla como título
  return query.length > 50 ? query.substring(0, 47) + '...' : query;
}

// Extraer acciones recomendadas de la respuesta
function extractRecommendedActions(response) {
  const actionRegex = /\[ACCIÓN: ([^\]]+)\]/g;
  const actions = [];
  let match;
  
  while ((match = actionRegex.exec(response)) !== null) {
    actions.push(match[1]);
  }
  
  return actions;
}

// Ejecutar acción recomendada
export const executeAction = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'La función requiere autenticación'
    );
  }

  const { action, parameters } = data;
  const userId = context.auth.uid;

  try {
    // Implementar lógica para diferentes acciones
    switch (action) {
      case 'crear_proyecto':
        return await createProject(userId, parameters);
      
      case 'programar_evento':
        return await scheduleEvent(userId, parameters);
      
      case 'generar_informe':
        return await generateReport(userId, parameters);
      
      case 'enviar_recordatorio':
        return await sendReminder(userId, parameters);
      
      default:
        throw new Error(`Acción no reconocida: ${action}`);
    }
  } catch (error) {
    console.error(`Error ejecutando acción ${action}:`, error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Implementaciones de acciones
async function createProject(userId, parameters) {
  // Implementación de creación de proyecto
  const projectRef = db.collection('projects').doc();
  
  await projectRef.set({
    name: parameters.name,
    description: parameters.description || '',
    status: 'draft',
    createdBy: userId,
    members: [userId],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return {
    success: true,
    projectId: projectRef.id,
    message: `Proyecto "${parameters.name}" creado correctamente`
  };
}

async function scheduleEvent(userId, parameters) {
  // Implementación de programación de evento
  const eventRef = db.collection('events').doc();
  
  await eventRef.set({
    title: parameters.title,
    description: parameters.description || '',
    startDate: admin.firestore.Timestamp.fromDate(new Date(parameters.startDate)),
    endDate: parameters.endDate ? admin.firestore.Timestamp.fromDate(new Date(parameters.endDate)) : null,
    location: parameters.location || '',
    createdBy: userId,
    participants: [userId],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return {
    success: true,
    eventId: eventRef.id,
    message: `Evento "${parameters.title}" programado correctamente`
  };
}

async function generateReport(userId, parameters) {
  // Implementación de generación de informe
  // Esta es una versión simplificada; en una implementación real,
  // se generaría un informe completo basado en datos reales
  
  const reportRef = db.collection('reports').doc();
  
  await reportRef.set({
    title: parameters.title,
    type: parameters.type,
    parameters: parameters,
    status: 'processing',
    createdBy: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Iniciar proceso de generación de informe (asíncrono)
  // En una implementación real, esto podría ser una Cloud Function separada
  
  return {
    success: true,
    reportId: reportRef.id,
    message: `Informe "${parameters.title}" en proceso de generación`
  };
}

async function sendReminder(userId, parameters) {
  // Implementación de envío de recordatorio
  const reminderRef = db.collection('reminders').doc();
  
  await reminderRef.set({
    title: parameters.title,
    description: parameters.description || '',
    dueDate: admin.firestore.Timestamp.fromDate(new Date(parameters.dueDate)),
    priority: parameters.priority || 'normal',
    recipients: parameters.recipients || [userId],
    createdBy: userId,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // En una implementación real, aquí se enviarían notificaciones
  
  return {
    success: true,
    reminderId: reminderRef.id,
    message: `Recordatorio "${parameters.title}" enviado correctamente`
  };
}
```

### Implementación Frontend

```typescript
// /src/components/Zeus/ZeusGemini.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Paper, 
  Avatar, 
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { functions } from '@/utils/firebase';
import { httpsCallable } from 'firebase/functions';
import ReactMarkdown from 'react-markdown';

// Componente principal de Zeus con Gemini
const ZeusGemini: React.FC = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'es-ES';
      
      recognition.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        
        setInput(transcript);
      };
      
      recognition.current.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        setIsListening(false);
      };
      
      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
    
    // Mensaje de bienvenida
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: '¡Hola! Soy Zeus, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
          timestamp: new Date()
        }
      ]);
    }
    
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  // Cargar historial de conversaciones
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Scroll al final de los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    // En una implementación real, esto cargaría las conversaciones desde Firestore
    // Por ahora, usamos datos de ejemplo
    setConversations([
      {
        id: 'conv1',
        title: 'Planificación de gira',
        updatedAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'conv2',
        title: 'Análisis de métricas de Spotify',
        updatedAt: new Date(Date.now() - 86400000)
      },
      {
        id: 'conv3',
        title: 'Estrategia de lanzamiento de álbum',
        updatedAt: new Date(Date.now() - 172800000)
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;
    
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Llamar a la función de Cloud Functions
      const processQuery = httpsCallable(functions, 'zeus-processQuery');
      const result = await processQuery({
        query: input,
        conversationId: currentConversationId,
        contextData: {}
      });
      
      const data = result.data as any;
      
      // Actualizar ID de conversación
      if (data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }
      
      // Añadir respuesta a los mensajes
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        actions: data.actions || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Actualizar lista de conversaciones si es necesario
      if (!currentConversationId && data.conversationId) {
        loadConversations();
      }
    } catch (error) {
      console.error('Error al procesar consulta:', error);
      
      // Añadir mensaje de error
      const errorMessage = {
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, inténtalo de nuevo.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.current?.stop();
      setIsListening(false);
    } else {
      recognition.current?.start();
      setIsListening(true);
    }
  };

  const startNewConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: '¡Hola! Soy Zeus, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      }
    ]);
    setCurrentConversationId(null);
  };

  const loadConversation = (conversationId: string) => {
    // En una implementación real, esto cargaría los mensajes de la conversación desde Firestore
    // Por ahora, simulamos la carga
    setIsProcessing(true);
    
    setTimeout(() => {
      const selectedConversation = conversations.find(conv => conv.id === conversationId);
      
      if (selectedConversation) {
        // Simulamos mensajes para esta conversación
        const simulatedMessages = [
          {
            role: 'assistant',
            content: `Continuando nuestra conversación sobre "${selectedConversation.title}". ¿En qué puedo ayudarte?`,
            timestamp: new Date()
          }
        ];
        
        setMessages(simulatedMessages);
        setCurrentConversationId(conversationId);
        setShowHistory(false);
      }
      
      setIsProcessing(false);
    }, 1000);
  };

  const handleActionClick = (action: string) => {
    setCurrentAction(action);
    setShowActionDialog(true);
  };

  const executeAction = async () => {
    if (!currentAction) return;
    
    setIsProcessing(true);
    
    try {
      // Llamar a la función de Cloud Functions
      const executeActionFn = httpsCallable(functions, 'zeus-executeAction');
      const result = await executeActionFn({
        action: currentAction,
        parameters: {
          // Parámetros simulados para demostración
          name: 'Nuevo proyecto',
          title: 'Nuevo evento',
          description: 'Descripción generada por Zeus',
          startDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
      
      const data = result.data as any;
      
      // Añadir mensaje de confirmación
      const confirmationMessage = {
        role: 'assistant',
        content: `✅ ${data.message}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error('Error al ejecutar acción:', error);
      
      // Añadir mensaje de error
      const errorMessage = {
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al ejecutar la acción. Por favor, inténtalo manualmente.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setShowActionDialog(false);
      setCurrentAction(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Encabezado */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{ bgcolor: 'primary.main', mr: 2 }}
          >
            <BotIcon />
          </Avatar>
          <Typography variant="h6">Zeus, multi agente de IA</Typography>
        </Box>
        
        <Box>
          <IconButton onClick={() => setShowHistory(true)}>
            <HistoryIcon />
          </IconButton>
          <IconButton onClick={startNewConversation}>
            <RefreshIcon />
          </IconButton>
          <IconButton>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Área de mensajes */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                border: message.role === 'assistant' ? '1px solid' : 'none',
                borderColor: 'divider'
              }}
            >
              {message.role === 'assistant' ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                <Typography>{message.content}</Typography>
              )}
              
              {message.actions && message.actions.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {message.actions.map((action: string, actionIndex: number) => (
                    <Chip
                      key={actionIndex}
                      icon={<PlayArrowIcon />}
                      label={action}
                      color="primary"
                      variant="outlined"
                      onClick={() => handleActionClick(action)}
                      clickable
                    />
                  ))}
                </Box>
              )}
            </Paper>
            
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, mx: 1 }}
            >
              {message.timestamp.toLocaleTimeString()}
            </Typography>
          </Box>
        ))}
        
        {isProcessing && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              mb: 2
            }}
          >
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Zeus está pensando...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Área de entrada */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Escribe o habla a Zeus..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4
              }
            }}
          />
          
          <IconButton
            color={isListening ? 'primary' : 'default'}
            onClick={toggleListening}
            disabled={isProcessing}
          >
            {isListening ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
          
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Diálogo de historial */}
      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Historial de Conversaciones</DialogTitle>
        <DialogContent dividers>
          <List>
            {conversations.map((conversation) => (
              <ListItem
                key={conversation.id}
                button
                onClick={() => loadConversation(conversation.id)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <HistoryIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={conversation.title}
                  secondary={`Última actualización: ${conversation.updatedAt.toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Cerrar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={startNewConversation}
          >
            Nueva Conversación
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de acción */}
      <Dialog
        open={showActionDialog}
        onClose={() => setShowActionDialog(false)}
      >
        <DialogTitle>Ejecutar Acción</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ¿Quieres que Zeus ejecute la siguiente acción?
          </Typography>
          <Typography variant="subtitle1" color="primary">
            {currentAction}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Esto creará un nuevo elemento en el sistema con datos generados automáticamente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActionDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={executeAction}
          >
            Ejecutar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ZeusGemini;
```

## 3. Integración con manos.im para Indexación y Búsqueda

### Arquitectura

La integración con manos.im permitirá:

- Indexación avanzada de contenido multimedia
- Búsqueda semántica en audio, imágenes y video
- Extracción de metadatos y entidades
- Generación de resúmenes automáticos

### Implementación Backend

```typescript
// /functions/src/content/manos_integration.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket();

// Procesar contenido multimedia con manos.im
export const processMediaContent = functions.storage
  .object()
  .onFinalize(async (object) => {
    // Verificar si es contenido multimedia que debe procesarse
    const filePath = object.name;
    if (!filePath.startsWith('content/') || 
        !(object.contentType.startsWith('audio/') || 
          object.contentType.startsWith('video/') || 
          object.contentType.startsWith('image/'))) {
      console.log('No es contenido multimedia para procesar');
      return null;
    }

    try {
      // Obtener URL firmada del contenido
      const [url] = await bucket.file(filePath).getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutos
      });

      // Determinar tipo de contenido
      let contentType = 'unknown';
      if (object.contentType.startsWith('audio/')) contentType = 'audio';
      if (object.contentType.startsWith('video/')) contentType = 'video';
      if (object.contentType.startsWith('image/')) contentType = 'image';

      // Enviar a API de manos.im
      const response = await axios.post(
        `https://api.manos.im/${contentType}/process`,
        {
          contentUrl: url,
          extractMetadata: true,
          generateSummary: true,
          detectEntities: true,
          indexContent: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MANOS_IM_API_KEY}`,
          },
        }
      );

      // Guardar resultados en Firestore
      const contentId = filePath.split('/').pop().split('.')[0];
      const userId = filePath.split('/')[1]; // Asumiendo estructura: content/{userId}/{contentId}.mp3
      
      await db.collection('content').doc(contentId).set({
        userId,
        originalPath: filePath,
        fileName: object.name.split('/').pop(),
        contentType: object.contentType,
        mediaType: contentType,
        size: object.size,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        processingStatus: 'completed',
        metadata: response.data.metadata || {},
        summary: response.data.summary || '',
        entities: response.data.entities || [],
        transcript: response.data.transcript || '',
        indexId: response.data.indexId || '',
        thumbnailUrl: response.data.thumbnailUrl || null
      }, { merge: true });

      return null;
    } catch (error) {
      console.error('Error procesando contenido multimedia:', error);
      
      // Registrar error
      const contentId = filePath.split('/').pop().split('.')[0];
      await db.collection('content').doc(contentId).set({
        originalPath: filePath,
        processingStatus: 'error',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      
      return null;
    }
  });

// Buscar en contenido multimedia
export const searchMediaContent = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'La función requiere autenticación'
    );
  }

  const { query, mediaTypes = ['audio', 'video', 'image'], limit = 10 } = data;
  const userId = context.auth.uid;

  try {
    // Buscar en índice de manos.im
    const response = await axios.post(
      'https://api.manos.im/search',
      {
        query,
        mediaTypes,
        limit
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MANOS_IM_API_KEY}`,
        },
      }
    );

    // Obtener IDs de contenido de los resultados
    const contentIds = response.data.results.map((result: any) => result.contentId);
    
    // Obtener detalles completos del contenido
    const contentSnapshot = await db.collection('content')
      .where(admin.firestore.FieldPath.documentId(), 'in', contentIds.length > 0 ? contentIds : ['placeholder'])
      .where('userId', '==', userId)
      .get();

    const results = [];
    
    contentSnapshot.forEach(doc => {
      const contentData = doc.data();
      const searchResult = response.data.results.find((r: any) => r.contentId === doc.id);
      
      results.push({
        ...contentData,
        id: doc.id,
        relevance: searchResult ? searchResult.relevance : 0,
        matchDetails: searchResult ? searchResult.matchDetails : null
      });
    });

    // Ordenar por relevancia
    results.sort((a, b) => b.relevance - a.relevance);

    return { results };
  } catch (error) {
    console.error('Error en búsqueda de contenido multimedia:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Generar resumen de contenido
export const generateContentSummary = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'La función requiere autenticación'
    );
  }

  const { contentId, maxLength = 200 } = data;
  const userId = context.auth.uid;

  try {
    // Verificar acceso al contenido
    const contentDoc = await db.collection('content').doc(contentId).get();
    
    if (!contentDoc.exists) {
      throw new Error('Contenido no encontrado');
    }
    
    const contentData = contentDoc.data();
    
    if (contentData.userId !== userId) {
      throw new Error('No tienes permiso para acceder a este contenido');
    }
    
    // Si ya existe un resumen, devolverlo
    if (contentData.summary) {
      return { summary: contentData.summary };
    }
    
    // Obtener URL firmada del contenido
    const [url] = await bucket.file(contentData.originalPath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos
    });
    
    // Generar resumen con manos.im
    const response = await axios.post(
      'https://api.manos.im/summarize',
      {
        contentUrl: url,
        maxLength
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MANOS_IM_API_KEY}`,
        },
      }
    );
    
    // Guardar resumen en Firestore
    await db.collection('content').doc(contentId).update({
      summary: response.data.summary,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { summary: response.data.summary };
  } catch (error) {
    console.error('Error generando resumen de contenido:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Extraer entidades de contenido
export const extractContentEntities = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'La función requiere autenticación'
    );
  }

  const { contentId } = data;
  const userId = context.auth.uid;

  try {
    // Verificar acceso al contenido
    const contentDoc = await db.collection('content').doc(contentId).get();
    
    if (!contentDoc.exists) {
      throw new Error('Contenido no encontrado');
    }
    
    const contentData = contentDoc.data();
    
    if (contentData.userId !== userId) {
      throw new Error('No tienes permiso para acceder a este contenido');
    }
    
    // Si ya existen entidades, devolverlas
    if (contentData.entities && contentData.entities.length > 0) {
      return { entities: contentData.entities };
    }
    
    // Obtener URL firmada del contenido
    const [url] = await bucket.file(contentData.originalPath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos
    });
    
    // Extraer entidades con manos.im
    const response = await axios.post(
      'https://api.manos.im/entities',
      {
        contentUrl: url
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MANOS_IM_API_KEY}`,
        },
      }
    );
    
    // Guardar entidades en Firestore
    await db.collection('content').doc(contentId).update({
      entities: response.data.entities,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { entities: response.data.entities };
  } catch (error) {
    console.error('Error extrayendo entidades de contenido:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Implementación Frontend

```typescript
// /src/components/Content/MediaSearch.tsx

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Chip,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Search as SearchIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
  Description as TextIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { functions } from '@/utils/firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '@/contexts/AuthContext';

// Componente de búsqueda multimedia
const MediaSearch: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMediaTypes, setSelectedMediaTypes] = useState({
    audio: true,
    video: true,
    image: true
  });
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Preparar tipos de medios seleccionados
      const mediaTypes = Object.entries(selectedMediaTypes)
        .filter(([_, isSelected]) => isSelected)
        .map(([type]) => type);
      
      // Llamar a la función de Cloud Functions
      const searchMediaContent = httpsCallable(functions, 'content-searchMediaContent');
      const result = await searchMediaContent({
        query: searchQuery,
        mediaTypes,
        limit: 20
      });
      
      const data = result.data as any;
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error en búsqueda de contenido:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleMediaTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMediaTypes({
      ...selectedMediaTypes,
      [event.target.name]: event.target.checked
    });
  };

  const handleShowDetails = (content: any) => {
    setSelectedContent(content);
    setShowDetailsDialog(true);
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'audio':
        return <AudioIcon />;
      case 'video':
        return <VideoIcon />;
      case 'image':
        return <ImageIcon />;
      default:
        return <TextIcon />;
    }
  };

  const getMediaTypeColor = (mediaType: string) => {
    switch (mediaType) {
      case 'audio':
        return 'primary';
      case 'video':
        return 'secondary';
      case 'image':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Búsqueda de Contenido Multimedia
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Busca en tu contenido multimedia utilizando lenguaje natural. Puedes buscar por descripciones, transcripciones, o elementos visuales.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ej: 'concierto en Madrid', 'entrevista sobre el nuevo álbum', 'logo en fondo azul'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
            sx={{ mr: 2 }}
          />
          
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
          >
            Buscar
          </Button>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filtrar por tipo:
          </Typography>
          
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMediaTypes.audio}
                  onChange={handleMediaTypeChange}
                  name="audio"
                />
              }
              label="Audio"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMediaTypes.video}
                  onChange={handleMediaTypeChange}
                  name="video"
                />
              }
              label="Video"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMediaTypes.image}
                  onChange={handleMediaTypeChange}
                  name="image"
                />
              }
              label="Imagen"
            />
          </FormGroup>
        </Box>
      </Box>
      
      {isSearching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : searchResults.length > 0 ? (
        <Grid container spacing={3}>
          {searchResults.map((content) => (
            <Grid item xs={12} sm={6} md={4} key={content.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 140,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {content.thumbnailUrl ? (
                    <img
                      src={content.thumbnailUrl}
                      alt={content.fileName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getMediaTypeIcon(content.mediaType)
                  )}
                </CardMedia>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" noWrap>
                      {content.fileName}
                    </Typography>
                    
                    <Chip
                      label={content.mediaType}
                      size="small"
                      color={getMediaTypeColor(content.mediaType)}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {content.summary ? (
                      content.summary.length > 100 ? content.summary.substring(0, 100) + '...' : content.summary
                    ) : (
                      'Sin descripción'
                    )}
                  </Typography>
                  
                  {content.entities && content.entities.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {content.entities.slice(0, 3).map((entity: string, index: number) => (
                        <Chip
                          key={index}
                          label={entity}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {content.entities.length > 3 && (
                        <Chip
                          label={`+${content.entities.length - 3}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(content.size || 0)}
                  </Typography>
                  
                  <Box>
                    <Tooltip title="Detalles">
                      <IconButton size="small" onClick={() => handleShowDetails(content)}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Descargar">
                      <IconButton size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Compartir">
                      <IconButton size="small">
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : searchQuery && !isSearching ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="subtitle1">
            No se encontraron resultados para "{searchQuery}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intenta con términos más generales o verifica los filtros seleccionados.
          </Typography>
        </Box>
      ) : null}
      
      {/* Diálogo de detalles */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedContent && (
          <>
            <DialogTitle>
              Detalles del Contenido
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Información General
                    </Typography>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {selectedContent.fileName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Tipo:</strong> {selectedContent.contentType}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Tamaño:</strong> {formatFileSize(selectedContent.size || 0)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Creado:</strong> {selectedContent.createdAt?.toDate().toLocaleString()}
                    </Typography>
                  </Box>
                  
                  {selectedContent.metadata && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Metadatos
                      </Typography>
                      {Object.entries(selectedContent.metadata).map(([key, value]) => (
                        <Typography key={key} variant="body2">
                          <strong>{key}:</strong> {String(value)}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  
                  {selectedContent.entities && selectedContent.entities.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Entidades Detectadas
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedContent.entities.map((entity: string, index: number) => (
                          <Chip
                            key={index}
                            label={entity}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {selectedContent.thumbnailUrl && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Vista Previa
                      </Typography>
                      <Box
                        component="img"
                        src={selectedContent.thumbnailUrl}
                        alt={selectedContent.fileName}
                        sx={{
                          width: '100%',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      />
                    </Box>
                  )}
                  
                  {selectedContent.summary && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Resumen
                      </Typography>
                      <Typography variant="body2">
                        {selectedContent.summary}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedContent.transcript && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Transcripción
                      </Typography>
                      <Box
                        sx={{
                          maxHeight: 200,
                          overflow: 'auto',
                          p: 2,
                          bgcolor: 'action.hover',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="body2">
                          {selectedContent.transcript}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetailsDialog(false)}>
                Cerrar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
              >
                Descargar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MediaSearch;
```

## 4. Integración de Capacidades en el Dashboard

Para integrar todas estas nuevas capacidades en el dashboard principal, se ha creado un componente que muestra las funcionalidades más relevantes:

```typescript
// /src/components/Dashboard/AdvancedFeatures.tsx

import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  DocumentScanner as ScannerIcon,
  Search as SearchIcon,
  SmartToy as BotIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
  Description as DocIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';

const AdvancedFeatures: React.FC = () => {
  const router = useRouter();
  
  const features = [
    {
      title: 'Procesamiento OCR',
      description: 'Extrae texto de documentos y haz que sea buscable',
      icon: <ScannerIcon />,
      color: '#3f51b5',
      path: '/documents'
    },
    {
      title: 'Zeus IA Avanzado',
      description: 'Asistente inteligente con capacidades de Gemini',
      icon: <BotIcon />,
      color: '#f44336',
      path: '/zeus'
    },
    {
      title: 'Búsqueda Multimedia',
      description: 'Busca en audio, video e imágenes con lenguaje natural',
      icon: <SearchIcon />,
      color: '#4caf50',
      path: '/content/search'
    }
  ];
  
  const recentDocuments = [
    {
      id: 'doc1',
      title: 'Contrato_Gira_2025.pdf',
      type: 'document',
      icon: <DocIcon />,
      date: '2 horas atrás'
    },
    {
      id: 'audio1',
      title: 'Entrevista_Radio_Nacional.mp3',
      type: 'audio',
      icon: <AudioIcon />,
      date: '5 horas atrás'
    },
    {
      id: 'video1',
      title: 'Ensayo_General_Madrid.mp4',
      type: 'video',
      icon: <VideoIcon />,
      date: '1 día atrás'
    },
    {
      id: 'img1',
      title: 'Diseño_Portada_Album.jpg',
      type: 'image',
      icon: <ImageIcon />,
      date: '2 días atrás'
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Capacidades Avanzadas
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardMedia
                    sx={{
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: feature.color + '10'
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: feature.color,
                        width: 60,
                        height: 60
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                  </CardMedia>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {feature.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => router.push(feature.path)}
                    >
                      Explorar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              ¿Qué puedes hacer con estas capacidades?
            </Typography>
            <Typography variant="body2" paragraph>
              Las nuevas funcionalidades de IA y procesamiento de contenido te permiten gestionar tu carrera musical de forma más eficiente:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Documentos Inteligentes
                  </Typography>
                  <Typography variant="body2">
                    • Extrae texto de contratos y riders<br />
                    • Busca cláusulas específicas<br />
                    • Organiza documentos automáticamente<br />
                    • Genera resúmenes de documentos largos
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contenido Multimedia
                  </Typography>
                  <Typography variant="body2">
                    • Busca momentos específicos en videos<br />
                    • Transcribe entrevistas automáticamente<br />
                    • Encuentra imágenes por descripción<br />
                    • Analiza sentimiento en comentarios
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Contenido Procesado Recientemente
              </Typography>
              
              <List sx={{ width: '100%' }}>
                {recentDocuments.map((doc, index) => (
                  <React.Fragment key={doc.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: doc.type === 'document' ? '#ff9800' : doc.type === 'audio' ? '#2196f3' : doc.type === 'video' ? '#f44336' : '#4caf50' }}>
                          {doc.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={doc.title}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                            </Typography>
                            {` — Procesado ${doc.date}`}
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentDocuments.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
              
              <Button
                variant="text"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => router.push('/content')}
              >
                Ver Todo el Contenido
              </Button>
            </CardContent>
          </Card>
          
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              mt: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Prueba Zeus con Gemini
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                El asistente Zeus ahora utiliza Gemini para ofrecerte respuestas más inteligentes y contextuales.
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
                "Zeus, ¿puedes analizar las tendencias de streaming de mi último lanzamiento?"
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                startIcon={<BotIcon />}
                onClick={() => router.push('/zeus')}
              >
                Hablar con Zeus
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedFeatures;
```

## 5. Conclusión

La implementación de estas nuevas capacidades avanzadas de IA y procesamiento de contenido multimedia proporciona a la plataforma ArtistRM una ventaja competitiva significativa:

1. **Procesamiento OCR de Documentos**: Permite a los usuarios extraer y buscar texto en contratos, riders y otros documentos importantes, facilitando la gestión documental y el acceso rápido a información crítica.

2. **Integración con Gemini**: Mejora el asistente Zeus con capacidades avanzadas de IA, permitiendo respuestas más contextuales, recomendaciones personalizadas y automatización de tareas complejas.

3. **Integración con manos.im**: Habilita la indexación y búsqueda avanzada en contenido multimedia, permitiendo a los usuarios encontrar momentos específicos en videos, transcribir audio automáticamente y buscar imágenes mediante lenguaje natural.

Estas funcionalidades no solo mejoran la experiencia del usuario, sino que también aumentan la eficiencia operativa y proporcionan insights valiosos a partir del contenido existente.

## 6. Próximos Pasos

Para completar la implementación de estas capacidades, se recomienda:

1. Obtener las claves de API necesarias para Gemini y manos.im
2. Configurar los servicios en el entorno de producción
3. Realizar pruebas exhaustivas con datos reales
4. Recopilar feedback de usuarios iniciales
5. Refinar y optimizar las funcionalidades basadas en el uso real

Una vez implementadas estas capacidades, la plataforma ArtistRM estará posicionada como una solución integral de vanguardia para la gestión de artistas musicales, con capacidades de IA y procesamiento de contenido que superan a las soluciones tradicionales del mercado.
