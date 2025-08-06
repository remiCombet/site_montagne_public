'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Supprimer la contrainte existante avec le bon nom
    await queryInterface.sequelize.query(
      'ALTER TABLE `article_images` DROP FOREIGN KEY `article_images_ibfk_1`;'
    );

    // Ajouter la nouvelle contrainte avec CASCADE
    await queryInterface.sequelize.query(`
      ALTER TABLE article_images
      ADD CONSTRAINT article_images_ibfk_1
      FOREIGN KEY (article_id) 
      REFERENCES articles(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Retour à la contrainte d'origine
    await queryInterface.sequelize.query(
      'ALTER TABLE `article_images` DROP FOREIGN KEY `article_images_ibfk_1`;'
    );

    await queryInterface.sequelize.query(`
      ALTER TABLE article_images
      ADD CONSTRAINT article_images_ibfk_1
      FOREIGN KEY (article_id) 
      REFERENCES articles(id);
    `);
  }
};