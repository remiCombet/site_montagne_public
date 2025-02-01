const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');
const accessValidator = require('../validators/accessValidator');
const validate = require('../middleware/validate');

// créer un acces
router.post('/add',  accessValidator, validate, accessController.createAccess);

// Récupérer tous les acces
router.get('/', accessController.getAllAccess);

// Récupérer un acces par id
router.get('/:id', accessController.getAccessById);

// Modifier un acces
router.put('/:id', accessValidator, validate, accessController.updateAccess);

// Supprimer un acces
router.delete('/:id', accessController.deleteAccess);

module.exports = router;