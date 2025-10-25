# BioConnect App

Una aplicación Ionic con Angular que permite autenticación offline con reconocimiento facial y sincronización con Firebase.

## Características

- ✅ **Autenticación Offline**: Funciona sin conexión a internet
- ✅ **Reconocimiento Facial**: Autenticación biométrica usando face-api.js
- ✅ **Sincronización Automática**: Sincroniza con Firebase cuando hay conexión
- ✅ **Almacenamiento Local**: Usa Ionic Storage para datos offline
- ✅ **Roles de Usuario**: Trabajador y Encargador
- ✅ **Interfaz Moderna**: UI/UX optimizada con Ionic

## Tecnologías Utilizadas

- **Ionic 7** con Angular
- **Firebase** para sincronización
- **face-api.js** para reconocimiento facial
- **Capacitor** para funcionalidades nativas
- **Ionic Storage** para almacenamiento local

## Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd bioConnectApp
```

2. Instala las dependencias:
```bash
npm install
```

3. Instala las dependencias de Capacitor:
```bash
npx cap sync
```

## Configuración

### Firebase
La aplicación ya está configurada con las credenciales de Firebase proporcionadas:
- Project ID: bioconnect-9cced
- API Key: AIzaSyCjwAWDbB5XhfXohrXuNJqEYx8hYpb5lHE

### Modelos de Reconocimiento Facial
Los modelos de face-api.js se cargan automáticamente desde:
- Assets locales: `/assets/models/`
- CDN como fallback: GitHub raw files

## Uso

### Registro de Usuario
1. Abre la aplicación
2. Ve a "Registrarse"
3. Completa:
   - Nombre de usuario
   - Rol (Trabajador/Encargador)
   - Captura biométrica (reconocimiento facial)
4. Presiona "Registrar"

### Autenticación
1. Ve a "Iniciar Sesión"
2. Presiona "Autenticar con Rostro"
3. Coloca tu rostro frente a la cámara
4. La aplicación te autenticará automáticamente

### Funcionamiento Offline
- La aplicación funciona completamente offline
- Los datos se almacenan localmente
- Cuando hay conexión, se sincroniza automáticamente con Firebase

## Estructura del Proyecto

```
src/
├── app/
│   ├── services/
│   │   ├── auth.ts              # Servicio de autenticación
│   │   ├── face-recognition.ts  # Servicio de reconocimiento facial
│   │   └── sync.ts              # Servicio de sincronización
│   ├── pages/
│   │   ├── login/                # Página de inicio de sesión
│   │   ├── register/            # Página de registro
│   │   └── dashboard/            # Página principal
│   └── environments/            # Configuración de Firebase
├── assets/
│   └── models/                  # Modelos de face-api.js
```

## Servicios

### AuthService
- Registro de usuarios offline
- Autenticación con reconocimiento facial
- Gestión de sesiones

### FaceRecognitionService
- Captura de fotos
- Procesamiento de rostros
- Comparación de descriptores faciales
- Almacenamiento de biometría

### SyncService
- Sincronización con Firebase
- Gestión de cola de sincronización
- Detección de conexión
- Sincronización automática

## Desarrollo

### Ejecutar en navegador:
```bash
ionic serve
```

### Ejecutar en dispositivo:
```bash
# Android
ionic cap run android

# iOS
ionic cap run ios
```

### Construir para producción:
```bash
ionic build
```

## Funcionalidades Offline

1. **Registro Offline**: Los usuarios se pueden registrar sin conexión
2. **Autenticación Offline**: Login usando reconocimiento facial local
3. **Almacenamiento Local**: Todos los datos se guardan localmente
4. **Sincronización Automática**: Se sincroniza cuando hay conexión
5. **Cola de Sincronización**: Los datos pendientes se sincronizan automáticamente

## Seguridad

- Los descriptores faciales se almacenan localmente
- Los datos se encriptan en el almacenamiento local
- La sincronización con Firebase es segura
- No se almacenan fotos, solo descriptores matemáticos

## Solución de Problemas

### Modelos de Reconocimiento Facial
Si los modelos no se cargan:
1. Verifica que la carpeta `/assets/models/` existe
2. Los modelos se descargan automáticamente desde CDN como fallback

### Sincronización
Si la sincronización falla:
1. Verifica la conexión a internet
2. Revisa las credenciales de Firebase
3. Usa "Sincronizar Ahora" en el dashboard

### Cámara
Si la cámara no funciona:
1. Verifica los permisos de cámara
2. Asegúrate de que estás en HTTPS (requerido para cámara web)

## Licencia

Este proyecto está bajo la licencia MIT.

## Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo.
