const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const prisma = require('./lib/prisma');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('etag', 'strong');
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  etag: true,
  lastModified: true,
  cacheControl: true,
  maxAge: '365d',
  setHeaders: (res, filePath) => {
    if (/\.(?:png|jpe?g|gif|webp|svg)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// Miniaturas (thumbnails) para imágenes de uploads
const thumbsDir = path.join(__dirname, 'uploads', 'thumbs');
if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
}

// Genera y sirve miniatura 256x256 preservando formato cuando es posible
app.get('/uploads/thumbs/:file', async (req, res) => {
  try {
    const { file } = req.params;
    const sourcePath = path.join(__dirname, 'uploads', file);
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, ext);
    const thumbName = `${base}-256x256${ext || '.webp'}`;
    const thumbPath = path.join(thumbsDir, thumbName);

    // Validar que la fuente exista
    if (!fs.existsSync(sourcePath)) {
      return res.status(404).send('Imagen no encontrada');
    }

    // Si no existe la miniatura o la fuente es más nueva, regenerar
    let shouldGenerate = true;
    if (fs.existsSync(thumbPath)) {
      const srcStat = fs.statSync(sourcePath);
      const thStat = fs.statSync(thumbPath);
      shouldGenerate = srcStat.mtimeMs > thStat.mtimeMs || thStat.size === 0;
    }

    if (shouldGenerate) {
      const pipeline = sharp(sourcePath).resize(256, 256, { fit: 'cover' });
      // Para formatos no soportados, convertir a webp
      if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
        await pipeline.toFile(thumbPath);
      } else {
        await pipeline.webp({ quality: 82 }).toFile(thumbPath);
      }
    }

    // Enviar con cabeceras de caché fuertes
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(thumbPath);
  } catch (err) {
    console.error('Error generando miniatura:', err);
    res.status(500).send('Error generando miniatura');
  }
});

// Verificar conexión a Prisma
prisma.$connect().then(() => {
  console.log('✅ Base de datos Prisma conectada');
}).catch(err => {
  console.error('❌ Error conectando a Prisma:', err);
});

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ==================== SWAGGER DOCUMENTATION ====================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Store API Documentation'
}));

// ==================== RUTAS API MODULARES ====================
app.use('/api', apiRoutes);

// Ruta para servir el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
