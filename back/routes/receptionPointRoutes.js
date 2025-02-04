const express = require('express');
const router = express.Router();
const receptionController = require('../controllers/receptionPointController');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// // Créer un point de réception (authentifié, autorisé administrateur)
// router.post('/add', withAuth, withAdminAuth, receptionController.createReceptionPoint);

// // Récupérer tous les points de réception (authentifié)
// router.get('/', withAuth, receptionController.getAllReceptionPoints);

// // Récupérer un point de réception par ID (authentifié)
// router.get('/:id', withAuth, receptionController.getReceptionPointById);

// Récupérer le point de réception d'un séjour
// router.get('/stay/:stayId/reception', withAuth, receptionController.getReceptionPointByStay);

// // Mettre à jour un point de réception (authentifié, autorisé administrateur)
// router.put('/:id', withAuth, withAdminAuth, receptionController.updateReceptionPoint);

// // Supprimer un point de réception (authentifié, autorisé administrateur)
// router.delete('/:id', withAuth, withAdminAuth, receptionController.deleteReceptionPoint);

// Créer un point de réception (authentifié, autorisé administrateur)
router.post('/add', receptionController.createReceptionPoint);

// Récupérer tous les points de réception (authentifié)
router.get('/', receptionController.getAllReceptionPoints);

// Récupérer un point de réception par ID (authentifié)
router.get('/:id/reception', receptionController.getReceptionPointById);

// Récupérer le point de réception d'un séjour
router.get('/:stayId/reception', receptionController.getReceptionPointByStayId);

// Mettre à jour un point de réception (authentifié, autorisé administrateur)
router.put('/:id', receptionController.updateReceptionPoint);

// Supprimer un point de réception (authentifié, autorisé administrateur)
router.delete('/:id', receptionController.deleteReceptionPoint);

module.exports = router;
