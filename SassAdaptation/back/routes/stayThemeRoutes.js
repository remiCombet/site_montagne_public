const express = require('express');
const router = express.Router();
const stayThemeController = require('../controllers/stayThemeController');
const stayThemeValidator = require('../validators/stayThemeValidator');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Récupérer tous les thèmes pour un séjour
router.get('/stay/:stay_id', stayThemeController.getThemesByStay);

// Ajouter un thème à un séjour
router.post('/add', withAuth, withAdminAuth, stayThemeValidator, stayThemeController.addThemeToStay);

// Supprimer un thème d'un séjour
router.delete('/:stay_id/:theme_id', withAuth, withAdminAuth, stayThemeValidator, stayThemeController.removeThemeFromStay);

// Pour vérifier si un theme est associé a un séjour
router.get("/check/:themeId", withAuth, withAdminAuth, stayThemeController.checkThemeUsage);

module.exports = router;
