module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stay_participants', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      people_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      stay_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'stays', // Assure-toi que la table `stays` existe déjà
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      participant_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users', // Assure-toi que la table `users` existe déjà
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
    await queryInterface.dropTable('stay_participants');
  },
};
