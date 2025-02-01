const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const Highlight = sequelize.define(
      'Highlight',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
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
        stay_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        tableName: 'highlights',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    );
  
    Highlight.associate = (models) => {
      // Association avec le modèle Stay
      Highlight.belongsTo(models.Stay, {
        foreignKey: 'stay_id',
        as: 'stay',
      });
    };
  
    return Highlight;
  };
  