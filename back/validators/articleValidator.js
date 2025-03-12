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
        .trim()
        .notEmpty().withMessage('La description courte est requise.')
        .isLength({ min: 10, max: 500 })
        .withMessage('La description courte doit contenir entre 10 et 500 caractères.')
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
        .notEmpty().withMessage('La date de début est requise.')
        .isISO8601().withMessage('La date de début doit être une date valide (YYYY-MM-DD).')
        .custom((value) => {
            if (!value) return true;
            const startDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return true;
        }),

    body('endDate')
        .notEmpty().withMessage('La date de fin est requise.')
        .isISO8601().withMessage('La date de fin doit être une date valide (YYYY-MM-DD).')
        .custom((value, { req }) => {
            if (!value) return true;
            const endDate = new Date(value);
            const startDate = new Date(req.body.startDate);
            
            if (endDate < startDate) {
                throw new Error('La date de fin doit être postérieure à la date de début.');
            }
            return true;
        }),

    // Validation de l'ID utilisateur
    body('userId')
        .notEmpty().withMessage('L\'ID utilisateur est requis.')
        .isInt().withMessage('L\'ID utilisateur doit être un nombre entier.')
        .toInt(), // Convertir en nombre
];

// Validation spécifique pour les images (ajout multiple)
exports.validateImages = [
    param('id')
        .isInt().withMessage('L\'ID de l\'article doit être un nombre entier.'),

    // Adapté pour gérer à la fois une seule valeur et un tableau
    body('image_alt')
        .custom((value) => {
            // Si c'est un tableau, chaque élément doit être valide
            if (Array.isArray(value)) {
                const invalidAlts = value.filter(alt => 
                    !alt || typeof alt !== 'string' || alt.trim().length < 3 || alt.trim().length > 255);
                
                if (invalidAlts.length > 0) {
                    throw new Error('Toutes les descriptions d\'images doivent contenir entre 3 et 255 caractères.');
                }
                return true;
            }
            
            // Si c'est une string, elle doit être valide
            if (typeof value === 'string') {
                if (value.trim().length < 3 || value.trim().length > 255) {
                    throw new Error('La description de l\'image doit contenir entre 3 et 255 caractères.');
                }
                return true;
            }
            
            // Si aucun alt n'est fourni, c'est OK (on utilisera le nom de fichier)
            if (value === undefined) return true;
            
            throw new Error('Format invalide pour les descriptions d\'images.');
        })
];

// Validation pour la mise à jour du alt text
exports.validateImageAlt = [
    param('imageId')
        .isInt().withMessage('L\'ID de l\'image doit être un nombre entier.'),

    body('image_alt')
        .trim()
        .escape()
        .isLength({ min: 3, max: 255 })
        .withMessage('La description de l\'image doit contenir entre 3 et 255 caractères.')
        .matches(/^[a-zA-Z0-9àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ\s.,!?-]+$/)
        .withMessage('La description ne peut contenir que des lettres, chiffres et caractères spéciaux basiques.')
];

// Validation pour la mise à jour du statut de miniature
exports.validateThumbnail = [
    param('imageId')
        .isInt().withMessage('L\'ID de l\'image doit être un nombre entier.'),

    body('thumbnail')
        .isIn(['0', '1', 0, 1, true, false, 'true', 'false'])
        .withMessage('La valeur de thumbnail doit être 0, 1, true ou false.')
];