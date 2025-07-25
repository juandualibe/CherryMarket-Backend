const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/reports/sales-summary
// Devuelve un resumen de ventas agrupado por día en un rango de fechas
router.get('/sales-summary', async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Se requieren fechas de inicio y fin.' });
    }

    try {
        const query = `
            SELECT
                (sale_date AT TIME ZONE 'America/Argentina/Buenos_ Aires')::date as date,
                SUM(total_amount) as total
            FROM sales
            WHERE
                (sale_date AT TIME ZONE 'America/Argentina/Buenos_Aires')::date BETWEEN $1::date AND $2::date
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

// --- NUEVA RUTA ---
// GET /api/reports/top-selling-products
// Devuelve los productos más vendidos
router.get('/top-selling-products', async (req, res) => {
    try {
        // Por defecto, muestra el TOP 5. Se puede cambiar con ?limit=10
        const limit = req.query.limit || 5;

        const query = `
            SELECT 
                p.name,
                SUM(si.quantity) AS total_sold
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            GROUP BY p.name
            ORDER BY total_sold DESC
            LIMIT $1;
        `;

        const { rows } = await db.query(query, [limit]);
        res.json(rows);

    } catch (error) {
        console.error('Error al obtener los productos más vendidos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;