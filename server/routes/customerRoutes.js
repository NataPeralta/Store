const express = require('express');
const CustomerController = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas (para registro de clientes)
router.post('/', CustomerController.createCustomer);
router.post('/register-or-get', CustomerController.registerOrGet);
router.post('/update-connection', CustomerController.updateConnection);

// Rutas privadas (requieren autenticación de administrador)
router.use(authenticateToken);

// Rutas de clientes para administradores
router.get('/', CustomerController.getAllCustomers);
router.get('/stats', CustomerController.getCustomerStats);
router.get('/search', CustomerController.searchCustomers);
router.get('/:id', CustomerController.getCustomerById);
router.put('/:id', CustomerController.updateCustomer);
router.delete('/:id', CustomerController.deleteCustomer);

module.exports = router;
