const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categortController');

// créer un catégorie
router.post('/add', categoryController.createcategory);

// Récupérer tous les catégories
router.get('/', categoryController.getAllcategories);

// Récupérer un catégorie par id
router.get('/:id', categoryController.getcategoryById);

// Modifier un catégorie
router.put('/:id', categoryController.updatecategory);

// Supprimer un catégorie
router.delete('/:id', categoryController.deletecategory);

module.exports = router;