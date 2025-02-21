const express = require('express');
const router = express.Router();
const stayAccessController = require('../controllers/stayAccessController');
const validate = require('../middlewares/validationMiddleware');
const { validateAddStayAccess } = require('../validators/stayAccessValidator');
const withAdminAuth = require('../middlewares/withAuthAdmin');
const withAuth = require('../middlewares/withAuth');

// nécessaire ???????
// Route pour récupérer toutes les associations StayAccess
router.get('/', stayAccessController.getAllStayAccess);

// Route pour ajouter un accès à un séjour
router.post('/', withAuth, withAdminAuth, validateAddStayAccess, validate, stayAccessController.addStayAccess);

// Route pour récupérer tous les accès liés à un séjour spécifique
router.get('/:stay_id', stayAccessController.getAccessByStay);

// Route pour supprimer un accès lié à un séjour
router.delete('/:id', withAuth, withAdminAuth, stayAccessController.removeStayAccess);

module.exports = router;
