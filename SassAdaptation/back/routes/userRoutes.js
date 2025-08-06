const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateCreateUser, validateUpdateUser, validateUserId } = require('../validators/userValidator');
const withAdminAuth = require('../middlewares/withAuthAdmin');
const withAuth = require('../middlewares/withAuth');

// créer un utilisateur
router.post('/sign-up', validateCreateUser, userController.createUser);

// Récupérer tous les utilisateurs
router.get('/', withAuth, withAdminAuth, userController.getAllUsers);

// Récupérer un utilisateur par id
router.get('/:id', withAuth, validateUserId, userController.getUserById);

// Modifier un utilisateur
router.put('/:id', withAuth, validateUpdateUser, userController.updateUser);

// Supprimer un utilisateur
router.delete('/:id', withAuth, withAdminAuth, validateUserId, userController.deleteUser);

module.exports = router;