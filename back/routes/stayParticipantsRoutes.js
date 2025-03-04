const express = require('express');
const router = express.Router();

// Contrôleur pour les participants du séjour
const stayParticipantsController = require('../controllers/stayParticipantsController');

// Middleware de validation pour l'ajout d'un participant à un séjour
const { validateAddStayParticipant } = require('../validators/stayParticipantsValidator');

// Middleware de validation générique pour l'API
const validate = require('../middlewares/validationMiddleware');

// Middlewares d'authentification
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Middleware pour vérifier la capacité maximale des participants
const checkMaxParticipants = require('../middlewares/checkMaxParticipants');

// router.post('/', stayParticipantsController.addStayParticipant);
router.put('/:id', stayParticipantsController.updateStayParticipant);
router.put('/admin/:id', stayParticipantsController.adminUpdateStayParticipantStatus);
router.delete('/:id', stayParticipantsController.deleteStayParticipant);
router.get('/stay/:stay_id', stayParticipantsController.getStayParticipants);
router.get('/', stayParticipantsController.getAllStayParticipants);



// /**
//  * Ajouter un participant à un séjour (demande de réservation)
//  * - Accessible uniquement aux utilisateurs authentifiés
//  * - Vérification de la capacité maximale avant d'ajouter
//  */
router.post('/', withAuth, checkMaxParticipants, validateAddStayParticipant, validate, stayParticipantsController.addStayParticipant);

// /**
//  * Mettre à jour une demande de réservation (stayParticipant)
//  * - Accessible uniquement aux utilisateurs authentifiés
//  * - Les utilisateurs ne peuvent pas modifier le statut
//  */
// router.put('/:id', withAuth, stayParticipantsController.updateStayParticipant);

// /**
//  * Mettre à jour le statut d'un participant par un administrateur
//  * - Accessible uniquement aux administrateurs
//  * - Permet de changer le statut d'une demande de réservation
//  */
router.patch('/admin/:id', withAuth, withAdminAuth, stayParticipantsController.adminUpdateStayParticipantStatus);

// /**
//  * Supprimer une demande de réservation (stayParticipant)
//  * - Accessible uniquement aux utilisateurs authentifiés
//  */
// router.delete('/:id', withAuth, stayParticipantsController.deleteStayParticipant);

// /**
//  * Récupérer tous les participants d'un séjour donné
//  * - Accessible à tous les utilisateurs authentifiés
//  */
// router.get('/stay/:stay_id', withAuth, stayParticipantsController.getStayParticipants);

// /**
//  * (Optionnel) Récupérer tous les participants (accessible aux administrateurs)
//  * - Permet de lister toutes les demandes de réservation
//  */
// router.get('/', withAuth, withAdminAuth, stayParticipantsController.getAllStayParticipants);

module.exports = router;
