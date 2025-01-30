const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const StayAccess = sequelize.define(
      'StayAccess',
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
        access_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        tableName: 'stay_access',
        timestamps: false,  // Pas de timestamps
      }
    );
  
    StayAccess.associate = (models) => {
      StayAccess.belongsTo(models.Stay, {
        foreignKey: 'stay_id',
        as: 'stay',
      });
      StayAccess.belongsTo(models.Access, {
        foreignKey: 'access_id',
        as: 'access',
      });
    };
  
    return StayAccess;
  };
  