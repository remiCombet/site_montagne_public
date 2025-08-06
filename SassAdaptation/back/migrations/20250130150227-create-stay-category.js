module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stay_equipments', {
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
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'category',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('stay_equipments');
  },
};
