import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Interfaces para tipado
interface ArtistData {
  name: string;
  genre?: string;
  bio?: string;
  imageUrl?: string;
  socialMedia?: Record<string, string>;
  managers: string[];
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

// Exportar funciones de artistas
export const createArtist = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { name, genre, bio, imageUrl, socialMedia } = data;
    const userId = context.auth.uid;

    // Validar datos requeridos
    if (!name) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el nombre del artista'
      );
    }

    // Crear documento de artista en Firestore
    const artistRef = admin.firestore().collection('artists').doc();
    
    const artistData: ArtistData = {
      name,
      genre: genre || '',
      bio: bio || '',
      imageUrl: imageUrl || '',
      socialMedia: socialMedia || {},
      managers: [userId],
      createdBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await artistRef.set(artistData);

    return {
      success: true,
      artistId: artistRef.id,
      message: `Artista ${name} creado correctamente`
    };
  } catch (error: any) {
    console.error('Error al crear artista:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Actualizar artista
export const updateArtist = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { artistId, name, genre, bio, imageUrl, socialMedia } = data;
    const userId = context.auth.uid;

    // Validar datos requeridos
    if (!artistId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere el ID del artista'
      );
    }

    // Verificar permisos
    const artistDoc = await admin.firestore().collection('artists').doc(artistId).get();
    
    if (!artistDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'El artista no existe'
      );
    }

    const artistData = artistDoc.data() as ArtistData;
    
    if (!artistData.managers.includes(userId)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tienes permisos para actualizar este artista'
      );
    }

    // Preparar datos de actualización
    const updateData: Partial<ArtistData> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (name !== undefined) updateData.name = name;
    if (genre !== undefined) updateData.genre = genre;
    if (bio !== undefined) updateData.bio = bio;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (socialMedia !== undefined) updateData.socialMedia = socialMedia;

    // Actualizar documento
    await admin.firestore().collection('artists').doc(artistId).update(updateData);

    return {
      success: true,
      message: `Artista actualizado correctamente`
    };
  } catch (error: any) {
    console.error('Error al actualizar artista:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});

// Añadir manager a artista
export const addArtistManager = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación para esta operación'
    );
  }

  try {
    const { artistId, managerEmail } = data;
    const userId = context.auth.uid;

    // Validar datos requeridos
    if (!artistId || !managerEmail) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requieren ID del artista y email del manager'
      );
    }

    // Verificar permisos
    const artistDoc = await admin.firestore().collection('artists').doc(artistId).get();
    
    if (!artistDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'El artista no existe'
      );
    }

    const artistData = artistDoc.data() as ArtistData;
    
    if (!artistData.managers.includes(userId)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tienes permisos para gestionar este artista'
      );
    }

    // Buscar usuario por email
    const userSnapshot = await admin.firestore().collection('users')
      .where('email', '==', managerEmail)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'No se encontró ningún usuario con ese email'
      );
    }

    const managerUserId = userSnapshot.docs[0].id;
    
    // Verificar que no sea ya un manager
    if (artistData.managers.includes(managerUserId)) {
      throw new functions.https.HttpsError(
        'already-exists',
        'Este usuario ya es manager del artista'
      );
    }

    // Añadir manager
    await admin.firestore().collection('artists').doc(artistId).update({
      managers: admin.firestore.FieldValue.arrayUnion(managerUserId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: `Manager añadido correctamente`
    };
  } catch (error: any) {
    console.error('Error al añadir manager:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error desconocido');
  }
});
