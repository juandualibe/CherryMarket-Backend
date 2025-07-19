const express = require('express');
const db = require('./db');
const router = express.Router();

// Endpoint para obtener todas las estadísticas del dashboard
router.get('/stats', async (req, res) => {
    try {
        // 1. Calcular las ventas totales del día de hoy
        // Nota: Se ajusta a la zona horaria de Argentina (GMT-3)
        const salesQuery = `
            SELECT COALESCE(SUM(total_amount), 0) AS total_sales_today
            FROM sales
            WHERE sale_date >= CURRENT_DATE - INTERVAL '3 hours'
              AND sale_date < CURRENT_DATE + INTERVAL '21 hours';
        `;
        const salesResult = await db.query(salesQuery);
        const totalSalesToday = salesResult.rows[0].total_sales_today;

        // 2. Contar productos con bajo stock (ej: menos de 10 unidades)
        const lowStockQuery = 'SELECT COUNT(*) AS low_stock_count FROM products WHERE stock < 10';
        const lowStockResult = await db.query(lowStockQuery);
        const lowStockCount = lowStockResult.rows[0].low_stock_count;

        // 3. Devolver todos los datos en un solo objeto
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