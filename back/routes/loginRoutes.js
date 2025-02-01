const express = require('express');
const router = express.Router();
const { login, checkToken } = require('../controllers/loginController');
const { validateLogin } = require('../validators/loginValidator');
const withAuth = require('../middlewares/withAuth');
const loginLimiter = require('../middlewares/rateLimitMiddleware');

// Route pour la connexion (login)
router.post('/', validateLogin, loginLimiter, login);

// Route pour vérifier le token (reconnexion)
router.get('/checkToken', withAuth, checkToken);

module.exports = router;
