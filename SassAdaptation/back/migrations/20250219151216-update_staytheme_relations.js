module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("stay_themes", "stay_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "stays",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.changeColumn("stay_themes", "theme_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "theme",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("stay_themes", "stay_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "stays",
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "NO ACTION",
    });

    await queryInterface.changeColumn("stay_themes", "theme_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "theme",
        key: "id",
      },
      onUpdate: "NO ACTION",
      onDelete: "NO ACTION",
    });
  },
};
