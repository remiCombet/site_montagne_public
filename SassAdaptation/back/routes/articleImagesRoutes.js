const express = require('express');
// Pour accéder aux params du parent
const router = express.Router({ mergeParams: true }); 
const articleImageController = require('../controllers/articleImageController');
const validators = require('../validators/articleValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Routes pour ajouter des images
router.post('/', 
    withAuth, 
    withAdminAuth,
    validators.validateImages,
    validate, 
    articleImageController.addImages
);

router.delete('/:imageId', 
    withAuth, 
    withAdminAuth, 
    articleImageController.deleteImage
);

router.put('/:imageId', 
    withAuth, 
    withAdminAuth, 
    // Middleware personnalisé pour sélectionner et appliquer les validations appropriées
    // selon le type de mise à jour demandée
    (req, res, next) => {
        // CAS 1: Mise à jour du texte alternatif (description de l'image)
        if (req.body.image_alt !== undefined) {
            // Applique chaque fonction de validation du tableau validateImageAlt
            // Ces validateurs vérifient que l'alt text respecte les règles (longueur, caractères autorisés, etc.)
            validators.validateImageAlt.forEach(validator => {
                // La fonction vide () => {} est utilisée comme "next" mais ne fait rien
                // Les validateurs accumulent les erreurs dans req.validationErrors sans bloquer le flux
                validator(req, res, () => {});
            });
            // Continue vers la prochaine étape de validation
            next();
        } 
        // CAS 2: Modification du statut de miniature
        else if (req.body.thumbnail !== undefined) {
            // Applique les validateurs spécifiques pour le champ thumbnail
            // Ces validateurs vérifient que la valeur est bien dans les formats acceptés (0, 1, true, false)
            validators.validateThumbnail.forEach(validator => {
                validator(req, res, () => {});
            });
            // Continue vers la validation finale
            next();
        } 
        // CAS 3: Téléchargement d'une nouvelle image (sans changer l'alt text)
        else if (req.files?.image) {
            // Pour les fichiers images, la validation se fait côté contrôleur
            // où nous vérifions le type MIME, la taille, etc.
            next();
        } 
        // CAS 4: Aucune modification valide n'a été envoyée
        else {
            // Retourne une erreur 400 Bad Request si la requête ne contient
            // aucun des champs attendus (image_alt, thumbnail ou image)
            return res.status(400).json({
                status: 400,
                message: "Aucune modification spécifiée"
            });
        }
    },
    validate, 
    articleImageController.updateImage
);

module.exports = router;