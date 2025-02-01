module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stay_themes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      stay_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'stays',  // Assure-toi que la table `stays` existe déjà
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      theme_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'theme',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('stay_themes');
  },
};
