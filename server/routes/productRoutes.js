const express = require('express');
const multer = require('multer');
const path = require('path');
const ProductController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del producto
 *         name:
 *           type: string
 *           description: Nombre del producto
 *         description:
 *           type: string
 *           description: Descripción del producto
 *         brand:
 *           type: string
 *           description: Marca del producto
 *         originalPrice:
 *           type: number
 *           description: Precio original del producto
 *         margin:
 *           type: number
 *           description: Margen de ganancia en porcentaje
 *         price:
 *           type: number
 *           description: Precio de venta
 *         size:
 *           type: string
 *           description: Tamaño del producto
 *         stock:
 *           type: integer
 *           description: Cantidad en stock
 *         active:
 *           type: boolean
 *           description: Estado activo/inactivo
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *           description: Categorías del producto
 *         images:
 *           type: array
 *           items:
 *             type: integer
 *           description: IDs de las imágenes
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos (público)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: No se encontraron productos
 *       500:
 *         description: Error al obtener los productos
 */
router.get('/', ProductController.getAllProducts);

/**
 * @swagger
 * /api/products/admin:
 *   get:
 *     summary: Obtener productos para administración
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos con información completa
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: No autorizado
 */
router.get('/admin', authenticateToken, ProductController.getAdminProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               brand:
 *                 type: string
 *               original_price:
 *                 type: number
 *               margin:
 *                 type: number
 *               price:
 *                 type: number
 *               size:
 *                 type: string
 *               stock:
 *                 type: integer
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticateToken, upload.array('images', 5), ProductController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               brand:
 *                 type: string
 *               original_price:
 *                 type: number
 *               margin:
 *                 type: number
 *               price:
 *                 type: number
 *               size:
 *                 type: string
 *               stock:
 *                 type: integer
 *               active:
 *                 type: boolean
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de las categorías
 *               image_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de las imágenes
 *               primary_image:
 *                 type: integer
 *                 description: ID de la imagen principal
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Archivos de imagen nuevos
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               brand:
 *                 type: string
 *               original_price:
 *                 type: number
 *               margin:
 *                 type: number
 *               price:
 *                 type: number
 *               size:
 *                 type: string
 *               stock:
 *                 type: integer
 *               active:
 *                 type: boolean
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de las categorías
 *               image_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de las imágenes
 *               primary_image:
 *                 type: integer
 *                 description: ID de la imagen principal
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 */
router.put('/:id', authenticateToken, upload.array('images', 5), ProductController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete('/:id', authenticateToken, ProductController.deleteProduct);


/**
 * @swagger
 * /api/products/bulk-import:
 *   post:
 *     summary: Importar productos en masa
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: file
 *         required: true
 *         schema:
 *           type: file
 *           format: binary
 *     responses:
 *       200:
 *         description: Importación exitosa
 *       400:
 *         description: Error al importar
 *       401:
 *         description: No autorizado
 */
router.post('/bulk-import', authenticateToken, ProductController.bulkImport);

module.exports = router;
