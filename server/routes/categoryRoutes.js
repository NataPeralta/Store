const express = require('express');
const CategoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.get('/active', CategoryController.getActiveCategories);

// Rutas protegidas (requieren autenticación)
router.get('/', authenticateToken, CategoryController.getAllCategories);
router.post('/', authenticateToken, CategoryController.createCategory);
router.put('/:id/status', authenticateToken, CategoryController.updateCategoryStatus);
router.put('/:id/name', authenticateToken, CategoryController.updateCategoryName);
router.delete('/:id', authenticateToken, CategoryController.deleteCategory);
router.get('/stats', authenticateToken, CategoryController.getCategoryStats);

module.exports = router;
