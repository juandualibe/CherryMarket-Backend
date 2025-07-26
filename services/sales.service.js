// backend/services/sales.service.js
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
          'name', COALESCE(p.name, si.item_name),
          'quantity', si.quantity,
          'priceAtSale', si.price_at_sale
        )
      ) AS items
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    LEFT JOIN products p ON si.product_id = p.id
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
      // Log para depurar cada ítem procesado
      console.log('Procesando ítem:', {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        isManual: item.isManual,
      });

      const itemSql = `
        INSERT INTO sale_items (sale_id, product_id, item_name, quantity, price_at_sale)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(itemSql, [
        saleId,
        item.isManual ? null : item.id,
        item.isManual ? item.name : null,
        item.quantity,
        item.price,
      ]);

      if (!item.isManual) {
        // Log para verificar la actualización de stock
        console.log('Verificando stock para product_id:', item.id, 'cantidad:', item.quantity);
        const stockSql = 'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1';
        const stockResult = await client.query(stockSql, [item.quantity, item.id]);
        if (stockResult.rowCount === 0) {
          // Consultar el producto para obtener su nombre y stock actual
          const productQuery = await client.query('SELECT name, stock FROM products WHERE id = $1', [item.id]);
          const product = productQuery.rows[0] || { name: 'Producto no encontrado', stock: 0 };
          throw new Error(
            `Stock insuficiente para el producto "${product.name}" (ID: ${item.id}, Stock disponible: ${product.stock}, Solicitado: ${item.quantity}).`
          );
        }
      }
    }
    await client.query('COMMIT');
    return { message: 'Venta registrada exitosamente', saleId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar la venta:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  findAll,
  create,
};