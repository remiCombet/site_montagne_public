const { body, param } = require('express-validator');

exports.validateCreateUser = [
    body('firstname')
        .trim()
        .escape()
        .notEmpty().withMessage('Le prénom est obligatoire')
        .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères'),

    body('lastname')
        .trim()
        .escape()
        .notEmpty().withMessage('Le nom est obligatoire')
        .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),

    body('email')
        .trim()
        .escape()
        .notEmpty().withMessage("L'email est obligatoire")
        .isEmail().withMessage("L'email n'est pas valide"),

    body('password')
        .notEmpty().withMessage('Le mot de passe est obligatoire')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
        .matches(/[a-z]/).withMessage('Le mot de passe doit contenir au moins une minuscule')
        .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/[\W_]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial'),

    body('phone')
        .trim()
        .notEmpty().withMessage('Le téléphone est obligatoire')
        .matches(/^\+?\d{9,15}$/).withMessage('Le format du téléphone est invalide'),

    body('role')
        .optional()
        .isIn(['admin', 'user']).withMessage('Le rôle doit être "admin" ou "user"'),
];

exports.validateUpdateUser = [
    param('id')
        .isInt().withMessage("L'ID utilisateur doit être un entier"),

    body('firstname')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères'),

    body('lastname')
        .optional()
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),

    body('email')
        .optional()
        .trim()
        .escape()
        .isEmail().withMessage("L'email n'est pas valide"),

    body('phone')
        .optional()
        .trim()
        .escape()
        .matches(/^\+?\d{9,15}$/).withMessage('Le format du téléphone est invalide'),
];

exports.validateUserId = [
    param('id')
        .isInt().withMessage("L'ID utilisateur doit être un entier"),
];
