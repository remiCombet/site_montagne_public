const { ArticleImage } = require('../models');
const { createImageHelpers } = require('./imageHelperFactory');

// Créer les helpers spécifiques aux articles
const articleImageHelpers = createImageHelpers('article', ArticleImage);

// Re-exporter les fonctions pour maintenir la compatibilité avec le code existant
module.exports = {
    ...articleImageHelpers,
    // Alias pour maintenir la compatibilité avec les noms de fonction existants
    checkImageExistsInArticle: articleImageHelpers.checkImageExistsInEntity
};