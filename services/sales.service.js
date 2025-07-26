// backend/services/sales.service.js
const db = require('../db'); // Importa el pool de conexiones a la base de datos

// Obtiene todas las ventas con sus ítems
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
  `; // Consulta todas las ventas con sus ítems, agrupadas por venta
  const { rows } = await db.query(query); // Ejecuta la consulta
  return rows; // Devuelve las ventas
};

// Crea una nueva venta
const create = async ({ cart, total }) => {
  const client = await db.connect(); // Obtiene un cliente de la conexión
  try {
    await client.query('BEGIN'); // Inicia una transacción
    // Inserta la venta
    const saleSql = 'INSERT INTO sales (total_amount) VALUES ($1) RETURNING id';
    const saleResult = await client.query(saleSql, [total]); // Ejecuta la consulta
    const saleId = saleResult.rows[0].id; // Obtiene el ID de la venta

    // Procesa cada ítem del carrito
    for (const item of cart) {
      // Registra el ítem para depuración
      console.log('Procesando ítem:', {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        isManual: item.isManual,
      });

      // Inserta el ítem en la tabla sale_items
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
      ]); // Ejecuta la consulta

      // Actualiza el stock para ítems no manuales
      if (!item.isManual) {
        console.log('Verificando stock para product_id:', item.id, 'cantidad:', item.quantity); // Log para depuración
        const stockSql =
          'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1'; // Actualiza el stock
        const stockResult = await client.query(stockSql, [item.quantity, item.id]); // Ejecuta la consulta
        if (stockResult.rowCount === 0) {
          // Consulta el producto para obtener detalles
          const productQuery = await client.query('SELECT name, stock FROM products WHERE id = $1', [
            item.id,
          ]);
          const product = productQuery.rows[0] || { name: 'Producto no encontrado', stock: 0 };
          throw new Error(
            `Stock insuficiente para el producto "${product.name}" (ID: ${item.id}, Stock disponible: ${product.stock}, Solicitado: ${item.quantity}).`
          ); // Lanza error si no hay stock suficiente
        }
      }
    }
    await client.query('COMMIT'); // Confirma la transacción
    return { message: 'Venta registrada exitosamente', saleId }; // Devuelve el resultado
  } catch (error) {
    await client.query('ROLLBACK'); // Revierte la transacción en caso de error
    console.error('Error al registrar la venta:', error.message); // Registra el error
    throw error; // Relanza el error
  } finally {
    client.release(); // Libera el cliente
  }
};

// Exporta los métodos del servicio
module.exports = {
  findAll,
  create,
};