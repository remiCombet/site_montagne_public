module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("stays", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      physical_level: {
        type: Sequelize.ENUM("facile", "modéré", "sportif", "difficile", "extrême"),
        allowNull: false,
      },
      technical_level: {
        type: Sequelize.ENUM("facile", "modéré", "sportif", "difficile", "extrême"),
        allowNull: false,
      },
      min_participant: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      max_participant: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      reception_point_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "reception_point",
          key: "id",
        },
      },
      status: {
        type: Sequelize.ENUM("en_attente_validation", "programmé", "validé", "supprimé"),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("stays");
  },
};
