const { body } = require('express-validator');

// Validation du formulaire de contact
exports.validateContactForm = [
  body('message')
    .notEmpty().withMessage('Le message ne peut pas être vide')
    .isLength({ max: 2000 }).withMessage('Le message ne doit pas dépasser 2000 caractères'),
  
  body('name')
    .optional()
    .isLength({ max: 100 }).withMessage('Le nom ne doit pas dépasser 100 caractères'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Adresse email invalide')
    .isLength({ max: 100 }).withMessage('L\'email ne doit pas dépasser 100 caractères')
];