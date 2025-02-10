const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { validateCreateTheme, validateUpdateTheme } = require('../validators/themeValidator');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// créer un theme
router.post('/', withAuth, withAdminAuth, validateCreateTheme, themeController.createTheme);

// Récupérer tous les themes
router.get('/', themeController.getAllTheme);

// Récupérer un theme par id
router.get('/:id', withAuth, withAdminAuth, themeController.getThemeById);

// Modifier un theme
router.put('/:id', withAuth, withAdminAuth, validateUpdateTheme, themeController.updateTheme);

// Supprimer un theme
router.delete('/:id', withAuth, withAdminAuth, themeController.deleteTheme);

module.exports = router;