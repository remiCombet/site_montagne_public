// validators/stayThemeValidator.js
const { check } = require('express-validator');
const { Stay, Theme } = require('../models');

module.exports = [
  // Validation du stay_id : doit être un entier positif
  check('stay_id')
    .isInt({ gt: 0 })
    .withMessage('Le stay_id doit être un entier positif')
    .custom(async (value) => {
      const stay = await Stay.findByPk(value);
      if (!stay) {
        throw new Error('Le séjour avec cet ID n\'existe pas');
      }
      return true;
    }),

  // Validation du theme_id : doit être un entier positif
  check('theme_id')
    .isInt({ gt: 0 })
    .withMessage('Le theme_id doit être un entier positif')
    .custom(async (value) => {
      const theme = await Theme.findByPk(value);
      if (!theme) {
        throw new Error('Le thème avec cet ID n\'existe pas');
      }
      return true;
    }),
];
