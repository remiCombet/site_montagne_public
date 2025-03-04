const express = require('express');
const router = express.Router();
const receptionController = require('../controllers/receptionPointController');
const { validateReceptionPoint } = require('../validators/receptionPointValidator');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Récupérer tous les points de réception
router.get('/', receptionController.getAllReceptionPoints);

// Récupérer le point de réception d'un séjour
router.get('/stay/:stayId', receptionController.getReceptionPointByStayId);

// Récupérer un point de réception par ID
router.get('/:id', receptionController.getReceptionPointById);

// Routes administrateur
router.post('/', withAuth, withAdminAuth, validateReceptionPoint, receptionController.createReceptionPoint);
router.put('/:receptionPointId', withAuth, withAdminAuth, validateReceptionPoint, receptionController.updateReceptionPoint);
router.delete('/:receptionPointId', withAuth, withAdminAuth, receptionController.deleteReceptionPoint);

module.exports = router;
