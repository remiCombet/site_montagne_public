const express = require('express');
const router = express.Router();
const stayEquipmentController = require('../controllers/stayEquipmentController');
const { validateAddStayEquipment } = require('../middlewares/stayEquipmentValidator');
const validate = require('../middlewares/validationMiddleware');

// Ajouter une equipement à un séjour
router.post('/add', validateAddStayEquipment, validate, stayEquipmentController.addStayEquipment);

// Récupérer toutes les equipements liées à un séjour
router.get('/:stay_id', stayEquipmentController.getEquipmentsByStay);

// Lister toutes les associations StayEquipment
router.get('/', stayEquipmentController.getAllStayEquipments);

// Supprimer une equipement d'un séjour
router.delete('/:id', stayEquipmentController.removeStayEquipment);

module.exports = router;
