const prisma = require('../lib/prisma');

class CategoryServicePrisma {
  // Obtener todas las categorías
  static async getAllCategories() {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              products: true
            }
          }
        }
      });

      // Transformar el resultado para incluir product_count
      return categories.map(category => ({
        ...category,
        product_count: category._count.products
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Obtener categorías activas
  static async getActiveCategories() {
    try {
      const categories = await prisma.category.findMany({
        where: { active: true },
        orderBy: { name: 'asc' }
      });

      return categories;
    } catch (error) {
      console.error('Error fetching active categories:', error);
      throw error;
    }
  }

  // Obtener todas las categorías (incluyendo inactivas)
  static async getAllCategoriesAdmin() {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });

      return categories;
    } catch (error) {
      console.error('Error fetching admin categories:', error);
      throw error;
    }
  }

  // Crear categoría
  static async createCategory(name) {
    try {
      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          active: true
        }
      });

      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Actualizar estado de categoría
  static async updateCategoryStatus(id, active) {
    try {
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { active: Boolean(active) }
      });

      return category;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Categoría no encontrada');
      }
      console.error('Error updating category status:', error);
      throw error;
    }
  }

  // Actualizar nombre de categoría
  static async updateCategoryName(id, name) {
    try {
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { name: name.trim() }
      });

      return category;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Categoría no encontrada');
      }
      console.error('Error updating category name:', error);
      throw error;
    }
  }

  // Eliminar categoría
  static async deleteCategory(id) {
    try {
      // Verificar si la categoría tiene productos asociados
      const categoryWithProducts = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: {
              products: true
            }
          }
        }
      });

      if (!categoryWithProducts) {
        throw new Error('Categoría no encontrada');
      }

      if (categoryWithProducts._count.products > 0) {
        throw new Error('No se puede eliminar una categoría que tiene productos asociados');
      }

      if (categoryWithProducts.active) {
        throw new Error('No se puede eliminar una categoría activa. Desactívela primero.');
      }

      await prisma.category.delete({
        where: { id: parseInt(id) }
      });

      return { message: 'Categoría eliminada exitosamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Categoría no encontrada');
      }
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Obtener categoría por ID
  static async getCategoryById(id) {
    try {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) }
      });

      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      return category;
    } catch (error) {
      console.error('Error fetching category by id:', error);
      throw error;
    }
  }

  // Obtener productos por categoría
  static async getProductsByCategory(categoryId) {
    try {
      const products = await prisma.product.findMany({
        where: {
          active: true,
          categories: {
            some: {
              categoryId: parseInt(categoryId)
            }
          }
        },
        include: {
          categories: {
            include: {
              category: true
            }
          },
          productImages: {
            include: {
              gallery: true
            },
            orderBy: [
              { isPrimary: 'desc' },
              { id: 'asc' }
            ]
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return products.map(product => ({
        ...product,
        category_ids: product.categories.map(pc => pc.categoryId),
        images: product.productImages.map(pi => ({
          id: pi.gallery.id,
          name: pi.gallery.name,
          image_path: pi.gallery.imagePath,
          preview_path: pi.gallery.previewPath,
          created_at: pi.gallery.createdAt,
          updated_at: pi.gallery.updatedAt,
          is_primary: pi.isPrimary
        }))
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }
}

module.exports = CategoryServicePrisma;
