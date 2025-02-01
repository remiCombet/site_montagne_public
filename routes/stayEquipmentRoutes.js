const express = require('express');
const router = express.Router();
const stayEquipmentController = require('../controllers/stayEquipmentController');

// Ajouter une equipement à un séjour
router.post('/add', stayEquipmentController.addStayEquipment);

// Récupérer toutes les equipements liées à un séjour
router.get('/:stay_id', stayEquipmentController.getEquipmentsByStay);

// Lister toutes les associations StayEquipment
router.get('/', stayEquipmentController.getAllStayEquipments);

// Supprimer une equipement d'un séjour
router.delete('/:id', stayEquipmentController.removeStayEquipment);

module.exports = router;
