module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stay_steps', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      step_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      elevation_gain: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      elevation_loss: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      stay_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'stays',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      accommodation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accommodation',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('stay_steps');
  },
};
