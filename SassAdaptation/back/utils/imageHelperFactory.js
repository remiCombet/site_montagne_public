const { Op } = require('sequelize');
const CloudinaryService = require('./upload');
const {
    CLOUDINARY_BASE_URL,
    CLOUDINARY_FOLDER_ARTICLES,
    CLOUDINARY_FOLDER_STAYS
} = require('../config/cloudinary');

const createImageHelpers = (entityType, EntityImageModel) => {
    // Déterminer le dossier Cloudinary et la clé étrangère selon le type d'entité
    const cloudinaryFolder = entityType === 'article' ? 'articles' : 'stays';
    const foreignKeyName = entityType === 'article' ? 'article_id' : 'stay_id';
    
    // Créer l'objet helpers
    const helpers = {
        checkImageExists: async (imageUrl) => {
            if (!imageUrl) return false;
            try {
                const publicId = CloudinaryService.getPublicIdFromUrl(imageUrl);
                const result = await CloudinaryService.getImageInfo(publicId);
                return !!result;
            } catch (error) {
                console.error('Erreur vérification image dans Cloudinary:', error);
                return false;
            }
        },

        checkImageExistsInEntity: async (entityId, fileName, excludeImageId = null) => {
            try {
                const whereClause = {
                    [foreignKeyName]: entityId,
                    image_url: {
                        [Op.like]: `%${fileName}%`
                    }
                };
                
                if (excludeImageId) {
                    whereClause.id = {
                        [Op.ne]: excludeImageId
                    };
                }
                
                const existingImage = await EntityImageModel.findOne({
                    where: whereClause
                });
                
                return !!existingImage;
            } catch (error) {
                console.error(`Erreur vérification image dans ${entityType}:`, error);
                return false;
            }
        },

        findImageByUrl: async (imageUrl) => {
            try {
                const image = await EntityImageModel.findOne({
                    where: { image_url: imageUrl }
                });
                return image;
            } catch (error) {
                console.error('Erreur recherche image par URL:', error);
                return null;
            }
        },

        countImageUsage: async (imageUrl, excludeImageId = null) => {
            try {
                const whereClause = { image_url: imageUrl };
                
                if (excludeImageId) {
                    whereClause.id = { [Op.ne]: excludeImageId };
                }
                
                const count = await EntityImageModel.count({ where: whereClause });
                return count;
            } catch (error) {
                console.error('Erreur comptage utilisation image:', error);
                return 0;
            }
        }
    };

    // Ajouter la méthode qui dépend des autres méthodes
    helpers.checkAndGetExistingImage = async (entityId, fileName) => {
        try {
            // Utiliser les références locales au lieu de module.exports
            const imageExistsInEntity = await helpers.checkImageExistsInEntity(entityId, fileName);
            if (imageExistsInEntity) {
                return { exists: true, inEntity: true, url: null };
            }

            const potentialUrl = `${CLOUDINARY_BASE_URL}/site_montagne_v3/${cloudinaryFolder}/${fileName}`;
            const imageExistsInCloudinary = await helpers.checkImageExists(potentialUrl);
            
            if (imageExistsInCloudinary) {
                return { exists: true, inEntity: false, url: potentialUrl };
            }
            
            return { exists: false, inEntity: false, url: null };
        } catch (error) {
            console.error(`Erreur lors de la vérification complète de l'image pour ${entityType}:`, error);
            return { exists: false, inEntity: false, url: null, error };
        }
    };
    
    return helpers;
};

module.exports = {
    createImageHelpers
};