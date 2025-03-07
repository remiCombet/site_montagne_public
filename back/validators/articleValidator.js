const { body, param } = require('express-validator');
const { Article } = require('../models');

exports.validateArticle = [
    // Validation de l'ID article
    param('id')
        .optional({ checkFalsy: true })
        .isInt().withMessage('L\'ID de l\'article doit être un nombre entier.')
        .custom(async (value) => {
            if (!value) return true;
            const article = await Article.findByPk(value);
            if (!article) {
                return Promise.reject('Article non trouvé.');
            }
            return true;
        }),

    // Validation du titre
    body('title')
        .trim()
        .notEmpty().withMessage('Le titre est requis.')
        .isLength({ min: 3, max: 255 })
        .withMessage('Le titre doit contenir entre 3 et 255 caractères.')
        .escape(),

    // Validation de la description courte
    body('shortDescription')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La description courte ne doit pas dépasser 500 caractères.')
        .escape(),

    // Validation du contenu
    body('content')
        .trim()
        .notEmpty().withMessage('Le contenu est requis.')
        .isLength({ min: 10 })
        .withMessage('Le contenu doit contenir au moins 10 caractères.')
        .escape(),

    // Validation de la localisation
    body('location')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('La localisation ne doit pas dépasser 255 caractères.')
        .escape(),

    // Validation des dates
    body('startDate')
        .optional()
        .isISO8601().withMessage('La date de début doit être une date valide.')
        .custom((value) => {
            if (value && new Date(value) < new Date()) {
                throw new Error('La date de début ne peut pas être dans le passé.');
            }
            return true;
        }),

    body('endDate')
        .optional()
        .isISO8601().withMessage('La date de fin doit être une date valide.')
        .custom((value, { req }) => {
            if (value && req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
                throw new Error('La date de fin doit être postérieure à la date de début.');
            }
            return true;
        }),

    // Validation de l'ID utilisateur
    body('userId')
        .notEmpty().withMessage('L\'ID utilisateur est requis.')
        .isInt().withMessage('L\'ID utilisateur doit être un nombre entier.')
];

// Validation spécifique pour les images
exports.validateImages = [
    param('imageId')
        .optional({ checkFalsy: true })
        .isInt().withMessage('L\'ID de l\'image doit être un nombre entier.'),

    body('image_alt')
        .optional()
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('La description de l\'image doit contenir entre 3 et 255 caractères.')
        .escape()
];