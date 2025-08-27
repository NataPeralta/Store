# Backend - Estructura Modular

## 📁 Estructura de Directorios

```
server/
├── config/
│   └── database.js          # Configuración de base de datos
├── controllers/
│   └── galleryController.js # Controladores de la galería
├── services/
│   └── galleryService.js    # Lógica de negocio de la galería
├── routes/
│   ├── index.js             # Rutas principales
│   └── galleryRoutes.js     # Rutas de galería
├── middleware/
│   └── auth.js              # Middleware de autenticación
├── uploads/                 # Archivos subidos
│   └── thumbs/              # Thumbnails generados
├── index.js                 # Archivo principal del servidor
└── package.json
```

## 🏗️ Arquitectura

### **Config (`/config`)**
- Configuración de base de datos
- Variables de entorno
- Configuraciones globales

### **Controllers (`/controllers`)**
- Manejan las peticiones HTTP
- Validación de entrada
- Respuestas al cliente
- No contienen lógica de negocio

### **Services (`/services`)**
- Lógica de negocio
- Operaciones de base de datos
- Procesamiento de archivos
- Reutilizables entre controladores

### **Routes (`/routes`)**
- Definición de endpoints
- Middleware específico
- Agrupación de rutas relacionadas

### **Middleware (`/middleware`)**
- Autenticación
- Validación
- Logging
- Funciones intermedias

## 🔄 Flujo de Datos

```
Cliente → Routes → Controllers → Services → Database
                ↓
            Middleware (Auth, Validation)
```

## 📋 Rutas de Galería

### **Públicas**
- `GET /api/gallery` - Obtener todas las imágenes

### **Protegidas (requieren autenticación)**
- `POST /api/gallery/upload` - Subir imagen
- `PUT /api/gallery/:id` - Actualizar nombre
- `DELETE /api/gallery/:id` - Eliminar imagen
- `POST /api/gallery/generate-thumbnails` - Generar thumbnails faltantes

## 🚀 Beneficios de la Nueva Estructura

1. **Separación de responsabilidades**
2. **Código más mantenible**
3. **Reutilización de servicios**
4. **Testing más fácil**
5. **Escalabilidad mejorada**
6. **Código más limpio y organizado**

## 🔧 Scripts de Utilidad

### **Sincronización de Galería**
```bash
# Crear script de sincronización
node sync-gallery.js sync     # Sincronizar imágenes nuevas
node sync-gallery.js previews # Generar thumbnails faltantes
node sync-gallery.js clean    # Limpiar imágenes huérfanas
node sync-gallery.js stats    # Ver estadísticas
```

### **Migración de Base de Datos**
```bash
# Agregar columna preview_path si no existe
node migrate-gallery.js
```

## 📝 Próximos Pasos

1. **Crear servicios para otras entidades** (productos, órdenes, etc.)
2. **Agregar validación de entrada**
3. **Implementar logging**
4. **Agregar tests unitarios**
5. **Documentación de API con Swagger**
