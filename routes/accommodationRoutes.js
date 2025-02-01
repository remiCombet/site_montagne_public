const express = require('express');
const router = express.Router();
const accommodationController = require('../controllers/accommodationController');

// Route pour récupérer toutes les accommodations
router.get('/', accommodationController.getAllAccommodations);

// Route pour récupérer une accommodation par son ID
router.get('/:id', accommodationController.getAccommodationById);

// Route pour créer une nouvelle accommodation
router.post('/add', accommodationController.createAccommodation);

// Route pour mettre à jour une accommodation
router.put('/:id', accommodationController.updateAccommodation);

// Route pour supprimer une accommodation
router.delete('/:id', accommodationController.deleteAccommodation);

module.exports = router;
