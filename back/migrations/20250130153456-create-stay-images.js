module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stay_images', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      stay_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'stays',
          key: 'id',
        },
      },
      image_url: {
        type: Sequelize.STRING(512),
        allowNull: false,
      },
      image_alt: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stay_images');
  },
};
