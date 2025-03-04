const express = require('express');
const router = express.Router();
const stayController = require('../controllers/stayController');
const { validateStay } = require('../validators/stayValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// créer un séjour
router.post('/', validateStay, validate, stayController.createStay);

// Récupérer tous les séjours
router.get('/', stayController.getAllStays);

// Récupérer un séjour par id
router.get('/:id', stayController.getStayById);

// Modifier un séjour
router.put('/:id', withAuth, withAdminAuth, validateStay, validate, stayController.updateStay);

// modifier le statut d'un séjour
router.put('/status/:id', stayController.updateStayStatus);

// modifier le point de réception d'un séjour
router.patch('/reception-point/:stayId', withAuth, withAdminAuth, stayController.updateStayReceptionPoint);

// Supprimer un séjour
router.delete('/:id', stayController.deleteStay);

module.exports = router;