// backend/routes/reports.routes.js
const express = require('express'); // Importa Express para definir rutas
const router = express.Router(); // Crea un enrutador de Express
const reportsController = require('../controllers/reports.controller'); // Importa el controlador de reportes

// Ruta para obtener un resumen de ventas
router.get('/sales-summary', reportsController.getSalesSummary); // Asocia el endpoint /sales-summary al controlador

// Ruta para obtener los productos más vendidos
router.get('/top-selling-products', reportsController.getTopSellingProducts); // Asocia el endpoint /top-selling-products al controlador

// Exporta el enrutador
module.exports = router;