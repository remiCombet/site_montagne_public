module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stay_access', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
      access_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'access',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('stay_access');
  },
};
