const express = require('express');
const db = require('./db');
const router = express.Router();

router.get('/sales-summary', async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Se requieren fechas de inicio y fin.' });
    }

    try {
        const query = `
            SELECT
                DATE(sale_date::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires') as date,
                SUM(total_amount) as total
            FROM sales
            WHERE
                (sale_date::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires')::date >= $1::date
            AND
                (sale_date::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires')::date <= $2::date
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