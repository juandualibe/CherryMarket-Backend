const express = require('express');
const db = require('./db');
const router = express.Router();

// GET /api/reports/sales-summary
// Acepta query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/sales-summary', async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Se requieren fechas de inicio y fin.' });
    }

    try {
        // Esta consulta agrupa las ventas por día y suma los totales
        // Se ajusta a la zona horaria de Argentina (GMT-3)
        const query = `
            SELECT
                DATE(sale_date AT TIME ZONE 'UTC' AT TIME ZONE '-03') as date,
                SUM(total_amount) as total
            FROM sales
            WHERE sale_date >= $1::date AND sale_date < $2::date + INTERVAL '1 day'
            GROUP BY date
            ORDER BY date ASC;
        `;

        const { rows } = await db.query(query, [startDate, endDate]);
        res.json(rows);

    } catch (error) {
        console.error('Error al generar el reporte de ventas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;