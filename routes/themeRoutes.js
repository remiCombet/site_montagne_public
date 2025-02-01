const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');

// créer un theme
router.post('/add', themeController.createTheme);

// Récupérer tous les themes
router.get('/', themeController.getAllTheme);

// Récupérer un theme par id
router.get('/:id', themeController.getThemeById);

// Modifier un theme
router.put('/:id', themeController.updateTheme);

// Supprimer un theme
router.delete('/:id', themeController.deleteTheme);

module.exports = router;