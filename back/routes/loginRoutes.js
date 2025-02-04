const express = require('express');
const router = express.Router();
const { login, checkMyToken } = require('../controllers/loginController');
const { validateLogin } = require('../validators/loginValidator');
const withAuth = require('../middlewares/withAuth');
const loginLimiter = require('../middlewares/rateLimitMiddleware');

// Route pour la connexion (login)
// router.post('/', validateLogin, loginLimiter, login);
router.post('/', validateLogin, login);

// Route pour vérifier le token (reconnexion)
router.post('/checkMyToken', withAuth, checkMyToken);

module.exports = router;
