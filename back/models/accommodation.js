const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const Accommodation = sequelize.define(
      "Accommodation",
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
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        meal_type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        meal_description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        tableName: "accommodation",
        timestamps: true,
      }
    );
    
    Accommodation.associate = (models) => {
      // Association avec StayStep
      Accommodation.hasMany(models.StayStep, {
        foreignKey: "accommodation_id",
        as: "staySteps",
      });
    };
    
    return Accommodation;
  };
  