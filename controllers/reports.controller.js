// backend/controllers/reports.controller.js
const reportService = require('../services/reports.service'); // Importa el servicio de reportes

// Controlador para obtener un resumen de ventas por fechas
const getSalesSummary = async (req, res) => {
  const { startDate, endDate } = req.query; // Extrae las fechas de los parámetros de consulta
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Se requieren fechas de inicio y fin.' }); // Valida las fechas
  }
  try {
    const summary = await reportService.getSalesSummary(startDate, endDate); // Obtiene el resumen de ventas
    res.json(summary); // Devuelve el resumen en formato JSON
  } catch (error) {
    console.error('Error al generar el reporte de ventas:', error); // Registra el error
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores
  }
};

// Controlador para obtener los productos más vendidos
const getTopSellingProducts = async (req, res) => {
  try {
    const products = await reportService.getTopSellingProducts(req.query.limit); // Obtiene los productos más vendidos
    res.json(products); // Devuelve los productos en formato JSON
  } catch (error) {
    console.error('Error al obtener los productos más vendidos:', error); // Registra el error
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores
  }
};

// Exporta los controladores
module.exports = {
  getSalesSummary,
  getTopSellingProducts,
};