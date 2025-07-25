const express = require('express');
const db = require('../db'); // Corregido
const router = express.Router();

// GET /api/sales - Obtener historial de todas las ventas
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT
                s.id,
                s.sale_date,
                s.total_amount,
                json_agg(
                    json_build_object(
                        'productId', p.id,
                        'name', p.name,
                        'quantity', si.quantity,
                        'priceAtSale', si.price_at_sale
                    )
                ) AS items
            FROM sales s
            JOIN sale_items si ON s.id = si.sale_id
            JOIN products p ON si.product_id = p.id
            GROUP BY s.id
            ORDER BY s.sale_date DESC;
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener el historial de ventas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// POST /api/sales - Registrar una nueva venta (movemos la lógica aquí)
router.post('/', async (req, res) => {
    const { cart, total } = req.body;
    if (!cart || cart.length === 0 || !total) {
        return res.status(400).json({ message: 'Datos de la venta incompletos.' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const saleSql = 'INSERT INTO sales (total_amount) VALUES ($1) RETURNING id';
        const saleResult = await client.query(saleSql, [total]);
        const saleId = saleResult.rows[0].id;

        for (const item of cart) {
            const itemSql = 'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4)';
            await client.query(itemSql, [saleId, item.id, item.quantity, item.price]);

            const stockSql = 'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1';
            const stockResult = await client.query(stockSql, [item.quantity, item.id]);

            if (stockResult.rowCount === 0) {
                throw new Error('Stock insuficiente para uno de los productos.');
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Venta registrada exitosamente', saleId: saleId });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: error.message || 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

module.exports = router;