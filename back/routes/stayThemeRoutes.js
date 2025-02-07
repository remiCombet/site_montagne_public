const express = require('express');
const router = express.Router();
const stayThemeController = require('../controllers/stayThemeController');
const stayThemeValidator = require('../validators/stayThemeValidator');

// Récupérer tous les thèmes pour un séjour
router.get('/stay/:stay_id', stayThemeController.getThemesByStay);

// Ajouter un thème à un séjour
router.post('/add', stayThemeValidator, stayThemeController.addThemeToStay);

// Supprimer un thème d'un séjour
router.delete('/:stay_id/:theme_id', stayThemeValidator, stayThemeController.removeThemeFromStay);

module.exports = router;
