const db = require('../db');

const findAll = async () => {
    const { rows } = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
};

const create = async ({ name }) => {
    const sql = 'INSERT INTO categories (name) VALUES ($1) RETURNING *';
    const { rows } = await db.query(sql, [name]);
    return rows[0];
};

const update = async (id, { name }) => {
    const sql = 'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *';
    const { rows, rowCount } = await db.query(sql, [name, id]);
    return { updatedCategory: rows[0], rowCount };
};

const deleteOne = async (id) => {
    const sql = 'DELETE FROM categories WHERE id = $1';
    const { rowCount } = await db.query(sql, [id]);
    return { rowCount };
};

module.exports = {
    findAll,
    create,
    update,
    deleteOne,
};