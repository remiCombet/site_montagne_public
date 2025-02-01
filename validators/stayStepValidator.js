const { check } = require('express-validator');
const { Stay, Accommodation } = require('../models');

module.exports = [
  // Valider que stay_id est un entier positif
  check('stay_id').isInt({ gt: 0 }).withMessage('Le stay_id doit être un entier positif'),

  // Vérifier que stay_id existe dans la table Stay
  check('stay_id').custom(async (value) => {
    const stay = await Stay.findByPk(value);
    if (!stay) {
      throw new Error('Le séjour avec cet ID n\'existe pas');
    }
    return true;
  }),

  // Valider que accommodation_id est un entier positif
  check('accommodation_id').isInt({ gt: 0 }).withMessage('L\'accommodation_id doit être un entier positif'),

  // Vérifier que accommodation_id existe dans la table Accommodation
  check('accommodation_id').custom(async (value) => {
    const accommodation = await Accommodation.findByPk(value);
    if (!accommodation) {
      throw new Error('L\'hébergement avec cet ID n\'existe pas');
    }
    return true;
  }),

  // Valider que step_number est un entier positif
  check('step_number').isInt({ gt: 0 }).withMessage('Le step_number doit être un entier positif'),

  // Valider que title est une chaîne non vide
  check('title').isString().notEmpty().withMessage('Le titre est obligatoire'),

  // Valider que duration est un entier positif
  check('duration').isInt({ gt: 0 }).withMessage('La durée doit être un entier positif'),

  // Valider que elevation_gain, si présent, est un entier positif
  check('elevation_gain').optional().isInt({ gt: 0 }).withMessage('L\'élévation gagnée doit être un entier positif'),

  // Valider que elevation_loss, si présent, est un entier positif
  check('elevation_loss').optional().isInt({ gt: 0 }).withMessage('L\'élévation perdue doit être un entier positif')
];
