// validators/stayToPrepareValidator.js
const { check } = require('express-validator');
const { Stay, Category } = require('../models');

module.exports = [
  // Valider que stay_id est un entier positif
  check('stay_id').isInt({ gt: 0 }).withMessage('Le stay_id doit être un entier positif'),

  // Valider que category_id est un entier positif
  check('category_id').isInt({ gt: 0 }).withMessage('Le category_id doit être un entier positif'),

  // Vérification que stay_id existe dans la table Stay
  check('stay_id').custom(async (value) => {
    const stay = await Stay.findByPk(value);
    if (!stay) {
      throw new Error('Le séjour avec cet ID n\'existe pas');
    }
    return true;
  }),

  // Vérification que category_id existe dans la table Category
  check('category_id').custom(async (value) => {
    const category = await Category.findByPk(value);
    if (!category) {
      throw new Error('La catégorie avec cet ID n\'existe pas');
    }
    return true;
  })
];
