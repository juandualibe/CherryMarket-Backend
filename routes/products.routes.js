const express = require('express');
const router = express.Router();
const productController = require('../controllers/products.controller');
const authMiddleware = require('../authMiddleware');
const roleMiddleware = require('../roleMiddleware');

// RUTA PÚBLICA PARA USUARIOS LOGUEADOS (GET)
// Cualquier rol (admin, cashier) puede ver la lista de productos.
router.get('/', authMiddleware, productController.getAllProducts);

// RUTAS SOLO PARA ADMINS (POST, PUT, DELETE)
// Solo los admins pueden crear, actualizar o eliminar productos.
router.post('/', authMiddleware, roleMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, roleMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware, productController.deleteProduct);

module.exports = router;