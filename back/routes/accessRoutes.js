const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');
const accessValidator = require('../validators/accessValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');
const decodeGetData = require('../middlewares/decodeData');

// créer un acces
router.post('/', withAuth, withAdminAuth, accessValidator, validate, accessController.createAccess);

// Récupérer tous les acces
router.get('/', decodeGetData, accessController.getAllAccess);

// Récupérer un acces par id
router.get('/:id', withAuth, withAdminAuth, decodeGetData, accessController.getAccessById);

// Modifier un acces
router.put('/:id', withAuth, withAdminAuth, accessValidator, validate, accessController.updateAccess);

// Supprimer un acces
router.delete('/:id', withAuth, withAdminAuth, accessController.deleteAccess);

module.exports = router;