const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
  const Stay = sequelize.define(
    'Stay',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      physical_level: {
        type: DataTypes.ENUM('facile', 'modéré', 'sportif', 'difficile', 'extrême'),
        allowNull: false,
      },
      technical_level: {
        type: DataTypes.ENUM('facile', 'modéré', 'sportif', 'difficile', 'extrême'),
        allowNull: false,
      },
      min_participant: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      max_participant: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      reception_point_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('participants_insuffisants', 'en_attente_de_validation', 'validé', 'supprimé'),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'stays',
      timestamps: true,
    }
  );

  Stay.associate = (models) => {
    Stay.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    Stay.belongsTo(models.ReceptionPoint, {
      foreignKey: 'reception_point_id',
      as: 'receptionPoint',
    });

    Stay.hasMany(models.StayEquipment, {
      foreignKey: 'stay_id',
      as: 'equipments',
    });

    Stay.hasMany(models.StayTheme, {
      foreignKey: 'stay_id',
      as: 'stayThemes',
    });

    Stay.hasMany(models.StayStep, {
      foreignKey: 'stay_id',
      as: 'staySteps',
    });

    Stay.hasMany(models.StayToPrepare, {
      foreignKey: 'stay_id' ,
      as: 'toPrepares',
    });
  };

  return Stay;
};
