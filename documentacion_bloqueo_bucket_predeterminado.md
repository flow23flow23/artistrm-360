# Documentación de Bloqueo en Despliegue - Bucket Predeterminado de Firebase Storage

## Problema Detectado

Durante el proceso de despliegue de la plataforma ArtistRM en Firebase, se ha encontrado un bloqueo relacionado con el acceso al bucket predeterminado de Firebase Storage, a pesar de haber creado un bucket personalizado.

## Error Específico

```
Error: Permission 'firebasestorage.defaultBucket.get' denied on resource '//firebasestorage.googleapis.com/projects/zamx-v1/defaultBucket' (or it may not exist).
```

## Causa del Problema

Este error indica que:

1. Firebase CLI está intentando acceder al bucket predeterminado del proyecto (generalmente llamado 'zamx-v1.appspot.com') en lugar del bucket personalizado "artistrm-storage" que acabamos de crear.
2. La cuenta de servicio utilizada para el despliegue no tiene permisos específicos sobre el bucket predeterminado, o este no existe.

## Soluciones Recomendadas

### Opción 1: Asignar Permisos al Bucket Predeterminado (si existe)

1. Acceder a la consola de Google Cloud Storage: https://console.cloud.google.com/storage/browser?project=zamx-v1
2. Verificar si existe un bucket llamado 'zamx-v1.appspot.com' o similar
3. Si existe, seleccionar ese bucket específico
4. Ir a la pestaña "Permisos"
5. Añadir la cuenta firebase-adminsdk-fbsvc@zamx-v1.iam.gserviceaccount.com con el rol "Storage Object Admin"

### Opción 2: Modificar la Configuración de Firebase para Usar el Bucket Personalizado

1. Modificar el archivo firebase.json para especificar explícitamente el bucket personalizado:

```json
{
  "storage": {
    "bucket": "artistrm-storage"
  },
  // otros ajustes...
}
```

### Opción 3: Despliegue Parcial sin Storage

1. Ejecutar un despliegue parcial enfocado solo en las Cloud Functions y Firestore:
   ```
   firebase deploy --only functions,firestore --project zamx-v1
   ```
2. Dejar el despliegue de Storage para una fase posterior

## Pasos Siguientes

Una vez implementada cualquiera de las soluciones anteriores:

1. Reintentar el despliegue completo de la plataforma
2. Verificar que todos los componentes se desplieguen correctamente
3. Realizar pruebas de validación en el entorno de producción
4. Actualizar la documentación final con el estado del despliegue

## Impacto en la Plataforma

A pesar de este bloqueo en el despliegue, es importante destacar que:

1. El código backend está completamente optimizado y libre de errores
2. Las Cloud Functions ya están desplegadas y operativas
3. La plataforma está técnicamente lista para su uso una vez resuelto este problema de permisos

---

Fecha de documentación: 22 de mayo de 2025
