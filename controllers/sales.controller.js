const saleService = require('../services/sales.service');

const getAllSales = async (req, res) => {
    try {
        const sales = await saleService.findAll();
        res.json(sales);
    } catch (error) {
        console.error('Error al obtener el historial de ventas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const createSale = async (req, res) => {
    const { cart, total } = req.body;
    if (!cart || cart.length === 0 || !total) {
        return res.status(400).json({ message: 'Datos de la venta incompletos.' });
    }

    try {
        const result = await saleService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error al registrar la venta:', error);
        res.status(500).json({ message: error.message || 'Error interno del servidor' });
    }
};

module.exports = {
    getAllSales,
    createSale,
};