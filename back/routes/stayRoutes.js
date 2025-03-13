const express = require('express');
const router = express.Router();
const stayController = require('../controllers/stayController');
const { validateStay } = require('../validators/stayValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// créer un séjour
router.post('/', 
    withAuth, 
    withAdminAuth,
    validateStay, 
    validate, 
    stayController.createStay
);

// Récupérer tous les séjours
router.get('/', stayController.getAllStays);

// Récupérer un séjour par id
router.get('/:id', stayController.getStayById);

// Modifier un séjour
router.put('/:id',  withAuth, withAdminAuth, validateStay, validate, stayController.updateStay);

// modifier le statut d'un séjour
router.put('/status/:id', withAuth, withAdminAuth, stayController.updateStayStatus);

// modifier le point de réception d'un séjour
router.patch('/reception-point/:stayId', withAuth, withAdminAuth, stayController.updateStayReceptionPoint);

// Supprimer un séjour
router.delete('/:id', withAuth, withAdminAuth, stayController.deleteStay);

// Récupérer le statut de remplissage d'un séjour
router.get('/fill-status/:id', stayController.getStayFillStatus);

// Routes pour les images des séjours
router.use('/:id/images', require('./stayImagesRoutes'));

module.exports = router;