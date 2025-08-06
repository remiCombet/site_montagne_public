module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameTable('theme', 'themes');  // Renomme la table 'theme' en 'themes'
  },

  down: async (queryInterface) => {
    await queryInterface.renameTable('themes', 'theme');  // Annule le changement et renomme 'themes' en 'theme'
  },
};
