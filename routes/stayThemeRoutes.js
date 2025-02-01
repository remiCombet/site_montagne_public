const express = require('express');
const router = express.Router();
const stayThemeController = require('../controllers/stayThemeController');

// Récupérer tous les thèmes pour un séjour
router.get('/:stay_id', stayThemeController.getThemesByStay);

// Ajouter un thème à un séjour
router.post('/add', stayThemeController.addThemeToStay);

// Supprimer un thème d'un séjour
router.delete('/:stay_id/:theme_id', stayThemeController.removeThemeFromStay);

module.exports = router;
