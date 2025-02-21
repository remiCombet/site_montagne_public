const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Theme = sequelize.define(
    "Theme",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "themes",
      timestamps: true,
    }
  );

  Theme.associate = (models) => {
    Theme.hasMany(models.StayTheme, {
      foreignKey: "theme_id",
      as: "stayThemes",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Theme;
};
