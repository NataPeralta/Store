const GalleryService = require('../services/galleryServicePrisma');

class GalleryController {
  // Obtener todas las imágenes
  static async getAllImages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 1000;

      const result = await GalleryService.getAllImages(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      res.status(500).json({ error: 'Error al obtener las imágenes de la galería' });
    }
  }

  // Subir nueva imagen
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
      }

      const result = await GalleryService.uploadImage(req.file, req.file.originalname);
      res.json({
        message: 'Imagen subida exitosamente',
        ...result
      });
    } catch (error) {
      console.error('Error uploading image to gallery:', error);
      res.status(500).json({ error: 'Error al guardar la imagen en la galería' });
    }
  }

  // Actualizar nombre de imagen
  static async updateImageName(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const result = await GalleryService.updateImageName(id, name);
      res.json(result);
    } catch (error) {
      console.error('Error updating gallery image:', error);
      if (error.message === 'Imagen no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al actualizar la imagen' });
      }
    }
  }

  // Eliminar imagen
  static async deleteImage(req, res) {
    try {
      const { id } = req.params;
      const result = await GalleryService.deleteImage(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      if (error.message === 'Imagen no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al eliminar la imagen' });
      }
    }
  }

  // Generar thumbnails faltantes
  static async generateMissingThumbnails(req, res) {
    try {
      const result = await GalleryService.generateMissingThumbnails();
      res.json({
        message: 'Thumbnails generados exitosamente',
        ...result
      });
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      res.status(500).json({ error: 'Error al generar thumbnails' });
    }
  }
}

module.exports = GalleryController;
