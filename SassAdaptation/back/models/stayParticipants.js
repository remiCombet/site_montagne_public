const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const StayParticipant = sequelize.define(
      'StayParticipant',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'en_attente_validation',
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        people_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        stay_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        participant_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        tableName: 'stay_participants',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  
    StayParticipant.associate = (models) => {
      // Association avec le modèle Stay
      StayParticipant.belongsTo(models.Stay, {
        foreignKey: 'stay_id',
        as: 'stay',
      });
  
      // Association avec le modèle User
      StayParticipant.belongsTo(models.User, {
        foreignKey: 'participant_id',
        as: 'participant',
      });
    };
  
    return StayParticipant;
  };
  