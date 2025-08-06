const { StayImage } = require('../models');
const { createImageHelpers } = require('./imageHelperFactory');

// Créer les helpers spécifiques aux séjours
const stayImageHelpers = createImageHelpers('stay', StayImage);

// Re-exporter les fonctions pour maintenir la compatibilité
module.exports = {
    ...stayImageHelpers,
    // Alias pour maintenir la compatibilité avec les noms de fonction existants
    checkImageExistsInStay: stayImageHelpers.checkImageExistsInEntity
};