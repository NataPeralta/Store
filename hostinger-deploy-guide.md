# Guía para Deploy en Hostinger

## 🚀 Tu tienda virtual está lista para Hostinger

### Paso 1: Preparar archivos
1. **Sube todos los archivos** del proyecto a tu carpeta `public_html` en Hostinger
2. **Instala dependencias**: ejecuta `npm install` en el terminal de Hostinger

### Paso 2: Configurar base de datos MySQL
1. **Ejecuta el archivo SQL**: Ve a phpMyAdmin en Hostinger
2. **Importa o ejecuta** el archivo `setup-mysql.sql` que incluye:
   - Creación de tablas
   - Productos de demostración
3. **Datos de conexión ya configurados**:
   - Host: `localhost`
   - Usuario: `u691951636_storeuser`  
   - Contraseña: `I3&B0/gr[`
   - Base de datos: `u691951636_storedb`

### Paso 3: Configurar el servidor
1. **En Hostinger, configura Node.js**:
   - Archivo de entrada: `server/index.js`
   - Script de inicio: `npm run build && node server/index.js`

2. **Variables de entorno** (opcional, para Google Sheets):
   ```
   GOOGLE_CLIENT_EMAIL=tu-email-servicio
   GOOGLE_PRIVATE_KEY=tu-clave-privada  
   GOOGLE_SHEETS_ID=tu-id-hoja
   ```

### Paso 4: Comandos finales
```bash
# En el terminal de Hostinger:
npm install
npm run build
```

### ✅ Tu tienda incluye:
- 🛒 Carrito de compras completo
- 💰 Pago contra reembolso
- 📱 Diseño responsive
- 🗄️ Base de datos MySQL configurada
- 📊 5 productos de demostración
- 📧 Sistema de órdenes con email

### 🌐 URLs finales:
- **Tienda**: `https://nataperalta.com.ar`
- **Admin** (futuro): `https://nataperalta.com.ar/admin`

¡Tu tienda virtual estará funcionando en `nataperalta.com.ar`!