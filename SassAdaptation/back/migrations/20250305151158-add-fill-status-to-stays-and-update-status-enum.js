// Dans le fichier de migration généré
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Pour MySQL, nous n'avons pas besoin de créer un type ENUM séparé
    
    // 1. Ajouter la colonne fill_status
    await queryInterface.addColumn('stays', 'fill_status', {
      type: Sequelize.ENUM('participants_insuffisants', 'en_attente_de_validation', 'complet'),
      allowNull: false,
      defaultValue: 'en_attente_de_validation'
    });

    // 2. Copier les valeurs appropriées de status vers fill_status
    await queryInterface.sequelize.query(`
      UPDATE stays 
      SET fill_status = CASE
        WHEN status = 'participants_insuffisants' THEN 'participants_insuffisants'
        WHEN status = 'en_attente_de_validation' THEN 'en_attente_de_validation'
        WHEN status = 'complet' THEN 'complet'
        ELSE 'en_attente_de_validation'
      END;
    `);
    
    // 3. Modifier la colonne status pour utiliser un nouvel ENUM
    // Note: MySQL ne permet pas de changer directement un ENUM, nous devons donc recréer la colonne
    
    // 3.1. Créer une colonne temporaire
    await queryInterface.addColumn('stays', 'status_new', {
      type: Sequelize.ENUM('en_attente', 'validé', 'refusé', 'annulé'),
      allowNull: true
    });
    
    // 3.2. Migrer les données
    await queryInterface.sequelize.query(`
      UPDATE stays 
      SET status_new = CASE
        WHEN status = 'validé' THEN 'validé'
        WHEN status = 'supprimé' THEN 'annulé'
        ELSE 'en_attente'
      END;
    `);
    
    // 3.3. Supprimer l'ancienne colonne
    await queryInterface.removeColumn('stays', 'status');
    
    // 3.4. Renommer la nouvelle colonne
    await queryInterface.renameColumn('stays', 'status_new', 'status');
    
    // 3.5. Mettre à jour les contraintes sur la colonne
    await queryInterface.changeColumn('stays', 'status', {
      type: Sequelize.ENUM('en_attente', 'validé', 'refusé', 'annulé'),
      allowNull: false,
      defaultValue: 'en_attente'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // En cas de rollback
    
    // 1. Créer une colonne temporaire avec l'ancien ENUM
    await queryInterface.addColumn('stays', 'status_old', {
      type: Sequelize.ENUM('participants_insuffisants', 'en_attente_de_validation', 'validé', 'supprimé', 'complet'),
      allowNull: true
    });
    
    // 2. Migrer les données vers l'ancien format
    await queryInterface.sequelize.query(`
      UPDATE stays 
      SET status_old = CASE
        WHEN status = 'validé' THEN 'validé'
        WHEN status = 'annulé' THEN 'supprimé'
        WHEN fill_status = 'participants_insuffisants' THEN 'participants_insuffisants'
        WHEN fill_status = 'en_attente_de_validation' THEN 'en_attente_de_validation'
        WHEN fill_status = 'complet' THEN 'complet'
        ELSE 'en_attente_de_validation'
      END
    `);
    
    // 3. Supprimer les nouvelles colonnes
    await queryInterface.removeColumn('stays', 'status');
    await queryInterface.removeColumn('stays', 'fill_status');
    
    // 4. Renommer la colonne temporaire
    await queryInterface.renameColumn('stays', 'status_old', 'status');
    
    // 5. Mettre à jour les contraintes
    await queryInterface.changeColumn('stays', 'status', {
      type: Sequelize.ENUM('participants_insuffisants', 'en_attente_de_validation', 'validé', 'supprimé', 'complet'),
      allowNull: false,
      defaultValue: 'en_attente_de_validation'
    });
  }
};