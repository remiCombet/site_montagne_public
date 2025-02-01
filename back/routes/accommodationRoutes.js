const express = require('express');
const router = express.Router();
const accommodationController = require('../controllers/accommodationController');
const accommodationValidator = require('../validators/accommodationValidator');
const validate = require('../middlewares/validationMiddleware');

// Route pour récupérer toutes les accommodations
router.get('/', accommodationController.getAllAccommodations);

// Route pour récupérer une accommodation par son ID
router.get('/:id', accommodationController.getAccommodationById);

// Route pour créer une nouvelle accommodation
router.post('/add', accommodationValidator, validate, accommodationController.createAccommodation);

// Route pour mettre à jour une accommodation
router.put('/:id', accommodationValidator, validate, accommodationController.updateAccommodation);

// Route pour supprimer une accommodation
router.delete('/:id', accommodationValidator, validate, accommodationController.deleteAccommodation);

module.exports = router;
