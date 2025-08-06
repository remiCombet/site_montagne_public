const { param } = require('express-validator');
const { Stay, Access } = require('../models');

module.exports = {
  // Validator pour ajouter un accès à un séjour
  validateAddStayAccess: [
    // Vérification que le stayId existe dans la table Stay
    param('stayId')
      .isInt().withMessage('Le stayId doit être un entier.')
      .custom(async (value) => {
        const stay = await Stay.findByPk(value);
        if (!stay) {
          throw new Error("Le séjour avec cet ID n'existe pas.");
        }
        return true;
      }),

    // Vérification que l'accessId existe dans la table Access
    param('accessId')
      .isInt().withMessage('Le accessId doit être un entier.')
      .custom(async (value) => {
        const access = await Access.findByPk(value);
        if (!access) {
          throw new Error("L'accès avec cet ID n'existe pas.");
        }
        return true;
      }),
  ]
};