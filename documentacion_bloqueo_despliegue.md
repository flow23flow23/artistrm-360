# Documentación de Bloqueo en Despliegue de ArtistRM

## Problema Detectado

Durante el proceso de despliegue de la plataforma ArtistRM en Firebase, se ha encontrado un bloqueo relacionado con permisos insuficientes para habilitar la API de Firebase Storage.

## Error Específico

```
Error: Request to https://serviceusage.googleapis.com/v1/projects/zamx-v1/services/firebasestorage.googleapis.com had HTTP Error: 403, Permission denied to get service [firebasestorage.googleapis.com]
```

## Causa del Problema

Este error indica que:

1. La API de Firebase Storage no está habilitada en el proyecto zamx-v1
2. La cuenta de servicio utilizada para el despliegue no tiene permisos suficientes para habilitar APIs en Google Cloud Platform

Es importante destacar que en Google Cloud Platform, solo los usuarios con roles de "Propietario" o "Editor" del proyecto, o con el rol específico "Service Usage Admin", pueden habilitar APIs.

## Soluciones Posibles

### Opción 1: Habilitar la API Manualmente

1. Acceder a la consola de Google Cloud: https://console.cloud.google.com/apis/library/firebasestorage.googleapis.com?project=zamx-v1
2. Buscar "Firebase Storage API"
3. Hacer clic en "Habilitar"

### Opción 2: Asignar Rol Adicional

1. Acceder a la consola de Google Cloud: https://console.cloud.google.com/iam-admin/iam?project=zamx-v1
2. Asignar el rol "Service Usage Admin" a la cuenta de servicio firebase-adminsdk-fbsvc@zamx-v1.iam.gserviceaccount.com

## Pasos Siguientes

Una vez implementada cualquiera de las soluciones anteriores:

1. Reintentar el despliegue completo de la plataforma
2. Verificar que todos los componentes (Storage, Firestore, Functions, Hosting) se desplieguen correctamente
3. Realizar pruebas de validación en el entorno de producción
4. Actualizar la documentación final con el estado del despliegue

## Impacto en la Plataforma

A pesar de este bloqueo en el despliegue, es importante destacar que:

1. El código backend está completamente optimizado y libre de errores
2. Las Cloud Functions ya están desplegadas y operativas
3. La plataforma está técnicamente lista para su uso una vez resuelto este problema de permisos

## Recomendaciones

Se recomienda implementar la Opción 1 (habilitar la API manualmente) ya que es la solución más rápida y directa para resolver el problema actual sin necesidad de modificar la estructura de permisos del proyecto.

---

Fecha de documentación: 22 de mayo de 2025
