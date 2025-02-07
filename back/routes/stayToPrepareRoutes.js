const express = require('express');
const router = express.Router();
const stayToPrepareController = require('../controllers/stayToPrepareController');
const stayToPrepareValidator = require('../validators/stayToPrepareValidator');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Ajouter un élément à emmener à un séjour
router.post('/add', withAuth, withAdminAuth, stayToPrepareValidator, stayToPrepareController.addStayToPrepare);

// Récupérer tous les équipements à emmener d’un séjour spécifique
router.get('/stay/:stay_id', stayToPrepareController.getToPrepareByStayId);

// Récupérer toutes les associations `StayToPrepare`
router.get('/', withAuth, withAdminAuth, stayToPrepareController.getAllStayToPrepares);

// Supprimer un équipement d’un séjour
router.delete('/:id', withAuth, withAdminAuth, stayToPrepareController.removeStayToPrepare);

module.exports = router;
