const express = require('express');
const router = express.Router();
const stayAccessController = require('../controllers/stayAccessController');

// Route pour récupérer toutes les associations StayAccess
router.get('/', stayAccessController.getAllStayAccess);

// Route pour ajouter un accès à un séjour
router.post('/add', stayAccessController.addStayAccess);

// Route pour récupérer tous les accès liés à un séjour spécifique
router.get('/:stay_id', stayAccessController.getAccessByStay);

// Route pour supprimer un accès lié à un séjour
router.delete('/:id', stayAccessController.removeStayAccess);

module.exports = router;
