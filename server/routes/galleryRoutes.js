const express = require('express');
const multer = require('multer');
const path = require('path');
const GalleryController = require('../controllers/galleryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Rutas públicas
router.get('/', GalleryController.getAllImages);

// Rutas protegidas (requieren autenticación)
router.post('/upload', authenticateToken, upload.single('image'), GalleryController.uploadImage);
router.put('/:id', authenticateToken, GalleryController.updateImageName);
router.delete('/:id', authenticateToken, GalleryController.deleteImage);
router.post('/generate-thumbnails', authenticateToken, GalleryController.generateMissingThumbnails);

module.exports = router;
