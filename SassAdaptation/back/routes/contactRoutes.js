const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validateContactForm } = require('../validators/contactValidator');
const validate = require('../middlewares/validationMiddleware');
const contactRateLimiter = require('../middlewares/contactRateLimiter');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Route publique pour l'envoi de messages
router.post('/', 
  contactRateLimiter, 
  validateContactForm,
  validate,
  contactController.sendContactMessage
);

// Route protégée pour consulter les logs
router.get('/logs', 
  withAuth, 
  withAdminAuth,
  contactController.getContactLogs
);

module.exports = router;