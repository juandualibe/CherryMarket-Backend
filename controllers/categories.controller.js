// backend/controllers/Categories.controller.js
const categoryService = require('../services/categories.service'); // Importa el servicio de categorías

// Controlador para obtener todas las categorías
const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.findAll(); // Obtiene todas las categorías del servicio
    res.json(categories); // Devuelve las categorías en formato JSON
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores del servidor
  }
};

// Controlador para crear una nueva categoría
const createCategory = async (req, res) => {
  const { name } = req.body; // Extrae el nombre del cuerpo de la solicitud
  if (!name) {
    return res.status(400).json({ message: 'El nombre es requerido.' }); // Valida que el nombre esté presente
  }
  try {
    const newCategory = await categoryService.create(req.body); // Crea la categoría usando el servicio
    res.status(201).json(newCategory); // Devuelve la nueva categoría con código 201
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Esa categoría ya existe.' }); // Maneja error de duplicado (clave única)
    }
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja otros errores
  }
};

// Controlador para actualizar una categoría existente
const updateCategory = async (req, res) => {
  const { id } = req.params; // Obtiene el ID de la categoría desde los parámetros de la URL
  const { name } = req.body; // Extrae el nombre del cuerpo de la solicitud
  if (!name) {
    return res.status(400).json({ message: 'El nombre es requerido.' }); // Valida que el nombre esté presente
  }
  try {
    const { rowCount, updatedCategory } = await categoryService.update(id, req.body); // Actualiza la categoría
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' }); // Maneja caso de categoría no encontrada
    }
    res.json(updatedCategory); // Devuelve la categoría actualizada
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Esa categoría ya existe.' }); // Maneja error de duplicado
    }
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja otros errores
  }
};

// Controlador para eliminar una categoría
const deleteCategory = async (req, res) => {
  const { id } = req.params; // Obtiene el ID de la categoría desde los parámetros de la URL
  try {
    const { rowCount } = await categoryService.deleteOne(id); // Elimina la categoría usando el servicio
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' }); // Maneja caso de categoría no encontrada
    }
    res.json({ message: 'Categoría eliminada exitosamente.' }); // Confirma la eliminación
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' }); // Maneja errores del servidor
  }
};

// Exporta los controladores
module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};