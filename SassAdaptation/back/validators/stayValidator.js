const { body, param, validationResult } = require('express-validator');
const { Stay } = require('../models');

// Middleware de validation pour la création et la mise à jour d'un séjour
const validateStay = [
  body('title')
    .trim()
    .escape()
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 255 }).withMessage('Le titre ne peut pas dépasser 255 caractères'),

  body('description')
    .trim()
    .escape()
    .notEmpty().withMessage('La description est obligatoire'),

  body('location')
    .trim()
    .escape()
    .notEmpty().withMessage('Le lieu est obligatoire')
    .isLength({ max: 255 }).withMessage('Le lieu ne peut pas dépasser 255 caractères'),

  body('price')
    .isFloat({ gt: 0 }).withMessage('Le prix doit être un nombre positif'),

  body('physical_level')
    .trim()
    .escape()
    .isIn(['facile', 'modéré', 'sportif', 'difficile', 'extrême'])
    .withMessage('Le niveau physique doit être parmi facile, modéré, sportif, difficile, ou extrême'),

  body('technical_level')
    .trim()
    .escape()
    .isIn(['facile', 'modéré', 'sportif', 'difficile', 'extrême'])
    .withMessage('Le niveau technique doit être parmi facile, modéré, sportif, difficile, ou extrême'),

  body('min_participant')
    .isInt({ min: 1 }).withMessage('Le nombre minimum de participants doit être supérieur à 0'),

  body('max_participant')
    .isInt({ min: 1 }).withMessage('Le nombre maximum de participants doit être supérieur à 0')
    .custom((value, { req }) => {
      if (parseInt(value) < parseInt(req.body.min_participant)) {
        throw new Error('Le nombre maximum de participants doit être supérieur ou égal au nombre minimum');
      }
      return true;
    }),

  body('start_date')
    .isISO8601().withMessage('La date de début est invalide')
    .toDate(),

  body('end_date')
    .isISO8601().withMessage('La date de fin est invalide')
    .toDate()
    .custom((value, { req }) => {
      if (value < req.body.start_date) {
        throw new Error('La date de fin doit être postérieure à la date de début');
      }
      return true;
    }),

  body('reception_point_id')
    .isInt().withMessage('L\'ID du point de réception est invalide'),

  body('user_id')
    .isInt().withMessage('L\'ID de l\'utilisateur est invalide'),
    
  // Valider les champs d'image de manière optionnelle
  body('imageAlts')
    .optional()
    .custom(value => {
      // Si présent, doit être une chaîne ou un tableau
      if (value !== undefined) {
        const isArray = Array.isArray(value);
        const isString = typeof value === 'string';
        
        if (!isArray && !isString) {
          throw new Error('imageAlts doit être une chaîne ou un tableau');
        }
      }
      return true;
    })
];

// Validation pour les images (ajout multiple)
const validateStayImages = [
  param('id')
      .isInt().withMessage('L\'ID du séjour doit être un nombre entier.'),

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
const validateImageAlt = [
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
const validateThumbnail = [
  param('imageId')
      .isInt().withMessage('L\'ID de l\'image doit être un nombre entier.'),

  body('thumbnail')
      .isIn(['0', '1', 0, 1, true, false, 'true', 'false'])
      .withMessage('La valeur de thumbnail doit être 0, 1, true ou false.')
];

module.exports = {
  validateStay,
  validateStayImages,
  validateImageAlt,
  validateThumbnail
};