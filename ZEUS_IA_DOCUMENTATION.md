# Documentación de Zeus IA - ArtistRM

## Introducción

Zeus IA es un asistente inteligente integrado en ArtistRM que proporciona análisis, recomendaciones y respuestas personalizadas a los artistas utilizando procesamiento de lenguaje natural y análisis de datos. Esta primera iteración implementa la funcionalidad conversacional básica con integración a Vertex AI de Google Cloud.

## Componentes Implementados

### 1. Backend (Cloud Functions)

Se ha implementado la función `processQuery` que procesa las consultas de los usuarios y genera respuestas utilizando el modelo de lenguaje PaLM 2 de Vertex AI.

**Ubicación**: `/functions/src/zeus/processQuery.js`

**Funcionalidad**:
- Recibe consultas de texto del usuario
- Verifica autenticación y permisos
- Almacena la conversación en Firestore
- Genera respuestas contextuales mediante Vertex AI
- Devuelve respuestas estructuradas al frontend

**Dependencias**:
- Firebase Admin SDK
- Vertex AI Client Library
- Firebase Authentication
- Firestore Database

### 2. Frontend (Componentes React)

Se han implementado dos componentes principales:

#### 2.1 ZeusChat

**Ubicación**: `/src/components/zeus/ZeusChat.jsx`

**Funcionalidad**:
- Interfaz conversacional para interactuar con Zeus IA
- Gestión de estado de mensajes y sesiones
- Comunicación con Cloud Functions
- Visualización de historial de conversaciones
- Indicadores de carga y estados de error

#### 2.2 Página Zeus

**Ubicación**: `/src/app/zeus/page.jsx`

**Funcionalidad**:
- Integración de ZeusChat en el layout principal
- Sugerencias de consultas predefinidas
- Estructura responsive para diferentes dispositivos

## Flujo de Datos

1. **Usuario envía consulta**:
   - El componente ZeusChat captura la entrada del usuario
   - Se valida el formato y se muestra indicador de carga
   - Se envía la consulta a la Cloud Function mediante httpsCallable

2. **Procesamiento en backend**:
   - La Cloud Function verifica autenticación
   - Registra la consulta en Firestore
   - Prepara el prompt para Vertex AI
   - Llama a la API de Vertex AI con el modelo PaLM 2
   - Recibe la respuesta generada

3. **Respuesta al usuario**:
   - La respuesta se almacena en Firestore
   - El componente ZeusChat escucha cambios en Firestore mediante onSnapshot
   - Se actualiza la interfaz con la nueva respuesta
   - Se desplaza automáticamente al final de la conversación

## Estructura de Datos

### Colección `conversations`

```javascript
{
  userId: "string",         // ID del usuario autenticado
  sessionId: "string",      // ID único de la sesión de chat
  timestamp: "timestamp",   // Marca de tiempo de la conversación
  messages: [               // Array de mensajes
    {
      role: "user" | "assistant",  // Rol del mensaje
      content: "string",           // Contenido del mensaje
      timestamp: "timestamp"       // Marca de tiempo del mensaje
    }
  ],
  metadata: {              // Metadatos adicionales
    source: "string",      // Fuente de la conversación
    ip: "string",          // IP del cliente
    userAgent: "string"    // User-Agent del cliente
  }
}
```

## Configuración Técnica

### Vertex AI

- **Modelo**: text-bison (PaLM 2)
- **Configuración**:
  - max_output_tokens: 1024
  - temperature: 0.2
  - top_p: 0.95
  - top_k: 40

### Firebase

- **Proyecto**: zamx-v1
- **Servicios utilizados**:
  - Authentication
  - Firestore
  - Cloud Functions
  - Hosting

## Pruebas Implementadas

Se han implementado pruebas unitarias para el componente ZeusChat que verifican:

- Renderizado correcto del componente
- Visualización del historial de conversación
- Envío de mensajes y llamadas a Cloud Functions
- Manejo de errores
- Estados de carga y validación de entrada

**Ubicación**: `/src/components/zeus/__tests__/ZeusChat.test.jsx`

## Limitaciones Actuales

- No se implementa aún la generación proactiva de insights
- Las respuestas se basan en el prompt y no en datos específicos del usuario
- No hay integración con fuentes de datos externas en esta iteración
- No se implementa caché de respuestas frecuentes

## Próximos Pasos

### Iteración 2: Análisis de Datos
- Implementación de Analizador de Datos
- Conexión con fuentes de datos existentes
- Generación de respuestas basadas en datos reales
- Visualizaciones básicas de métricas clave

### Iteración 3: Mejora de NLP
- Refinamiento de modelos de lenguaje
- Implementación de clasificador de intenciones
- Mejora de extracción de entidades
- Soporte para conversaciones multi-turno

## Guía de Uso

### Para Desarrolladores

1. **Configuración del entorno**:
   ```bash
   # Instalar dependencias
   npm install
   
   # Configurar variables de entorno
   cp .env.example .env.local
   # Editar .env.local con las credenciales apropiadas
   
   # Iniciar entorno de desarrollo
   npm run dev
   ```

2. **Despliegue de Cloud Functions**:
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

3. **Ejecución de pruebas**:
   ```bash
   npm test src/components/zeus/__tests__/ZeusChat.test.jsx
   ```

### Para Usuarios

1. Navegar a la sección "Zeus IA" desde el menú principal
2. Escribir consultas en el campo de texto y presionar "Enviar"
3. Revisar las respuestas generadas por Zeus
4. Utilizar las sugerencias predefinidas para consultas comunes

## Consideraciones de Seguridad

- Todas las llamadas a Cloud Functions requieren autenticación
- Las conversaciones solo son accesibles por el usuario propietario
- Se implementa validación de entrada en frontend y backend
- Las credenciales de Vertex AI se gestionan de forma segura en el servidor

## Métricas y Monitoreo

Para esta iteración, se recomienda monitorear:

- Número de consultas por usuario/día
- Tiempo de respuesta promedio
- Tasa de error en llamadas a Vertex AI
- Uso de tokens y costos asociados

## Conclusión

Esta primera iteración de Zeus IA establece la base para un asistente inteligente completamente integrado en ArtistRM. Las siguientes iteraciones expandirán sus capacidades con análisis de datos, generación proactiva de insights y automatización de tareas.
