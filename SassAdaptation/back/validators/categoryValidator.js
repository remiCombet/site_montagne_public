const { body, param } = require('express-validator');
const { Category } = require('../models');

module.exports = {
    // Validator pour créer une catégorie
    validateCreateCategory: [
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
            .isLength({ max: 1000 }).withMessage('La description ne doit pas dépasser 1000 caractères.')
    ],

    // Validator pour les opérations nécessitant un ID
    validateCategoryId: [
        param('id')
            .isInt().withMessage('L\'ID de la catégorie doit être un nombre entier.')
            .custom(async (value) => {
                const category = await Category.findByPk(value);
                if (!category) {
                    throw new Error('Catégorie non trouvée.');
                }
                return true;
            })
    ],

    // Validator pour la mise à jour d'une catégorie (combine ID et données)
    validateUpdateCategory: [
        param('id')
            .isInt().withMessage('L\'ID de la catégorie doit être un nombre entier.')
            .custom(async (value) => {
                const category = await Category.findByPk(value);
                if (!category) {
                    throw new Error('Catégorie non trouvée.');
                }
                return true;
            }),
        body('type')
            .optional()
            .trim().escape() 
            .isLength({ max: 255 }).withMessage('Le type ne doit pas dépasser 255 caractères.'),
        body('name')
            .optional()
            .trim().escape() 
            .isLength({ max: 255 }).withMessage('Le nom ne doit pas dépasser 255 caractères.'),
        body('description')
            .optional()
            .trim().escape() 
            .isLength({ max: 1000 }).withMessage('La description ne doit pas dépasser 1000 caractères.')
    ]
};