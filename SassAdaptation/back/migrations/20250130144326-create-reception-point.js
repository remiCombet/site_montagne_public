module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("reception_point", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      opening_time: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      closing_time: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable("reception_point");
  },
};
