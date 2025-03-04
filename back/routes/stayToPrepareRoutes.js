const express = require('express');
const router = express.Router();
const stayToPrepareController = require('../controllers/stayToPrepareController');
const { validateAddStayToPrepare, validateDeleteStayToPrepare} = require('../validators/stayToPrepareValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Ajouter un élément à emmener à un séjour
router.post('/stay/:stay_id', withAuth, withAdminAuth, validateAddStayToPrepare, validate, stayToPrepareController.addStayToPrepare);

// Récupérer tous les équipements à emmener d’un séjour spécifique
router.get('/stay/:stay_id', stayToPrepareController.getToPrepareByStayId);

// Récupérer toutes les associations `StayToPrepare`
router.get('/', withAuth, withAdminAuth, stayToPrepareController.getAllStayToPrepares);

// Supprimer un équipement d’un séjour
router.delete('/stay/:stay_id/:category_id', withAuth, withAdminAuth, validateDeleteStayToPrepare, validate, stayToPrepareController.removeStayToPrepare);

module.exports = router;
