const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// créer un catégorie
router.post('/add', categoryController.createCategory);

// Récupérer tous les catégories
router.get('/', categoryController.getAllCategories);

// Récupérer un catégorie par id
router.get('/:id', categoryController.getCategoryById);

// Modifier un catégorie
router.put('/:id', categoryController.updateCategory);

// Supprimer un catégorie
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;