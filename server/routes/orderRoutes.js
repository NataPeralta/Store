const express = require('express');
const OrderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas (para clientes)
router.post('/', OrderController.createOrder);

// Rutas privadas (requieren autenticación de administrador)
router.use(authenticateToken);

// Rutas de órdenes para administradores
router.get('/', OrderController.getAllOrders);
router.get('/stats', OrderController.getOrderStats);
router.get('/:id', OrderController.getOrderById);
router.put('/:id/status', OrderController.updateOrderStatus);
router.delete('/:id', OrderController.deleteOrder);

// Rutas de órdenes por cliente
router.get('/customer/:customerId', OrderController.getOrdersByCustomer);

module.exports = router;
