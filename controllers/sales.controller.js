// backend/controllers/sales.controller.js
const saleService = require('../services/sales.service'); // Importa el servicio de ventas

// Controlador para obtener todas las ventas
const getAllSales = async (req, res) => {
  try {
    const sales = await saleService.findAll(); // Obtiene todas las ventas del servicio
    res.json(sales); // Devuelve las ventas en formato JSON
  } catch (error) {
    console.error('Error al obtener el historial de ventas:', error); // Registra el error
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores
  }
};

// Controlador para crear una nueva venta
const createSale = async (req, res) => {
  const { cart, total } = req.body; // Extrae el carrito y el total del cuerpo de la solicitud
  if (!cart || cart.length === 0 || !total) {
    return res.status(400).json({ message: 'Datos de la venta incompletos.' }); // Valida los datos
  }

  // Valida los ítems manuales
  for (const item of cart) {
    if (item.isManual && (!item.name || !item.price || item.quantity <= 0)) {
      return res
        .status(400)
        .json({ message: 'Ítems manuales deben tener nombre, precio y cantidad válidos.' }); // Valida ítems manuales
    }
  }

  try {
    const result = await saleService.create(req.body); // Crea la venta usando el servicio
    res.status(201).json(result); // Devuelve el resultado con código 201
  } catch (error) {
    console.error('Error al registrar la venta:', error); // Registra el error
    res.status(500).json({ message: error.message || 'Error interno del servidor' }); // Maneja errores
  }
};

// Exporta los controladores
module.exports = {
  getAllSales,
  createSale,
};