// backend/services/products.service.js
const db = require('../db'); // Importa el pool de conexiones a la base de datos

// Obtiene todos los productos
const findAll = async () => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.name ASC;
  `; // Consulta todos los productos con el nombre de su categoría (si existe)
  const { rows } = await db.query(sql); // Ejecuta la consulta
  return rows; // Devuelve los productos
};

// Crea un nuevo producto
const create = async ({ name, price, stock, barcode, category_id }) => {
  const sql =
    'INSERT INTO products (name, price, stock, barcode, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *'; // Inserta un nuevo producto
  const { rows } = await db.query(sql, [name, price, stock || 0, barcode || null, category_id || null]); // Ejecuta la consulta
  return rows[0]; // Devuelve el producto creado
};

// Actualiza un producto existente
const update = async (id, { name, price, stock, barcode, category_id }) => {
  const sql =
    'UPDATE products SET name = $1, price = $2, stock = $3, barcode = $4, category_id = $5 WHERE id = $6 RETURNING *'; // Actualiza el producto
  const { rows, rowCount } = await db.query(sql, [
    name,
    price,
    stock,
    barcode,
    category_id || null,
    id,
  ]); // Ejecuta la consulta
  return { updatedProduct: rows[0], rowCount }; // Devuelve el producto actualizado y el número de filas afectadas
};

// Realiza un borrado físico de un producto
const hardDelete = async (id) => {
  const sql = 'DELETE FROM products WHERE id = $1'; // Elimina el producto por ID
  const { rowCount } = await db.query(sql, [id]); // Ejecuta la consulta
  return { rowCount }; // Devuelve el número de filas afectadas
};

// Exporta los métodos del servicio
module.exports = {
  findAll,
  create,
  update,
  hardDelete,
};