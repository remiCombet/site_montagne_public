const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const Access = sequelize.define(
      "Access",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        category: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        informations: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        tableName: "access",
        timestamps: true,
      }
    );
  
    return Access;
  };
  