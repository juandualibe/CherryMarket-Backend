const express = require('express');
const router = express.Router();
const productController = require('../controllers/products.controller'); // Corregido
const authMiddleware = require('../authMiddleware'); // Corregido
const roleMiddleware = require('../roleMiddleware'); // Corregido

// Rutas para productos
router.get('/', authMiddleware, productController.getAllProducts);
router.post('/', authMiddleware, roleMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, roleMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware, productController.deleteProduct);

module.exports = router;