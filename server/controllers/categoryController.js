const CategoryService = require('../services/categoryServicePrisma');

class CategoryController {
  // Obtener categorías activas (público)
  static async getActiveCategories(req, res) {
    try {
      const categories = await CategoryService.getActiveCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching active categories:', error);
      res.status(500).json({ error: 'Error al obtener las categorías' });
    }
  }

  // Obtener todas las categorías (admin)
  static async getAllCategories(req, res) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching all categories:', error);
      res.status(500).json({ error: 'Error al obtener las categorías' });
    }
  }

  // Crear categoría
  static async createCategory(req, res) {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
      }

      const result = await CategoryService.createCategory(name);
      res.json(result);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Error al crear la categoría' });
    }
  }

  // Actualizar estado de categoría
  static async updateCategoryStatus(req, res) {
    try {
      const { id } = req.params;
      const { active } = req.body;

      if (typeof active !== 'boolean') {
        return res.status(400).json({ error: 'El estado debe ser un valor booleano' });
      }

      const result = await CategoryService.updateCategoryStatus(id, active);
      res.json(result);
    } catch (error) {
      console.error('Error updating category status:', error);
      if (error.message === 'Categoría no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al actualizar el estado de la categoría' });
      }
    }
  }

  // Actualizar nombre de categoría
  static async updateCategoryName(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
      }

      const result = await CategoryService.updateCategoryName(id, name);
      res.json(result);
    } catch (error) {
      console.error('Error updating category name:', error);
      if (error.message === 'Categoría no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al actualizar el nombre de la categoría' });
      }
    }
  }

  // Eliminar categoría
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await CategoryService.deleteCategory(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting category:', error);
      if (error.message === 'Categoría no encontrada') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('No se puede eliminar')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al eliminar la categoría' });
      }
    }
  }

  // Obtener estadísticas de categorías
  static async getCategoryStats(req, res) {
    try {
      const stats = await CategoryService.getCategoryStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching category stats:', error);
      res.status(500).json({ error: 'Error al obtener las estadísticas de categorías' });
    }
  }
}

module.exports = CategoryController;
