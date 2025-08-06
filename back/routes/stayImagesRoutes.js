const express = require('express');
// Pour accéder aux params du parent
const router = express.Router({ mergeParams: true }); 
const stayImageController = require('../controllers/stayImageController');
const validators = require('../validators/stayValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Routes pour ajouter des images à un séjour
router.post('/', 
    withAuth, 
    withAdminAuth, 
    validators.validateStayImages,
    validate, 
    stayImageController.addImages
);

// Route pour supprimer une image d'un séjour
router.delete('/:imageId', 
    withAuth, 
    withAdminAuth, 
    stayImageController.deleteImage
);

// Route pour mettre à jour une image d'un séjour
router.put('/:imageId', 
    withAuth, 
    withAdminAuth, 
    // Middleware pour appliquer les validations appropriées selon le type de mise à jour
    (req, res, next) => {
        // Mise à jour du texte alternatif
        if (req.body.image_alt !== undefined) {
            validators.validateImageAlt.forEach(validator => {
                validator(req, res, () => {});
            });
            next();
        } 
        // Modification du statut de miniature
        else if (req.body.thumbnail !== undefined) {
            validators.validateThumbnail.forEach(validator => {
                validator(req, res, () => {});
            });
            next();
        } 
        // Téléchargement d'une nouvelle image
        else if (req.files?.image) {
            // Validation du fichier dans le contrôleur
            next();
        } 
        // Aucune modification valide
        else {
            return res.status(400).json({
                status: 400,
                message: "Aucune modification spécifiée"
            });
        }
    },
    validate, 
    stayImageController.updateImage
);

// Routes spécifiques pour modifier uniquement certains aspects
router.patch('/:imageId/alt',
    withAuth,
    withAdminAuth,
    validators.validateImageAlt,
    validate,
    (req, res, next) => {
        // Assurer que seul le champ image_alt est passé au contrôleur
        req.body = { image_alt: req.body.image_alt };
        stayImageController.updateImage(req, res, next);
    }
);

module.exports = router;