const { body } = require('express-validator');

// Middleware de validation pour la création et la mise à jour d'un point de réception
const validateReceptionPoint = [
    body('location')
        .trim()
        .escape()
        .notEmpty().withMessage('Le lieu est obligatoire')
        .isLength({ min: 3 }).withMessage('Le lieu doit contenir au moins 3 caractères')
        .isLength({ max: 200 }).withMessage('Le lieu ne peut pas dépasser 200 caractères'),

    body('contact_name')
        .trim()
        .escape()
        .notEmpty().withMessage('Le nom du contact est obligatoire')
        .isLength({ min: 2 }).withMessage('Le nom du contact doit contenir au moins 2 caractères')
        .isLength({ max: 100 }).withMessage('Le nom du contact ne peut pas dépasser 100 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s-]+$/).withMessage('Le nom du contact ne doit contenir que des lettres, espaces et tirets'),

    body('contact_phone')
        .trim()
        .optional()
        .matches(/^[0-9+\s-]{10,15}$/).withMessage('Le numéro de téléphone doit être valide (10-15 caractères)'),

    body('contact_email')
        .trim()
        .escape()
        .notEmpty().withMessage('L\'email est obligatoire')
        .isEmail().withMessage('L\'email doit être une adresse valide')
        .normalizeEmail(),

    body('opening_time')
        .trim()
        .notEmpty().withMessage('L\'heure d\'ouverture est obligatoire')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('L\'heure d\'ouverture doit être au format HH:MM'),

    body('closing_time')
        .trim()
        .notEmpty().withMessage('L\'heure de fermeture est obligatoire')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('L\'heure de fermeture doit être au format HH:MM')
        .custom((value, { req }) => {
            if (value <= req.body.opening_time) {
                throw new Error('L\'heure de fermeture doit être après l\'heure d\'ouverture');
            }
            return true;
        })
];

module.exports = {
    validateReceptionPoint,
};