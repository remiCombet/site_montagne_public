const {DataTypes} = require("sequelize");

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
        tableName: "theme",
        timestamps: true,
      }
    );
  
    return Theme;
  };
  