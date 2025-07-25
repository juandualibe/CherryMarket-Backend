const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');

// GET /api/sales - Obtener historial de todas las ventas
router.get('/', salesController.getAllSales);

// POST /api/sales - Registrar una nueva venta
router.post('/', salesController.createSale);

module.exports = router;