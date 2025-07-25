const categoryService = require('../services/categories.service');

const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const createCategory = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'El nombre es requerido.' });
    }
    try {
        const newCategory = await categoryService.create(req.body);
        res.status(201).json(newCategory);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Esa categoría ya existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'El nombre es requerido.' });
    }
    try {
        const { rowCount, updatedCategory } = await categoryService.update(id, req.body);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json(updatedCategory);
    } catch (error) {
         if (error.code === '23505') {
            return res.status(409).json({ message: 'Esa categoría ya existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await categoryService.deleteOne(id);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json({ message: 'Categoría eliminada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};