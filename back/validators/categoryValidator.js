const { body, param } = require('express-validator');
const { Category } = require('../models');

module.exports = [
    // Validation pour la création et la mise à jour d'une catégorie
    body('type')
        .trim().escape() 
        .notEmpty().withMessage('Le type est requis.')
        .isLength({ max: 255 }).withMessage('Le type ne doit pas dépasser 255 caractères.'),

    body('name')
        .trim().escape() 
        .notEmpty().withMessage('Le nom est requis.')
        .isLength({ max: 255 }).withMessage('Le nom ne doit pas dépasser 255 caractères.'),

    body('description')
        .optional()
        .trim().escape() 
        .isLength({ max: 1000 }).withMessage('La description ne doit pas dépasser 1000 caractères.'),

    // Validation pour l'ID de la catégorie lors des opérations de lecture, modification et suppression
    param('id')
        .isInt().withMessage('L\'ID de la catégorie doit être un nombre entier.')
        .custom(async (value) => {
            const category = await Category.findByPk(value);
            if (!category) {
                return Promise.reject('Catégorie non trouvée.');
            }
        })
];
