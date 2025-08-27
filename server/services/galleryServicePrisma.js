const prisma = require('../lib/prisma');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

class GalleryServicePrisma {
  // Obtener todas las imágenes de la galería
  static async getAllImages(page = 1, limit = 1000) {
    try {
      const offset = (page - 1) * limit;

      // Obtener total de imágenes
      const total = await prisma.gallery.count();

      // Obtener imágenes paginadas
      const images = await prisma.gallery.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      });

      // Transformar para compatibilidad con ProductForm
      const transformedImages = images.map(img => ({
        id: img.id,
        name: img.name,
        original: `/uploads/${img.imagePath}`,
        thumb: `/uploads/${img.previewPath}`,
        filename: img.imagePath
      }));

      return {
        items: transformedImages,
        total: total,
        page: page,
        limit: limit
      };
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw error;
    }
  }

  // Subir nueva imagen
  static async uploadImage(file, originalName) {
    try {
      const imagePath = file.filename;
      const name = path.parse(originalName).name;

      // Generar thumbnail automáticamente
      const ext = path.extname(imagePath).toLowerCase();
      const base = path.basename(imagePath, ext);
      const thumbName = `${base}-256x256${ext || '.webp'}`;
      const thumbPath = path.join(__dirname, '../uploads', 'thumbs', thumbName);
      const sourcePath = path.join(__dirname, '../uploads', imagePath);

      // Generar thumbnail con sharp
      await sharp(sourcePath)
        .resize(256, 256, { fit: 'cover' })
        .toFile(thumbPath);

      // Guardar en base de datos
      const galleryImage = await prisma.gallery.create({
        data: {
          name: name,
          imagePath: imagePath,
          previewPath: `thumbs/${thumbName}`
        }
      });

      return {
        id: galleryImage.id,
        name: galleryImage.name,
        url: galleryImage.imagePath,
        preview: galleryImage.previewPath
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Actualizar nombre de imagen
  static async updateImageName(id, name) {
    try {
      const updatedImage = await prisma.gallery.update({
        where: { id: parseInt(id) },
        data: { name: name.trim() }
      });

      return { message: 'Nombre actualizado exitosamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Imagen no encontrada');
      }
      console.error('Error updating image name:', error);
      throw error;
    }
  }

  // Eliminar imagen
  static async deleteImage(id) {
    try {
      // Primero obtener la información de la imagen
      const image = await prisma.gallery.findUnique({
        where: { id: parseInt(id) }
      });

      if (!image) {
        throw new Error('Imagen no encontrada');
      }

      // Eliminar archivos físicos
      const filePath = path.join(__dirname, '../uploads', image.imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (image.previewPath) {
        const thumbPath = path.join(__dirname, '../uploads', image.previewPath);
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      }

      // Eliminar de la base de datos
      await prisma.gallery.delete({
        where: { id: parseInt(id) }
      });

      return { message: 'Imagen eliminada exitosamente' };
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Generar thumbnails faltantes
  static async generateMissingThumbnails() {
    try {
      // Obtener imágenes sin preview
      const imagesWithoutPreview = await prisma.gallery.findMany({
        where: { previewPath: null }
      });

      let generated = 0;
      let errors = 0;

      for (const image of imagesWithoutPreview) {
        try {
          const ext = path.extname(image.imagePath).toLowerCase();
          const base = path.basename(image.imagePath, ext);
          const thumbName = `${base}-256x256${ext || '.webp'}`;
          const thumbPath = path.join(__dirname, '../uploads', 'thumbs', thumbName);
          const sourcePath = path.join(__dirname, '../uploads', image.imagePath);

          // Verificar que el archivo fuente existe
          if (!fs.existsSync(sourcePath)) {
            continue;
          }

          // Verificar si el thumbnail ya existe
          if (!fs.existsSync(thumbPath)) {
            // Generar thumbnail
            await sharp(sourcePath)
              .resize(256, 256, { fit: 'cover' })
              .toFile(thumbPath);
          }

          // Actualizar base de datos
          await prisma.gallery.update({
            where: { id: image.id },
            data: { previewPath: `thumbs/${thumbName}` }
          });

          generated++;
        } catch (error) {
          errors++;
        }
      }

      return { generated, errors, total: imagesWithoutPreview.length };
    } catch (error) {
      console.error('Error generating missing thumbnails:', error);
      throw error;
    }
  }
}

module.exports = GalleryServicePrisma;
