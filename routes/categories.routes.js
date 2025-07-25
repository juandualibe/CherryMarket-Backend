const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories.controller');

// Este enrutador se monta en /api/categories en index.js
// La protección con middleware se maneja en index.js, por lo que aquí no es necesaria.

// GET /
router.get('/', categoryController.getAllCategories);

// POST /
router.post('/', categoryController.createCategory);

// PUT /:id
router.put('/:id', categoryController.updateCategory);

// DELETE /:id
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;