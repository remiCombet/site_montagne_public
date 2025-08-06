const { body, validationResult } = require("express-validator");

// Validation pour se connecter
const validateLogin = [
    body('email')
        .trim()
        .escape()
        .isEmail()
        .withMessage('Veuillez fournir une adresse email valide.')
        .normalizeEmail(),
    
    body('password')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Veuillez fournir un mot de passe.')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères.'),

    // Middleware de validation des erreurs
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = {
    validateLogin
};
