const productService = require('../services/products.service');

const getAllProducts = async (req, res) => {
    try {
        const products = await productService.findAll();
        res.json(products);
    } catch (error) {
        console.error("Error en getAllProducts:", error);
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
        console.error("Error en createProduct:", error);
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
        console.error("Error en updateProduct:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await productService.hardDelete(id); // Usa el borrado real
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.json({ message: 'Producto eliminado exitosamente.' });
    } catch (error) {
        console.error("Error en deleteProduct:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};