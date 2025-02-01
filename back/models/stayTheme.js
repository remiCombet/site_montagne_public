const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StayTheme = sequelize.define('StayTheme', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    stay_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'stays',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    theme_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'themes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'stay_themes',
    timestamps: true,
    underscored: true,
  });

  StayTheme.associate = (models) => {
    StayTheme.belongsTo(models.Stay, {
      foreignKey: 'stay_id',
      as: 'stay',
    });
    StayTheme.belongsTo(models.Theme, {
      foreignKey: 'theme_id',
      as: 'theme',
    });
  };

  return StayTheme;
};
