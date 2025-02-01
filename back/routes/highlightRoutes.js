const express = require('express');
const router = express.Router();
const highlightsController = require('../controllers/highlightsController');
const validate = require('../middlewares/validationMiddleware');
const highlightValidator = require('../validators/highlightValidator');


// créer un point potitif
router.post('/add', highlightValidator, validate, highlightsController.createHighlights);

// Récupérer tous les points potitifs
router.get('/', highlightsController.getAllHighlights);

// Récupérer un point potitif par id
router.get('/:id', highlightValidator, validate, highlightsController.getHighlightsById);

// Modifier un point potitif
router.put('/:id', highlightValidator, validate, highlightsController.updateHighlights);

// Supprimer un point potitif
router.delete('/:id', highlightValidator, validate, highlightsController.deleteHighlights);

module.exports = router;