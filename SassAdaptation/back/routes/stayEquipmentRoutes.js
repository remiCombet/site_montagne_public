const express = require('express');
const router = express.Router();
const stayEquipmentController = require('../controllers/stayEquipmentController');
const { validateAddStayEquipment, validateDeleteStayEquipment } = require('../validators/stayEquipmentValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Ajouter une equipement à un séjour
router.post('/stay/:stay_id', withAuth, withAdminAuth, validateAddStayEquipment, validate, stayEquipmentController.addStayEquipment);

// Récupérer toutes les equipements liées à un séjour
router.get('/stay/:stay_id', stayEquipmentController.getEquipmentsByStay);

// utile ?
// Lister toutes les associations StayEquipment
router.get('/', withAuth, withAdminAuth, stayEquipmentController.getAllStayEquipments);

// Supprimer une equipement d'un séjour
router.delete('/stay/:stay_id/:category_id', withAuth, withAdminAuth, validateDeleteStayEquipment, validate, stayEquipmentController.removeStayEquipment);

module.exports = router;
