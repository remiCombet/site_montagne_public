// middlewares/stayEquipmentValidator.js
const { check } = require('express-validator');
const { Stay, Category } = require('../models');

module.exports = {
  validateAddStayEquipment: [
    check('stay_id')
      .isInt().withMessage('Le stay_id doit être un entier.')
      .custom(async (value) => {
        const stay = await Stay.findByPk(value);
        if (!stay) {
          throw new Error("Le séjour avec cet ID n'existe pas");
        }
        return true;
      }),
      
    check('category_id')
      .isInt().withMessage('Le category_id doit être un entier.')
      .custom(async (value) => {
        const category = await Category.findByPk(value);
        if (!category) {
          throw new Error("La catégorie avec cet ID n'existe pas");
        }
        return true;
      }),
  ]
};
