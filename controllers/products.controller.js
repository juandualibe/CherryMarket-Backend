// backend/controllers/products.controller.js
const productService = require('../services/products.service'); // Importa el servicio de productos

// Controlador para obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    const products = await productService.findAll(); // Obtiene todos los productos del servicio
    res.json(products); // Devuelve los productos en formato JSON
  } catch (error) {
    console.error('Error en getAllProducts:', error); // Registra el error en la consola
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores del servidor
  }
};

// Controlador para crear un nuevo producto
const createProduct = async (req, res) => {
  const { name, price } = req.body; // Extrae el nombre y precio del cuerpo de la solicitud
  if (!name || !price) {
    return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' }); // Valida los campos obligatorios
  }
  try {
    const newProduct = await productService.create(req.body); // Crea el producto usando el servicio
    res
      .status(201)
      .json({ message: 'Producto creado exitosamente', product: newProduct }); // Devuelve el producto creado
  } catch (error) {
    console.error('Error en createProduct:', error); // Registra el error
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores
  }
};

// Controlador para actualizar un producto existente
const updateProduct = async (req, res) => {
  const { id } = req.params; // Obtiene el ID del producto desde los parámetros
  const { name, price } = req.body; // Extrae los campos del cuerpo de la solicitud
  if (!name || !price) {
    return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' }); // Valida los campos obligatorios
  }
  try {
    const { rowCount, updatedProduct } = await productService.update(id, req.body); // Actualiza el producto
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' }); // Maneja producto no encontrado
    }
    res.json({ message: 'Producto actualizado exitosamente.', product: updatedProduct }); // Devuelve el producto actualizado
  } catch (error) {
    console.error('Error en updateProduct:', error); // Registra el error
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores
  }
};

// Controlador para eliminar un producto
const deleteProduct = async (req, res) => {
  const { id } = req.params; // Obtiene el ID del producto desde los parámetros
  try {
    const { rowCount } = await productService.hardDelete(id); // Realiza un borrado físico del producto
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' }); // Maneja producto no encontrado
    }
    res.json({ message: 'Producto eliminado exitosamente.' }); // Confirma la eliminación
  } catch (error) {
    console.error('Error en deleteProduct:', error); // Registra el error
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores
  }
};

// Exporta los controladores
module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};