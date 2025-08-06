const express = require('express');
const router = express.Router();
const stayAccessController = require('../controllers/stayAccessController');
const validate = require('../middlewares/validationMiddleware');
const { validateAddStayAccess } = require('../validators/stayAccessValidator');
const withAdminAuth = require('../middlewares/withAuthAdmin');
const withAuth = require('../middlewares/withAuth');

// Route pour récupérer tous les accès (admin seulement)
// router.get('/', withAuth, withAdminAuth, stayAccessController.getAllStayAccess);

// Route pour ajouter un accès à un séjour
router.post('/:stayId/:accessId', withAuth, withAdminAuth, validateAddStayAccess, validate, stayAccessController.addStayAccess);

// Route pour récupérer tous les accès d'un séjour spécifique
router.get('/:stayId', stayAccessController.getAccessByStay);

// Route pour supprimer un accès d'un séjour
router.delete('/:stayId/:accessId', withAuth, withAdminAuth, stayAccessController.removeStayAccess);

// Route de vérification de l'utilisation d'un accès
router.get('/check/:accessId', withAuth, withAdminAuth, stayAccessController.checkAccessUsage);

module.exports = router;
