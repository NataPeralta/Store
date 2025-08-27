const express = require('express');
const SettingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.get('/exchange-rate', SettingsController.getExchangeRate);
router.get('/store', SettingsController.getStoreSettings);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

// Rutas específicas 
router.put('/exchange-rate', SettingsController.updateExchangeRate);
router.put('/store', SettingsController.updateStoreSettings);

// Rutas de configuración general
router.get('/', SettingsController.getAllSettings);
router.get('/:key', SettingsController.getSetting);
router.put('/:key', SettingsController.updateSetting);
router.delete('/:key', SettingsController.deleteSetting);
router.post('/multiple', SettingsController.updateMultipleSettings);

module.exports = router;
