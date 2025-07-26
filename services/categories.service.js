// backend/services/categories.service.js
const db = require('../db'); // Importa el pool de conexiones a la base de datos

// Obtiene todas las categorías
const findAll = async () => {
  const { rows } = await db.query('SELECT * FROM categories ORDER BY name ASC'); // Consulta todas las categorías, ordenadas por nombre
  return rows; // Devuelve las categorías
};

// Crea una nueva categoría
const create = async ({ name }) => {
  const sql = 'INSERT INTO categories (name) VALUES ($1) RETURNING *'; // Inserta una nueva categoría
  const { rows } = await db.query(sql, [name]); // Ejecuta la consulta
  return rows[0]; // Devuelve la categoría creada
};

// Actualiza una categoría existente
const update = async (id, { name }) => {
  const sql = 'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *'; // Actualiza el nombre de la categoría
  const { rows, rowCount } = await db.query(sql, [name, id]); // Ejecuta la consulta
  return { updatedCategory: rows[0], rowCount }; // Devuelve la categoría actualizada y el número de filas afectadas
};

// Elimina una categoría
const deleteOne = async (id) => {
  const sql = 'DELETE FROM categories WHERE id = $1'; // Elimina la categoría por ID
  const { rowCount } = await db.query(sql, [id]); // Ejecuta la consulta
  return { rowCount }; // Devuelve el número de filas afectadas
};

// Exporta los métodos del servicio
module.exports = {
  findAll,
  create,
  update,
  deleteOne,
};