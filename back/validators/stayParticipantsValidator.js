const { body } = require('express-validator');
const { Stay } = require('../models');

// Validation pour l'ajout d'un participant
exports.validateAddStayParticipant = [
  // Vérifier que le `stay_id` est un entier valide
  body('stay_id')
    .isInt({ min: 1 })
    .withMessage('Le ID du séjour doit être un entier valide et supérieur à 0')
    .custom(async (value) => {
      // Vérifier si le séjour existe
      const stay = await Stay.findByPk(value);
      if (!stay) {
        throw new Error("Le séjour spécifié n'existe pas");
      }
      return true;
    }),

  // Vérifier que le `participant_id` est un entier valide
  body('participant_id')
    .isInt({ min: 1 })
    .withMessage('L\'ID du participant doit être un entier valide et supérieur à 0'),

  // Vérifier que le `people_number` est un entier positif
  body('people_number')
    .isInt({ min: 1 })
    .withMessage('Le nombre de personnes doit être un entier valide supérieur ou égal à 1'),

  // Vérifier que le `status` est valide (valeurs autorisées : "en_attente_validation", "validé", "refusé")
  body('status')
    .isIn(['en_attente_validation', 'validé', 'refusé'])
    .withMessage('Le statut doit être l\'un des suivants : "en_attente_validation", "validé", "refusé"'),

  // Vérifier que le `comment` est une chaîne de caractères (optionnel, si fourni il doit être valide)
  body('comment')
    .optional()
    .isString()
    .withMessage('Le commentaire doit être une chaîne de caractères valide')
    .isLength({ max: 500 })
    .withMessage('Le commentaire ne peut pas dépasser 500 caractères')
];
