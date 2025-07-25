const reportService = require('../services/reports.service');

const getSalesSummary = async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Se requieren fechas de inicio y fin.' });
    }
    try {
        const summary = await reportService.getSalesSummary(startDate, endDate);
        res.json(summary);
    } catch (error) {
        console.error('Error al generar el reporte de ventas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const getTopSellingProducts = async (req, res) => {
    try {
        const products = await reportService.getTopSellingProducts(req.query.limit);
        res.json(products);
    } catch (error) {
        console.error('Error al obtener los productos más vendidos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getSalesSummary,
    getTopSellingProducts,
};