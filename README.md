# SheetCart - Sistema de E-commerce

Un sistema completo de e-commerce construido con SQLite3, Express, React, Vite y Tailwind CSS.

## 🚀 Características

### Frontend (Tienda)
- ✅ Lista de productos con filtros por categoría
- ✅ Carrito de compras funcional
- ✅ Formulario de checkout básico
- ✅ Diseño responsive con Tailwind CSS
- ✅ Gestión de stock automática

### Backoffice (Administración)
- ✅ Autenticación de administrador
- ✅ Gestión completa de productos (CRUD)
- ✅ Gestión de órdenes de compra
- ✅ Subida de imágenes de productos
- ✅ Control de estados de órdenes
- ✅ Gestión de stock automática

### Base de Datos
- ✅ SQLite3 con esquema completo
- ✅ Productos con múltiples imágenes
- ✅ Categorías de productos
- ✅ Órdenes con items
- ✅ Usuarios administradores

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd SheetCart
```

2. **Instalar dependencias**
```bash
npm run install:all
```

3. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

El sistema estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Backoffice**: http://localhost:3000/admin

## 🔧 Configuración

### Credenciales por defecto del administrador:
- **Usuario**: admin
- **Contraseña**: admin123

### Variables de entorno (opcional)
Crea un archivo `.env` en la raíz del proyecto:
```env
PORT=5000
JWT_SECRET=tu-secreto-super-seguro
```

## 📁 Estructura del Proyecto

```
SheetCart/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── context/       # Contexto del carrito
│   │   └── ...
│   ├── public/
│   └── package.json
├── server/                # Backend Express
│   ├── uploads/          # Imágenes subidas
│   ├── database.sqlite   # Base de datos SQLite
│   ├── database.js       # Configuración de BD
│   ├── index.js          # Servidor principal
│   └── package.json
├── package.json          # Scripts del monorepo
└── README.md
```

## 🗄️ Base de Datos

### Tablas principales:
- **categories**: Categorías de productos
- **products**: Productos con toda la información
- **product_images**: Imágenes de productos (múltiples por producto)
- **orders**: Órdenes de compra
- **order_items**: Items de cada orden
- **admin_users**: Usuarios administradores

### Datos iniciales:
- Categorías por defecto: Ropa, Calzado, Accesorios, Deportes
- Usuario admin: admin/admin123
- Productos de ejemplo incluidos

## 🚀 Despliegue en Render

### Configuración para Render:

1. **Crear un nuevo Web Service en Render**
2. **Configurar el repositorio Git**
3. **Configuración del build:**
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`

### Variables de entorno en Render:
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=tu-secreto-super-seguro
```

### Notas importantes para Render:
- Las imágenes se almacenan en el sistema de archivos del servidor
- La base de datos SQLite se crea automáticamente
- El frontend se sirve desde el mismo servidor Express

## 📱 Uso del Sistema

### Para Clientes:
1. Visitar la tienda en `/`
2. Explorar productos por categorías
3. Agregar productos al carrito
4. Completar formulario de compra
5. Recibir confirmación

### Para Administradores:
1. Acceder a `/admin`
2. Iniciar sesión con credenciales
3. Gestionar productos y órdenes
4. Subir imágenes de productos
5. Controlar estados de órdenes

## 🔒 Seguridad

- Autenticación JWT para el backoffice
- Validación de datos en frontend y backend
- Sanitización de archivos subidos
- Contraseñas hasheadas con bcrypt

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia frontend y backend
npm run dev:client       # Solo frontend
npm run dev:server       # Solo backend

# Producción
npm run build           # Construye el frontend
npm start              # Inicia en modo producción

# Instalación
npm run install:all    # Instala todas las dependencias
```

## 🐛 Solución de Problemas

### Error de puerto ocupado:
```bash
# Cambiar puerto del servidor
PORT=5001 npm run dev:server
```

### Error de base de datos:
```bash
# Eliminar y recrear la base de datos
rm server/database.sqlite
npm run dev:server
```

### Error de dependencias:
```bash
# Limpiar e instalar de nuevo
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

## 📞 Soporte

Para reportar bugs o solicitar nuevas características, por favor crear un issue en el repositorio.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
