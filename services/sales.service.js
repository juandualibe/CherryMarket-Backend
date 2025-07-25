const db = require('../db');

const findAll = async () => {
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
    return rows;
};

const create = async ({ cart, total }) => {
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
        return { message: 'Venta registrada exitosamente', saleId };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error; // Re-lanzamos el error para que el controlador lo maneje
    } finally {
        client.release();
    }
};

module.exports = {
    findAll,
    create,
};