const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');

// créer un acces
router.post('/add', accessController.createAccess);

// Récupérer tous les acces
router.get('/', accessController.getAllAccess);

// Récupérer un acces par id
router.get('/:id', accessController.getAccessById);

// Modifier un acces
router.put('/:id', accessController.updateAccess);

// Supprimer un acces
router.delete('/:id', accessController.deleteAccess);

module.exports = router;