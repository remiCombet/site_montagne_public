const express = require('express');
const router = express.Router();
const stayToPrepareController = require('../controllers/stayToPrepareController');
const stayToPrepareValidator = require('../validators/stayToPrepareValidator');

// Ajouter un élément à emmener à un séjour
router.post('/add', stayToPrepareValidator, stayToPrepareController.addStayToPrepare);

// Récupérer tous les équipements à emmener d’un séjour spécifique
router.get('/stay/:stay_id', stayToPrepareController.getToPreparesByStay);

// Récupérer toutes les associations `StayToPrepare`
router.get('/', stayToPrepareController.getAllStayToPrepares);

// Supprimer un équipement d’un séjour
router.delete('/:id', stayToPrepareController.removeStayToPrepare);

module.exports = router;
