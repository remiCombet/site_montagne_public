const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StayTheme = sequelize.define(
    'StayTheme',
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
        references: {
          model: 'stays',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      theme_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'themes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'stay_themes',
      timestamps: true,
      underscored: true,
    }
  );

  StayTheme.associate = (models) => {
    StayTheme.belongsTo(models.Stay, {
      foreignKey: 'stay_id',
      as: 'stay',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    StayTheme.belongsTo(models.Theme, {
      foreignKey: 'theme_id',
      as: 'theme',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return StayTheme;
};
