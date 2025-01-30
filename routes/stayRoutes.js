const express = require('express');
const router = express.Router();
const stayController = require('../controllers/stayController');

// créer un séjour
router.post('/add', stayController.createStay);

// Récupérer tous les séjours
router.get('/', stayController.getAllStays);

// Récupérer un séjour par id
router.get('/:id', stayController.getStayById);

// Modifier un séjour
router.put('/:id', stayController.updateStay);

// modifier le statut d'un séjour
router.put('/status/:id', stayController.updateStayStatus)

// Supprimer un séjour
router.delete('/:id', stayController.deleteStay);

module.exports = router;