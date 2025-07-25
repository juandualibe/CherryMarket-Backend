const db = require('../db');

const findAll = async () => {
    // CORRECCIÓN: Se eliminó la condición "WHERE p.is_active = TRUE"
    const sql = `
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.name ASC;
    `;
    const { rows } = await db.query(sql);
    return rows;
};

const create = async ({ name, price, stock, barcode, category_id }) => {
    const sql = 'INSERT INTO products (name, price, stock, barcode, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const { rows } = await db.query(sql, [name, price, stock || 0, barcode || null, category_id || null]);
    return rows[0];
};

const update = async (id, { name, price, stock, barcode, category_id }) => {
    const sql = 'UPDATE products SET name = $1, price = $2, stock = $3, barcode = $4, category_id = $5 WHERE id = $6 RETURNING *';
    const { rows, rowCount } = await db.query(sql, [name, price, stock, barcode, category_id || null, id]);
    return { updatedProduct: rows[0], rowCount };
};

// CORRECCIÓN: Renombramos la función y cambiamos la lógica a un borrado real (DELETE)
const hardDelete = async (id) => {
    const sql = 'DELETE FROM products WHERE id = $1';
    const { rowCount } = await db.query(sql, [id]);
    return { rowCount };
};

module.exports = {
    findAll,
    create,
    update,
    // CORRECCIÓN: Exportamos la nueva función
    hardDelete, 
};