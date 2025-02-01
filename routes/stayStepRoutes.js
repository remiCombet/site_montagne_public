const express = require('express');
const router = express.Router();
const stayStepController = require('../controllers/stayStepController');

// Route pour récupérer toutes les étapes d'un séjour
router.get('/:stayId/steps', stayStepController.getAllStaySteps);

// Route pour récupérer une étape de séjour par son ID
router.get('/:stayId/steps/:stepId', stayStepController.getStayStepById);

// Route pour créer une nouvelle étape de séjour
router.post('/:stayId/steps/add', stayStepController.createStayStep);

// Route pour mettre à jour une étape de séjour
router.put('/:stayId/steps/:stepId', stayStepController.updateStayStep);

// Route pour supprimer une étape de séjour
router.delete('/:stayId/steps/:stepId', stayStepController.deleteStayStep);

module.exports = router;
