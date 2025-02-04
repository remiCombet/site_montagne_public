const express = require('express');
const router = express.Router();
const stayStepController = require('../controllers/stayStepController');
const stayStepValidator = require('../validators/stayStepValidator');
const validate = require('../middlewares/validationMiddleware');
const { checkStayIdExists } = require('../middlewares/stayMiddleware');


// Route pour récupérer toutes les étapes d'un séjour et les logements
router.get('/:stayId', stayStepController.getAllStaySteps);

// Route pour récupérer une étape de séjour par son ID
router.get('/:stayId/:stepId', stayStepController.getStayStepById);

// Route pour créer une nouvelle étape de séjour
router.post('/:stayId/add', stayStepValidator, validate, stayStepController.createStayStep);

// Route pour mettre à jour une étape de séjour
router.put('/:stayId/:stepId', stayStepValidator, validate, stayStepController.updateStayStep);

// Route pour supprimer une étape de séjour
router.delete('/:stayId/:stepId', stayStepController.deleteStayStep);

module.exports = router;
