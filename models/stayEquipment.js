const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const StayEquipment = sequelize.define(
      'StayEquipment',
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
        tableName: 'stay_equipments',
        timestamps: false,  // Pas de timestamps
      }
    );
  
    StayEquipment.associate = (models) => {
      StayEquipment.belongsTo(models.Stay, {
        foreignKey: 'stay_id',
        as: 'stay',
      });
      StayEquipment.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
      });
    };
  
    return StayEquipment;
  };
  