const express = require('express');
const galleryRoutes = require('./galleryRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const orderRoutes = require('./orderRoutes');
const customerRoutes = require('./customerRoutes');
const adminRoutes = require('./adminRoutes');
const settingsRoutes = require('./settingsRoutes');
const statsRoutes = require('./statsRoutes');

const router = express.Router();

// Rutas de galería
router.use('/gallery', galleryRoutes);

// Rutas de productos
router.use('/products', productRoutes);

// Rutas de categorías
router.use('/categories', categoryRoutes);

// Rutas de órdenes
router.use('/orders', orderRoutes);

// Rutas de clientes
router.use('/customers', customerRoutes);

// Rutas de usuarios admin
router.use('/admins', adminRoutes);

// Rutas de configuración
router.use('/settings', settingsRoutes);

// Rutas de estadísticas
router.use('/stats', statsRoutes);

module.exports = router;
