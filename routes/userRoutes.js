const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// créer un utilisateur
router.post('/add', userController.createUser);

// Récupérer tous les utilisateurs
router.get('/', userController.getAllUsers);

// Récupérer un utilisateur par id
router.get('/:id', userController.getUserById);

// Modifier un utilisateur
router.put('/:id', userController.updateUser);

// Supprimer un utilisateur
router.delete('/:id', userController.deleteUser);

module.exports = router;