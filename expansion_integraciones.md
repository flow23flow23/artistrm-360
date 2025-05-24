# Expansión de Integraciones y Flujos de Trabajo Avanzados

Este documento describe las nuevas integraciones implementadas en ArtistRM y las mejoras realizadas en los flujos de trabajo automatizados, utilizando n8n y Google Cloud Workflows.

## 1. Nuevas Integraciones de Plataformas

Se han añadido integraciones con las siguientes plataformas clave para la industria musical:

### SoundCloud

- **Propósito**: Sincronización de pistas, estadísticas de reproducción y comentarios.
- **Implementación**: Se utiliza la API oficial de SoundCloud (OAuth 2.0 para autenticación).
- **Funcionalidades**: 
    - Importar catálogo de pistas a ArtistRM.
    - Sincronizar estadísticas de reproducción y likes.
    - Mostrar comentarios recientes en el dashboard.
    - (Futuro) Publicar pistas directamente desde ArtistRM.
- **Código (Ejemplo Cloud Function)**:
```typescript
// backend/functions/src/integrations/soundcloud.ts
import { getSoundCloudClient } from "./utils/soundcloudClient";

export const syncSoundCloudStats = functions.pubsub
  .schedule("every 24 hours") // O trigger por webhook
  .onRun(async (context) => {
    const artistsSnapshot = await db.collection("artists").get();
    for (const artistDoc of artistsSnapshot.docs) {
      const soundCloudToken = artistDoc.data().integrations?.soundcloud?.accessToken;
      if (soundCloudToken) {
        const client = getSoundCloudClient(soundCloudToken);
        try {
          const tracks = await client.get("/me/tracks");
          for (const track of tracks) {
            const stats = await client.get(`/tracks/${track.id}/stats`);
            // Guardar estadísticas en Firestore
            await db.collection("analytics")
              .doc(`soundcloud_${artistDoc.id}_${track.id}`)
              .set({ 
                artistId: artistDoc.id,
                platform: "soundcloud",
                trackId: track.id,
                plays: stats.playback_count,
                likes: stats.favoritings_count,
                comments: stats.comment_count,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
              }, { merge: true });
          }
        } catch (error) {
          console.error(`Error syncing SoundCloud for artist ${artistDoc.id}:`, error);
        }
      }
    }
  });
```

### Twitch

- **Propósito**: Sincronización de estadísticas de streams, VODs y clips.
- **Implementación**: Se utiliza la API de Twitch (OAuth 2.0 para autenticación).
- **Funcionalidades**: 
    - Mostrar estadísticas de espectadores y seguidores.
    - Listar VODs y clips recientes.
    - (Futuro) Notificaciones de inicio de stream.
- **Código (Ejemplo n8n Workflow)**:
    - **Trigger**: Schedule (ej. cada hora) o Webhook de Twitch (si disponible).
    - **Nodo HTTP Request**: Obtener token de acceso (OAuth Client Credentials o User Access Token).
    - **Nodo HTTP Request**: Llamar a endpoints de la API de Twitch (ej. `/helix/streams`, `/helix/users/follows`, `/helix/videos`).
    - **Nodo Function**: Procesar los datos recibidos.
    - **Nodo Firebase**: Actualizar datos en Firestore (ej. `/artists/{artistId}/integrations/twitch`).

### Discord

- **Propósito**: Gestión de comunidad, anuncios y roles.
- **Implementación**: Se utiliza la API de Discord (Bot Token para autenticación).
- **Funcionalidades**: 
    - Enviar anuncios a canales específicos desde ArtistRM.
    - Sincronizar roles de miembros (ej. suscriptores de Patreon).
    - Mostrar métricas básicas del servidor (miembros online).
- **Código (Ejemplo Cloud Function)**:
```typescript
// backend/functions/src/integrations/discord.ts
import { Client, GatewayIntentBits, TextChannel } from "discord.js";

const sendDiscordAnnouncement = async (guildId, channelId, message) => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  await client.login(process.env.DISCORD_BOT_TOKEN);
  
  try {
    const channel = await client.channels.fetch(channelId) as TextChannel;
    if (channel) {
      await channel.send(message);
      console.log("Announcement sent to Discord channel:", channelId);
    } else {
      console.error("Discord channel not found:", channelId);
    }
  } catch (error) {
    console.error("Error sending Discord announcement:", error);
  } finally {
    client.destroy();
  }
};

export const postToDiscord = functions.https.onCall(async (data, context) => {
  // Validar autenticación y permisos del usuario
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }
  // Obtener guildId y channelId desde la configuración del artista
  const artistConfig = await getArtistConfig(context.auth.uid);
  const { guildId, announcementChannelId } = artistConfig.integrations?.discord || {};

  if (!guildId || !announcementChannelId) {
     throw new functions.https.HttpsError("failed-precondition", "Discord not configured.");
  }

  await sendDiscordAnnouncement(guildId, announcementChannelId, data.message);
  return { success: true };
});
```

### Plataformas NFT Musical (Ej. Catalog, Sound.xyz)

- **Propósito**: Seguimiento de lanzamientos NFT, ventas y royalties.
- **Implementación**: Depende de la API específica de cada plataforma (algunas pueden requerir integración directa con blockchain/smart contracts).
- **Funcionalidades**: 
    - Listar NFTs lanzados por el artista.
    - Mostrar historial de ventas y precios.
    - Sincronizar datos de royalties (si la API lo permite).
- **Nota**: La implementación es compleja y requiere investigación específica por plataforma. Se priorizarán las plataformas con APIs más accesibles.
- **Enfoque Inicial**: Integración con exploradores de blockchain (Etherscan API, etc.) para rastrear transacciones relacionadas con los smart contracts del artista.

## 2. Mejoras en Flujos de Trabajo Automatizados

### Plantillas Predefinidas (n8n)

- Se han creado plantillas de workflows en n8n para casos de uso comunes:
    - **Lanzamiento de Single**: Publicación coordinada en Spotify, YouTube, redes sociales y envío de anuncio a Discord.
    - **Promoción de Evento**: Creación de evento en Facebook, publicación en redes sociales, envío de recordatorios.
    - **Sincronización Diaria de Estadísticas**: Recopilación de datos de todas las plataformas integradas y actualización en Firestore/BigQuery.

### Editor Visual de Flujos (Conceptual)

- Se ha diseñado conceptualmente una interfaz dentro de ArtistRM que permitiría a los usuarios (con permisos avanzados) visualizar y potencialmente personalizar flujos básicos sin necesidad de acceder directamente a n8n o Cloud Workflows. (Implementación futura).

### Condiciones y Bifurcaciones Avanzadas

- Los workflows en n8n ahora incluyen lógica condicional más compleja:
    - Ej: Si el engagement en Instagram es bajo, programar un post adicional.
    - Ej: Si un video de YouTube alcanza X visualizaciones, enviar notificación al equipo.

### Triggers Basados en Eventos Complejos

- Se utilizan Cloud Functions como triggers para workflows basados en eventos de Firestore:
    - Ej: Al marcar un proyecto como "Completado", iniciar workflow de archivo y reporte.
    - Ej: Al detectar un comentario negativo con análisis de sentimiento, crear tarea de revisión.

## 3. Sincronización Bidireccional Mejorada

### Resolución de Conflictos

- Se implementa una estrategia "última escritura gana" con timestamp para la mayoría de los datos.
- Para datos críticos (ej. configuración), se añade un sistema de bloqueo optimista o versionado.

### Sincronización en Tiempo Real (WebSockets)

- Se utiliza Firestore listeners (`onSnapshot`) en el frontend para reflejar cambios en tiempo real.
- Para integraciones externas que lo soportan, se utilizan webhooks para recibir actualizaciones inmediatas y propagarlas al frontend vía Firestore.

### Histórico de Cambios y Rollback

- Se implementa una colección `/auditLogs` en Firestore que registra cambios importantes en documentos críticos (ej. proyectos, configuración de integraciones).
- Se desarrollan Cloud Functions para permitir revertir cambios específicos basados en el log de auditoría (para administradores).

### Sincronización Selectiva

- La interfaz de usuario ahora permite a los artistas seleccionar qué tipos de datos desean sincronizar con cada plataforma integrada, ofreciendo mayor control y granularidad.

## 4. Pruebas y Validación

- Se han añadido pruebas de integración para cada nueva plataforma (simulando respuestas de API).
- Se han probado los workflows de n8n con datos de ejemplo.
- Se ha validado la correcta sincronización de datos en Firestore y la actualización en tiempo real en el frontend.
- Se ha verificado la lógica de resolución de conflictos.

## 5. Próximos Pasos

- Continuar añadiendo integraciones con más plataformas relevantes.
- Desarrollar la interfaz visual para la gestión de workflows dentro de ArtistRM.
- Implementar un sistema de monitoreo específico para la salud de las integraciones y workflows.
- Explorar integraciones más profundas con herramientas de marketing y distribución musical.
