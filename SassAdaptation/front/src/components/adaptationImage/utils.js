/**
 * Utilitaires pour la gestion des images responsives avec Cloudinary
 */

/**
 * Génère une URL Cloudinary optimisée selon le type d'appareil
 * @param {string} imageUrl - URL originale de l'image
 * @param {string} deviceType - Type d'appareil (mobile, tablet, desktop)
 * @param {Object} options - Options personnalisées (crop, gravity, quality, etc.)
 * @returns {string} URL optimisée pour Cloudinary
 */
export const getOptimizedImageUrl = (imageUrl, deviceType = 'desktop', options = {}) => {
    // Image par défaut si aucune URL n'est fournie
    if (!imageUrl) {
        return "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png";
    }
    
    // Configuration par défaut selon le type d'appareil
    const deviceConfig = {
        mobile: {
            width: 640,
            quality: 'auto:eco',
            gravity: 'auto',
            format: 'auto'
        },
        tablet: {
            width: 1024, 
            quality: 'auto:good',
            gravity: 'auto',
            format: 'auto'
        },
        desktop: {
            width: 1920,
            quality: 'auto:best',
            gravity: 'auto',
            format: 'auto'
        }
    };
    
    // Fusionner les options par défaut avec les options personnalisées
    const config = {...deviceConfig[deviceType], ...options};
    
    // Créer la chaîne de transformation Cloudinary
    const transformationString = [
        `w_${config.width}`,
        `c_${options.crop || 'fill'}`,
        `g_${config.gravity}`,
        `q_${config.quality}`,
        `f_${config.format}`
    ].join(',');
    
    // Si l'URL est de Cloudinary, appliquer les transformations
    if (imageUrl.includes('cloudinary.com') && imageUrl.includes('/upload/')) {
        const parts = imageUrl.split('/upload/');
        return `${parts[0]}/upload/${transformationString}/${parts[1]}`;
    }
    
    // Sinon retourner l'URL d'origine
    return imageUrl;
};

/**
 * Récupère les URLs optimisées pour tous les types d'appareils
 * @param {string} imageUrl - URL originale de l'image
 * @param {Object} options - Options de transformation
 * @returns {Object} URLs pour mobile, tablet, desktop
 */
export const getResponsiveImageUrls = (imageUrl, options = {}) => {
    return {
        mobile: getOptimizedImageUrl(imageUrl, 'mobile', options),
        tablet: getOptimizedImageUrl(imageUrl, 'tablet', options),
        desktop: getOptimizedImageUrl(imageUrl, 'desktop', options)
    };
};

/**
 * Obtient une URL optimisée selon le contexte d'utilisation
 * @param {string} imageUrl - URL originale
 * @param {string} context - Contexte d'utilisation (banner, thumbnail, card, gallery)
 * @param {string} deviceType - Type d'appareil
 * @returns {string} URL optimisée
 */
export const getContextualImageUrl = (imageUrl, context = 'banner', deviceType = 'desktop') => {
    // Configurations selon le contexte d'utilisation
    const contextConfig = {
        // Bannières en pleine largeur (16:9)
        banner: {
            crop: 'fill',
            gravity: 'center',
            aspectRatio: '16:9',
            quality: 'auto'
        },
        // Vignettes carrées (1:1)
        thumbnail: {
            crop: 'thumb',
            gravity: 'faces', // Privilégie les visages pour le cadrage
            aspectRatio: '1:1',
            quality: 'auto:good'
        },
        // Cartes d'articles/séjours (4:3)
        card: {
            crop: 'fill',
            gravity: 'auto',
            aspectRatio: '4:3',
            quality: 'auto:good'
        },
        // Images de galerie (optimisées pour le poids)
        gallery: {
            crop: 'scale',
            quality: 'auto:eco'
        }
    };
    
    return getOptimizedImageUrl(imageUrl, deviceType, contextConfig[context] || {});
};