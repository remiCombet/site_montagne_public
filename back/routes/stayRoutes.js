const express = require('express');
const router = express.Router();
const stayController = require('../controllers/stayController');
const { validateStay } = require('../validators/stayValidator');
const validate = require('../middlewares/validationMiddleware');

// créer un séjour
router.post('/add', validateStay, validate, stayController.createStay);

// Récupérer tous les séjours
router.get('/', stayController.getAllStays);

// Récupérer un séjour par id
router.get('/:id', stayController.getStayById);

// Modifier un séjour
router.put('/:id', validateStay, validate,stayController.updateStay);

// modifier le statut d'un séjour
router.put('/status/:id', stayController.updateStayStatus)

// Supprimer un séjour
router.delete('/:id', stayController.deleteStay);

module.exports = router;