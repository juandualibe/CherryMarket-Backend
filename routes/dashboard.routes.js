// backend/routes/dashboard.routes.js
const express = require('express'); // Importa Express para definir rutas
const router = express.Router(); // Crea un enrutador de Express
const dashboardController = require('../controllers/dashboard.controller'); // Importa el controlador del dashboard

// Ruta para obtener estadísticas del dashboard
router.get('/stats', dashboardController.getStats); // Asocia el endpoint /stats al controlador

// Exporta el enrutador
module.exports = router;