const express = require('express');
const router = express.Router();
const accommodationController = require('../controllers/accommodationController');
const accommodationValidator = require('../validators/accommodationValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Route pour récupérer toutes les accommodations
router.get('/', accommodationController.getAllAccommodations);

// Route pour récupérer une accommodation par son ID
router.get('/:id', accommodationController.getAccommodationById);

// Route pour récupérer une accommodation en fonction du stayStep_id
router.get('/:stayStepId', accommodationController.getAccommodationByStayStep);

// Route pour créer une nouvelle accommodation
router.post('/', withAuth, withAdminAuth, accommodationValidator, validate, accommodationController.createAccommodation);

// Route pour mettre à jour une accommodation
router.put('/:id', withAuth, withAdminAuth, accommodationValidator, validate, accommodationController.updateAccommodation);

// Route pour supprimer une accommodation
router.delete('/:id', withAuth, withAdminAuth, accommodationValidator, validate, accommodationController.deleteAccommodation);

module.exports = router;
