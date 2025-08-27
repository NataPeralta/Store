const express = require('express');
const StatsController = require('../controllers/statsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener estadísticas generales
router.get('/', StatsController.getGeneralStats);

module.exports = router;
