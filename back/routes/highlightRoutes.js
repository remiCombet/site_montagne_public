const express = require('express');
const router = express.Router();
const highlightsController = require('../controllers/highlightsController');
const validate = require('../middlewares/validationMiddleware');
const highlightValidator = require('../validators/highlightValidator');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// créer un point potitif
router.post('/', withAuth, withAdminAuth, highlightValidator, validate, highlightsController.createHighlights);

// Récupérer tous les points potitifs
router.get('/', highlightsController.getAllHighlights);

// Récupérer un point potitif par id
router.get('/:id', withAuth, withAdminAuth, highlightValidator, validate, highlightsController.getHighlightsById);

// récupérer les highlights d'un séjour
router.get('/stays/:stayId', highlightsController.getHighlightsByStayId);

// Modifier un point potitif
router.put('/:id', withAuth, withAdminAuth, highlightValidator, validate, highlightsController.updateHighlights);

// Supprimer un point potitif
router.delete('/:id', withAuth, withAdminAuth, highlightValidator, validate, highlightsController.deleteHighlights);

module.exports = router;