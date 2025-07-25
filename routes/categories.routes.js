const express = require('express');
const db = require('../db'); // Corregido
const router = express.Router();

// GET /api/categories - Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// POST /api/categories - Crear una nueva categoría
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'El nombre es requerido.' });
    }
    try {
        const sql = 'INSERT INTO categories (name) VALUES ($1) RETURNING *';
        const { rows } = await db.query(sql, [name]);
        res.status(201).json(rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Esa categoría ya existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// PUT /api/categories/:id - Actualizar una categoría
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'El nombre es requerido.' });
    }
    try {
        const sql = 'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *';
        const { rows, rowCount } = await db.query(sql, [name, id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json(rows[0]);
    } catch (error) {
         if (error.code === '23505') {
            return res.status(409).json({ message: 'Esa categoría ya existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// DELETE /api/categories/:id - Eliminar una categoría
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM categories WHERE id = $1';
        const { rowCount } = await db.query(sql, [id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json({ message: 'Categoría eliminada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;