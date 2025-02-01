const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const Category = sequelize.define(
      "Category",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        tableName: "category",
        timestamps: true,
      }
    );
  
    return Category;
  };
  