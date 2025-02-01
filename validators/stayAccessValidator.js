// middlewares/stayAccessValidator.js
const { check } = require('express-validator');
const { Stay, Access } = require('../models');

module.exports = {
  // Validator pour ajouter un accès à un séjour
  validateAddStayAccess: [
    // Vérification que le stay_id existe dans la table Stay
    check('stay_id')
      .isInt().withMessage('Le stay_id doit être un entier.')
      .custom(async (value) => {
        const stay = await Stay.findByPk(value);
        if (!stay) {
          throw new Error("Le séjour avec cet ID n'existe pas.");
        }
        return true;
      }),

    // Vérification que l'access_id existe dans la table Access
    check('access_id')
      .isInt().withMessage('Le access_id doit être un entier.')
      .custom(async (value) => {
        const access = await Access.findByPk(value);
        if (!access) {
          throw new Error("L'accès avec cet ID n'existe pas.");
        }
        return true;
      }),
  ]
};
