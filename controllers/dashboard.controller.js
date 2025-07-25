const reportService = require('../services/reports.service');

const getStats = async (req, res) => {
    try {
        const stats = await reportService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { getStats };