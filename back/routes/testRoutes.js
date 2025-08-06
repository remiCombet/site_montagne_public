const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Ajouter un participant à un séjour
router.post('/:stay_id/participants', testController.addStayParticipant);

// Supprimer un participant d'un séjour
// router.delete('/:stay_id/participants/:participant_id', testController.removeStayParticipant);

// Récupérer tous les participants d'un séjour
// router.get('/:stay_id/participants', testController.getStayParticipants);

// Récupérer le nombre total de participants d'un séjour
router.get('/:stay_id/total-participants', testController.getTotalParticipants);

module.exports = router;
