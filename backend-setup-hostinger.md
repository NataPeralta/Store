# Backend Setup para Hostinger

## 🚀 Configuración del Backend en Hostinger

### Paso 1: Subir archivos del servidor
1. Crea una carpeta `api` en tu `public_html`
2. Sube estos archivos del servidor:
   - `server/` (toda la carpeta)
   - `shared/` (toda la carpeta)
   - `package.json`
   - `package-lock.json`

### Paso 2: Configurar servidor Express para Hostinger
Crea `api/index.js` con el código del servidor:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// CORS Configuration - MUY IMPORTANTE
app.use(cors({
  origin: [
    'https://replit.com',
    'https://*.replit.app',
    'https://*.replit.dev',
    'http://localhost:5000',
    'https://nataperalta.com.ar'
  ],
  credentials: false,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Tus rutas de API aquí
// ... código del servidor ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
```

### Paso 3: Configurar MySQL
1. **Ejecutar SQL en phpMyAdmin**:
   - Importa `setup-mysql.sql`
   
2. **Datos de conexión ya configurados**:
   - Host: `localhost`
   - Usuario: `u691951636_storeuser`
   - Contraseña: `I3&B0/gr[`
   - Base de datos: `u691951636_storedb`

### Paso 4: Configurar Node.js en Hostinger
1. Ve a Panel de Control > Node.js
2. Configurar:
   - **Archivo de entrada**: `api/index.js`
   - **Script de inicio**: `npm start`
   - **Versión Node.js**: 18.x o superior

### Paso 5: Variables de entorno (opcional)
Si quieres usar Google Sheets, configura:
```
GOOGLE_CLIENT_EMAIL=tu-email-servicio
GOOGLE_PRIVATE_KEY=tu-clave-privada
GOOGLE_SHEETS_ID=tu-id-hoja
```

## ✅ URLs finales:
- **Frontend**: Replit o donde subas el build estático
- **Backend API**: `https://nataperalta.com.ar/api`
- **Base de datos**: MySQL en Hostinger

## 🔧 Testing:
Una vez configurado, tu frontend debería mostrar \"Conectado a Hostinger\" en la esquina superior derecha.