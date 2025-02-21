const { body, param } = require('express-validator');
const { Highlight, Stay } = require('../models');

module.exports = [
    // Vérification de l'ID pour les routes qui en ont besoin (GET /:id, PUT /:id, DELETE /:id)
    param('id')
        .optional({ checkFalsy: true }) // Permet d'éviter une erreur si l'ID n'est pas requis
        .isInt().withMessage('L\'ID du point positif doit être un nombre entier.')
        .custom(async (value) => {
            if (!value) return true; // Ne vérifie que si un ID est présent
            const highlight = await Highlight.findByPk(value);
            if (!highlight) {
                return Promise.reject('Point positif non trouvé.');
            }
        }),

    // Validation pour la création et la mise à jour d'un point positif
    body('title')
        .optional() // Pour éviter les erreurs en cas de suppression où le body n'est pas envoyé
        .trim().escape()
        .notEmpty().withMessage('Le titre est requis.')
        .isLength({ max: 255 }).withMessage('Le titre ne doit pas dépasser 255 caractères.'),

    body('description')
        .optional()
        .trim().escape()
        .notEmpty().withMessage('La description est requise.')
        .isLength({ min: 10 }).withMessage('La description doit comporter au moins 10 caractères.'),

    body('stay_id')
        .optional()
        .notEmpty().withMessage('L\'ID du séjour est requis.')
        .isInt().withMessage('L\'ID du séjour doit être un nombre entier.')
        .custom(async (value) => {
            if (!value) return true; // Ne vérifie que si un ID est présent
            const stay = await Stay.findByPk(value);
            if (!stay) {
                return Promise.reject('Séjour non trouvé.');
            }
        }),
];
