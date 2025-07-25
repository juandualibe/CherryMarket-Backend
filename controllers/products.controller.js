const productService = require('../services/products.service'); // Corregido

const getAllProducts = async (req, res) => {
    try {
        const products = await productService.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const createProduct = async (req, res) => {
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
    }
    try {
        const newProduct = await productService.create(req.body);
        res.status(201).json({ message: 'Producto creado exitosamente', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
    }
    try {
        const { rowCount, updatedProduct } = await productService.update(id, req.body);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto actualizado exitosamente.', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await productService.softDelete(id);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto archivado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};