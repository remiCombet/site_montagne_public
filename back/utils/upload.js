const { format } = require('path');
const {
    cloudinary,
    CLOUDINARY_FOLDER_ARTICLES,
    CLOUDINARY_FOLDER_STAYS
} = require('../config/cloudinary');

class CloudinaryService {
    // fonction d'upload sur cloudinary
    static async uploadImage(file, folder, filename) {
        try {
            const uploadFolder = folder === 'articles' ? 'articles' : 'stays';
            
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: `site_montagne_v3/${uploadFolder}`,
                public_id: filename.replace(/\.[^/.]+$/, ""),
                resource_type: 'auto'
            });

            return { url: result.secure_url };
        } catch (error) {
            throw new Error(`Erreur upload Cloudinary: ${error.message}`);
        }
    }

    // fonction de suppression sur cloudinary
    static async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result.result === 'ok';
        } catch (error) {
            console.error('Erreur suppression Cloudinary:', error);
            throw new Error(`Échec de la suppression sur Cloudinary: ${error.message}`);
        }
    }

    // fonction de vérification de l'existence d'une image sur cloudinary
    static async isImageValid(publicId) {
        try {
            const result = await cloudinary.api.resource(publicId);
            return Boolean(result);
        } catch (error) {
            if (error.http_code === 404) {
                return false;
            }
            throw error;
        }
    }

    // fonction de récupération de l'url d'une image sur cloudinary
    static getPublicIdFromUrl(url) {
        try {
            // Regex pour gérer les deux types de dossiers
            const regex = /site_montagne_v3\/(articles|stays)\/([^/]+)\.(?:jpg|jpeg|png|gif|webp)$/i;
            const match = url.match(regex);
            if (!match) return null;
            
            // On retourne le chemin complet incluant le dossier
            return `site_montagne_v3/${match[1]}/${match[2]}`;
        } catch (error) {
            console.error('Erreur extraction publicId:', error);
            return null;
        }
    }

     /**
     * Génère un nom de fichier sécurisé
     * @param {string} originalName - Nom original du fichier
     * @returns {string} Nom de fichier sécurisé
     */
     static generateSafeFileName(originalName) {
        return originalName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Vérifie si le type de fichier est une image autorisée
     * @param {string} mimeType - Type MIME du fichier
     * @returns {boolean}
     */
    static isAllowedImageType(mimeType) {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ];
        return allowedTypes.includes(mimeType);
    }

    static async getImageInfo(publicId) {
        try {
            const result = await cloudinary.api.resource(publicId);
            return result;
        } catch (error) {
            if (error.http_code === 404) {
                return null;
            }
            throw error;
        }
    }
}

module.exports = CloudinaryService;