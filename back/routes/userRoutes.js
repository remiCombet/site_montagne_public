const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateCreateUser, validateUpdateUser, validateUserId } = require('../validators/userValidator');

// créer un utilisateur
router.post('/add', validateCreateUser, userController.createUser);

// Récupérer tous les utilisateurs
router.get('/', userController.getAllUsers);

// Récupérer un utilisateur par id
router.get('/:id', validateUserId, userController.getUserById);

// Modifier un utilisateur
router.put('/:id', validateUpdateUser, userController.updateUser);

// Supprimer un utilisateur
router.delete('/:id', validateUserId, userController.deleteUser);

module.exports = router;