const express = require('express');
const db = require('./db');
const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        // --- CONSULTA CORREGIDA Y FINAL PARA VENTAS DEL DÍA ---
        // Esta consulta convierte la fecha de la venta a la zona horaria de Argentina
        // y la compara con la fecha actual en la misma zona horaria.
        const salesQuery = `
            SELECT COALESCE(SUM(total_amount), 0) AS total_sales_today
            FROM sales
            WHERE (sale_date AT TIME ZONE 'America/Argentina/Buenos_Aires')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
        `;
        const salesResult = await db.query(salesQuery);
        const totalSalesToday = salesResult.rows[0].total_sales_today;

        // Contar productos con bajo stock (se mantiene igual)
        const lowStockQuery = 'SELECT COUNT(*) AS low_stock_count FROM products WHERE stock < 10';
        const lowStockResult = await db.query(lowStockQuery);
        const lowStockCount = lowStockResult.rows[0].low_stock_count;

        res.json({
            totalSalesToday: parseFloat(totalSalesToday),
            lowStockCount: parseInt(lowStockCount, 10),
        });

    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;