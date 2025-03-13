'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Étape 1 : Récupérer tous les séjours qui ont des images
    const [stays] = await queryInterface.sequelize.query(
      `SELECT DISTINCT stay_id FROM stay_images`
    );
    
    for (const stay of stays) {
      const stayId = stay.stay_id;
      
      // D'abord, mettre toutes les images à thumbnail = 0
      await queryInterface.sequelize.query(
        `UPDATE stay_images SET thumbnail = 0 WHERE stay_id = ${stayId}`
      );
      
      // Étape 1: Récupérer l'ID de l'image la plus récente pour ce séjour
      const [latestImages] = await queryInterface.sequelize.query(
        `SELECT id FROM stay_images 
         WHERE stay_id = ${stayId} 
         ORDER BY id DESC 
         LIMIT 1`
      );
      
      // Vérifier si nous avons trouvé une image
      if (latestImages && latestImages.length > 0) {
        const latestImageId = latestImages[0].id;
        
        // Étape 2: Mettre à jour cette image spécifique comme thumbnail
        await queryInterface.sequelize.query(
          `UPDATE stay_images SET thumbnail = 1 WHERE id = ${latestImageId}`
        );
        
        // Étape 3: Supprimer toutes les autres images de ce séjour
        await queryInterface.sequelize.query(
          `DELETE FROM stay_images WHERE stay_id = ${stayId} AND id != ${latestImageId}`
        );
      }
    }
    
    return Promise.resolve();
  },

  async down(queryInterface, Sequelize) {
    // Cette migration n'est pas facilement réversible
    console.log('Cette migration ne peut pas être annulée');
    return Promise.resolve();
  }
};