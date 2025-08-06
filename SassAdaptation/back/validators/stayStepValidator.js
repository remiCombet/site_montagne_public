const { check, param } = require('express-validator');
const { Stay, Accommodation } = require('../models');

module.exports = [
  // Valider que stayId dans l'URL est un entier positif
  param('stayId')
    .isInt({ gt: 0 }).withMessage('Le stay_id doit être un entier positif')
    .custom(async (value) => {
      const stay = await Stay.findByPk(value);
      if (!stay) {
        throw new Error('Le séjour avec cet ID n\'existe pas');
      }
      return true;
    }),

  // Valider que accommodation_id est un entier positif
  check('accommodation_id')
    .isInt({ gt: 0 }).withMessage('L\'accommodation_id doit être un entier positif')
    .custom(async (value) => {
      const accommodation = await Accommodation.findByPk(value);
      if (!accommodation) {
        throw new Error('L\'hébergement avec cet ID n\'existe pas');
      }
      return true;
    }),

  // Valider que step_number est un entier positif
  check('step_number')
    .isInt({ gt: 0 }).withMessage('Le step_number doit être un entier positif'),

  // Valider que title est une chaîne non vide
  check('title')
    .isString().notEmpty().withMessage('Le titre est obligatoire'),

  // Valider que duration est un nombre décimal positif (DECIMAL(4,2))
  check('duration')
    .isFloat({ min: 0.01 }).withMessage('La durée doit être un nombre positif'),

  // Valider que elevation_gain, si présent, est un entier positif
  check('elevation_gain')
    .optional().isInt({ min: 0 }).withMessage('L\'élévation gagnée doit être un entier positif ou nulle'),

  // Valider que elevation_loss, si présent, est un entier positif ou nul
  check('elevation_loss')
    .optional().isInt({ min: 0 }).withMessage('L\'élévation perdue doit être un entier positif ou nulle')
];
