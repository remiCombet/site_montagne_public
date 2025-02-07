const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const categoryValidator = require('../validators/categoryValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// // créer un catégorie
// router.post('/add', withAuth, withAdminAuth, categoryValidator, validate, categoryController.createCategory);

// // Récupérer tous les catégories
// router.get('/', withAuth, withAdminAuth, categoryController.getAllCategories);

// // Récupérer un catégorie par id
// router.get('/:id', categoryValidator, validate, categoryController.getCategoryById);

// // Modifier un catégorie
// router.put('/:id', withAuth, withAdminAuth, categoryValidator, validate, categoryController.updateCategory);

// // Supprimer un catégorie
// router.delete('/:id', withAuth, withAdminAuth, categoryValidator, validate, categoryController.deleteCategory);

// créer un catégorie
router.post('/add', categoryValidator, validate, categoryController.createCategory);

// Récupérer tous les catégories
router.get('/', categoryController.getAllCategories);

// Récupérer un catégorie par id
router.get('/:id', categoryValidator, validate, categoryController.getCategoryById);

// Modifier un catégorie
router.put('/:id', categoryValidator, validate, categoryController.updateCategory);

// Supprimer un catégorie
router.delete('/:id', categoryValidator, validate, categoryController.deleteCategory);

module.exports = router;