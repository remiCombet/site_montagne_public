const { body } = require('express-validator');

module.exports = [
    body('category')
        .trim()
        .escape()
        .notEmpty().withMessage('Le champ catégorie est requis')
        .isString().withMessage('Le champ catégorie doit être une chaîne de caractères'),

    body('informations')
        .trim()
        .escape()
        .notEmpty().withMessage('Le champ informations est requis')
        .isString().withMessage('Le champ informations doit être une chaîne de caractères')
];
