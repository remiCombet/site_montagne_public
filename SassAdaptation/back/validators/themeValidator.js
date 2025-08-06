const { body, param } = require('express-validator');
const { Theme } = require('../models');

// Valider la création d'un thème
exports.validateCreateTheme = [
  body('name')
    .notEmpty().withMessage('Le nom du thème est requis.')
    .isLength({ max: 255 }).withMessage('Le nom du thème ne peut pas dépasser 255 caractères.')
    .custom(async (name) => {
      const existingTheme = await Theme.findOne({ where: { name } });
      if (existingTheme) {
        throw new Error('Un thème avec ce nom existe déjà.');
      }
    }),
];

// Valider la modification d'un thème
exports.validateUpdateTheme = [
  param('id')
    .isInt().withMessage('L\'ID du thème doit être un entier valide.')
    .custom(async (id) => {
      const theme = await Theme.findByPk(id);
      if (!theme) {
        throw new Error('Aucun thème trouvé avec cet ID.');
      }
    }),

  body('name')
    .optional()
    .notEmpty().withMessage('Le nom du thème est requis.')
    .isLength({ max: 255 }).withMessage('Le nom du thème ne peut pas dépasser 255 caractères.')
    .custom(async (name, { req }) => {
      const existingTheme = await Theme.findOne({ where: { name } });
      if (existingTheme && existingTheme.id !== req.params.id) {
        throw new Error('Un thème avec ce nom existe déjà.');
      }
    }),
];
