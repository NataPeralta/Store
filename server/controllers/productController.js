const ProductService = require('../services/productServicePrisma');

class ProductController {
  // Obtener todos los productos (público)
  static async getAllProducts(req, res) {
    try {
      const products = await ProductService.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Error al obtener los productos' });
    }
  }

  // Obtener productos para admin
  static async getAdminProducts(req, res) {
    try {
      const products = await ProductService.getAdminProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching admin products:', error);
      res.status(500).json({ error: 'Error al obtener los productos' });
    }
  }

  // Crear producto
  static async createProduct(req, res) {
    try {
      const { name, category_ids, description, brand, original_price, margin, price, size, stock } = req.body;

      if (!name || !price) {
        return res.status(400).json({ error: 'Nombre y precio requeridos' });
      }

      const result = await ProductService.createProduct(req.body, req.files);
      res.json(result);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Error al crear el producto' });
    }
  }

  // Actualizar producto
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await ProductService.updateProduct(id, req.body, req.files);
      res.json(result);
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.message === 'Producto no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al actualizar el producto' });
      }
    }
  }

  // Eliminar producto
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await ProductService.deleteProduct(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  }

  // Importar productos masivamente
  static async bulkImport(req, res) {
    try {
      const { products } = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de productos válido' });
      }

      const result = await ProductService.bulkImport(products);
      res.json(result);
    } catch (error) {
      console.error('Error bulk importing products:', error);
      res.status(500).json({ error: 'Error en la importación masiva' });
    }
  }
}

module.exports = ProductController;
