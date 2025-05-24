import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, handleError, region, validateAuth, validatePermission } from '../utils/admin';

/**
 * Función para crear un nuevo artista
 */
export const createArtist = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { name, genres, bio, image, socialMedia } = data;
    
    // Validar datos de entrada
    if (!name) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el nombre del artista'
      );
    }
    
    // Crear documento de artista en Firestore
    const artistRef = db.collection('artists').doc();
    const artistId = artistRef.id;
    
    await artistRef.set({
      name,
      genres: genres || [],
      bio: bio || '',
      image: image || null,
      socialMedia: socialMedia || {},
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Asignar al usuario como propietario del artista
    await db.collection('user_artists').doc(`${uid}_${artistId}`).set({
      userId: uid,
      artistId,
      role: 'owner',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      id: artistId,
      name,
      genres,
      bio,
      image,
      socialMedia
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para actualizar un artista existente
 */
export const updateArtist = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, name, genres, bio, image, socialMedia } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID del artista'
      );
    }
    
    // Validar permisos (requiere rol de editor o superior)
    await validatePermission(uid, artistId, 'editor');
    
    // Construir objeto de actualización
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (name !== undefined) updateData.name = name;
    if (genres !== undefined) updateData.genres = genres;
    if (bio !== undefined) updateData.bio = bio;
    if (image !== undefined) updateData.image = image;
    if (socialMedia !== undefined) updateData.socialMedia = socialMedia;
    
    // Actualizar documento de artista
    await db.collection('artists').doc(artistId).update(updateData);
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para obtener un artista por ID
 */
export const getArtist = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId } = data;
    
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID del artista'
      );
    }
    
    // Verificar si el usuario tiene acceso al artista
    const userArtistRef = db.collection('user_artists').doc(`${uid}_${artistId}`);
    const userArtistDoc = await userArtistRef.get();
    
    if (!userArtistDoc.exists) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tienes acceso a este artista'
      );
    }
    
    // Obtener datos del artista
    const artistDoc = await db.collection('artists').doc(artistId).get();
    
    if (!artistDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Artista no encontrado'
      );
    }
    
    // Obtener miembros del equipo
    const teamSnapshot = await db.collection('user_artists')
      .where('artistId', '==', artistId)
      .get();
    
    const teamPromises = teamSnapshot.docs.map(async (doc) => {
      const userId = doc.data().userId;
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        return {
          userId,
          role: doc.data().role,
          displayName: userDoc.data()?.displayName || '',
          email: userDoc.data()?.email || '',
          photoURL: userDoc.data()?.photoURL || null
        };
      }
      return null;
    });
    
    const team = (await Promise.all(teamPromises)).filter(member => member !== null);
    
    return {
      id: artistId,
      ...artistDoc.data(),
      team
    };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para listar artistas del usuario
 */
export const listUserArtists = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    // Obtener artistas asociados al usuario
    const userArtistsSnapshot = await db.collection('user_artists')
      .where('userId', '==', uid)
      .get();
    
    const artistsPromises = userArtistsSnapshot.docs.map(async (doc) => {
      const artistId = doc.data().artistId;
      const artistDoc = await db.collection('artists').doc(artistId).get();
      
      if (artistDoc.exists) {
        return {
          id: artistId,
          role: doc.data().role,
          ...artistDoc.data()
        };
      }
      return null;
    });
    
    const artists = (await Promise.all(artistsPromises)).filter(artist => artist !== null);
    
    return { artists };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para añadir un miembro al equipo del artista
 */
export const addTeamMember = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, email, role } = data;
    
    if (!artistId || !email || !role) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista, email y rol'
      );
    }
    
    // Validar permisos (requiere rol de admin o superior)
    await validatePermission(uid, artistId, 'admin');
    
    // Validar rol
    const validRoles = ['viewer', 'editor', 'admin', 'owner'];
    if (!validRoles.includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Rol inválido. Debe ser: viewer, editor, admin o owner'
      );
    }
    
    // Buscar usuario por email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Verificar si ya es miembro
    const existingMemberRef = db.collection('user_artists').doc(`${userRecord.uid}_${artistId}`);
    const existingMemberDoc = await existingMemberRef.get();
    
    if (existingMemberDoc.exists) {
      // Actualizar rol si ya es miembro
      await existingMemberRef.update({
        role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Añadir nuevo miembro
      await existingMemberRef.set({
        userId: userRecord.uid,
        artistId,
        role,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});

/**
 * Función para eliminar un miembro del equipo del artista
 */
export const removeTeamMember = functions.region(region).https.onCall(async (data, context) => {
  try {
    // Validar autenticación
    const uid = await validateAuth(context);
    
    const { artistId, userId } = data;
    
    if (!artistId || !userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere ID del artista y ID del usuario'
      );
    }
    
    // Validar permisos (requiere rol de admin o superior)
    await validatePermission(uid, artistId, 'admin');
    
    // No permitir eliminar al propietario
    const memberRef = db.collection('user_artists').doc(`${userId}_${artistId}`);
    const memberDoc = await memberRef.get();
    
    if (!memberDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Miembro no encontrado'
      );
    }
    
    if (memberDoc.data()?.role === 'owner') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No se puede eliminar al propietario del artista'
      );
    }
    
    // Eliminar miembro
    await memberRef.delete();
    
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
});
