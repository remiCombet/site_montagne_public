const { body, validationResult } = require('express-validator');

// Middleware de validation pour la création et la mise à jour d'un séjour
const validateStay = [
  body('title')
    .trim()
    .escape()
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 255 }).withMessage('Le titre ne peut pas dépasser 255 caractères'),

  body('description')
    .trim()
    .escape()
    .notEmpty().withMessage('La description est obligatoire'),

  body('location')
    .trim()
    .escape()
    .notEmpty().withMessage('Le lieu est obligatoire')
    .isLength({ max: 255 }).withMessage('Le lieu ne peut pas dépasser 255 caractères'),

  body('price')
    .isFloat({ gt: 0 }).withMessage('Le prix doit être un nombre positif'),

  body('physical_level')
    .trim()
    .escape()
    .isIn(['facile', 'modéré', 'sportif', 'difficile', 'extrême'])
    .withMessage('Le niveau physique doit être parmi facile, modéré, sportif, difficile, ou extrême'),

  body('technical_level')
    .trim()
    .escape()
    .isIn(['facile', 'modéré', 'sportif', 'difficile', 'extrême'])
    .withMessage('Le niveau technique doit être parmi facile, modéré, sportif, difficile, ou extrême'),

  body('min_participant')
    .isInt({ min: 1 }).withMessage('Le nombre minimum de participants doit être supérieur à 0'),

  body('max_participant')
    .isInt({ min: 1 }).withMessage('Le nombre maximum de participants doit être supérieur à 0'),

  body('start_date')
    .isISO8601().withMessage('La date de début est invalide')
    .toDate(),

  body('end_date')
    .isISO8601().withMessage('La date de fin est invalide')
    .toDate(),

  body('reception_point_id')
    .isInt().withMessage('L\'ID du point de réception est invalide'),

  body('status')
    .isIn(['en_attente_validation', 'programmé', 'validé', 'supprimé'])
    .withMessage('Le statut doit être parmi "en_attente_validation", "programmé", "validé", ou "supprimé"'),

  body('user_id')
    .isInt().withMessage('L\'ID de l\'utilisateur est invalide'),
];

module.exports = {
  validateStay,
};
