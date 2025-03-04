const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validateCreateCategory, validateCategoryId, validateUpdateCategory } = require('../validators/categoryValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// créer une catégorie
router.post('/', withAuth, withAdminAuth, validateCreateCategory, validate, categoryController.createCategory);

// Récupérer une catégorie par id
router.get('/:id', validateCategoryId, validate, categoryController.getCategoryById);

// Modifier une catégorie
router.put('/:id', withAuth, withAdminAuth, validateUpdateCategory, validate, categoryController.updateCategory);

// Supprimer une catégorie
router.delete('/:id', withAuth, withAdminAuth, validateCategoryId, validate, categoryController.deleteCategory);

// Récupérer tous les catégories
router.get('/', withAuth, withAdminAuth, categoryController.getAllCategories);

module.exports = router;