const express = require('express');
const router = express.Router();
const highlightsController = require('../controllers/highlightsController');

// créer un point potitif
router.post('/add', highlightsController.createHighlights);

// Récupérer tous les points potitifs
router.get('/', highlightsController.getAllHighlights);

// Récupérer un point potitif par id
router.get('/:id', highlightsController.getHighlightsById);

// Modifier un point potitif
router.put('/:id', highlightsController.updateHighlights);

// Supprimer un point potitif
router.delete('/:id', highlightsController.deleteHighlights);

module.exports = router;