const { body } = require('express-validator');

module.exports = [
    body('name')
        .trim()
        .escape()
        .notEmpty().withMessage('Le champ nom est requis')
        .isString().withMessage('Le champ nom doit être une chaîne de caractères'),

    body('description')
        .trim()
        .escape()
        .optional()
        .isString().withMessage('Le champ description doit être une chaîne de caractères'),

    body('meal_type')
        .trim()
        .escape()
        .notEmpty().withMessage('Le champ type de repas est requis')
        .isString().withMessage('Le champ type de repas doit être une chaîne de caractères'),

    body('meal_description')
        .trim()
        .escape()
        .optional()
        .isString().withMessage('Le champ description des repas doit être une chaîne de caractères'),
];
