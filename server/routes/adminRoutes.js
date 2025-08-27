const express = require('express');
const AdminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminUser:
 *       type: object
 *       required:
 *         - username
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario admin
 *         username:
 *           type: string
 *           description: Nombre de usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Nombre de usuario
 *         password:
 *           type: string
 *           description: Contraseña
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token
 *         user:
 *           $ref: '#/components/schemas/AdminUser'
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Iniciar sesión de administrador
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', AdminController.login);

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Crear nuevo administrador
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Administrador creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/register', authenticateToken, AdminController.createAdmin);

/**
 * @swagger
 * /api/admin/verify:
 *   get:
 *     summary: Verificar token de autenticación
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Token inválido
 */
router.get('/verify', authenticateToken, AdminController.verifyToken);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

// Rutas de gestión de usuarios admin
router.get('/', AdminController.getAllAdmins);
router.get('/:id', AdminController.getAdminById);
router.post('/', AdminController.createAdmin);
router.put('/:id', AdminController.updateAdmin);
router.delete('/:id', AdminController.deleteAdmin);
router.put('/:id/password', AdminController.changePassword);

module.exports = router;
