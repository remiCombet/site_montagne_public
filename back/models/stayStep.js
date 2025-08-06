const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const StayStep = sequelize.define(
      'StayStep',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        step_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        duration: {
          type: DataTypes.DECIMAL(4,2),
          allowNull: false,
        },        
        elevation_gain: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        elevation_loss: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        stay_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        accommodation_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        tableName: 'stay_steps',
        timestamps: true,
      }
    );
  
    StayStep.associate = (models) => {
      StayStep.belongsTo(models.Stay, {
        foreignKey: 'stay_id',
        as: 'stay',
      });
      StayStep.belongsTo(models.Accommodation, {
        foreignKey: 'accommodation_id',
        as: 'accommodation',
      });
    };
  
    return StayStep;
  };
  