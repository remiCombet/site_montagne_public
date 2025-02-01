const { body, param } = require('express-validator');
const { Highlight } = require('../models');

module.exports = [
    // Validation pour la création et la mise à jour d'un point positif
    body('title')
        .trim().escape()
        .notEmpty().withMessage('Le titre est requis.')
        .isLength({ max: 255 }).withMessage('Le titre ne doit pas dépasser 255 caractères.'),
    
    body('description')
        .trim().escape()
        .notEmpty().withMessage('La description est requise.')
        .isLength({ min: 10 }).withMessage('La description doit comporter au moins 10 caractères.'),
    
    body('stay_id')
        .notEmpty().withMessage('L\'ID du séjour est requis.')
        .isInt().withMessage('L\'ID du séjour doit être un nombre entier.'),

    // Validation pour l'ID du point positif lors des opérations de lecture, modification et suppression
    param('id')
        .isInt().withMessage('L\'ID du point positif doit être un nombre entier.')
        .custom(async (value) => {
            const highlight = await Highlight.findByPk(value);
            if (!highlight) {
                return Promise.reject('Point positif non trouvé.');
            }
        })
];
