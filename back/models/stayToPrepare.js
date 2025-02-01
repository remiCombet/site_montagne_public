const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const StayToPrepare = sequelize.define(
      'StayToPrepare',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        stay_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        category_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        tableName: 'stay_to_prepare',
        timestamps: false,
      }
    );
  
    StayToPrepare.associate = (models) => {
      StayToPrepare.belongsTo(models.Stay, {
        foreignKey: 'stay_id',
        as: 'stay',
      });
      StayToPrepare.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
      });
    };
  
    return StayToPrepare;
  };
  