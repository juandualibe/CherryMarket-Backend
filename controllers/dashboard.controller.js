// backend/controllers/dashboard.controller.js
const reportService = require('../services/reports.service'); // Importa el servicio de reportes

// Controlador para obtener estadísticas del dashboard
const getStats = async (req, res) => {
  try {
    const stats = await reportService.getDashboardStats(); // Obtiene las estadísticas desde el servicio
    res.json(stats); // Devuelve las estadísticas en formato JSON
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error); // Registra el error en la consola
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores del servidor
  }
};

// Exporta el controlador
module.exports = { getStats };