const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const StayImage = sequelize.define(
      'StayImage',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        stay_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'stays',
            key: 'id',
          },
        },
        image_url: {
          type: DataTypes.STRING(512),
          allowNull: false,
        },
        image_alt: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        thumbnail: {
          type: DataTypes.TINYINT(1),
          allowNull: false,
          defaultValue: 0,
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
      },
      {
        tableName: 'stay_images',
        timestamps: false,
      }
    );
  
    StayImage.associate = (models) => {
      StayImage.belongsTo(models.Stay, { 
        foreignKey: 'stay_id',
        onDelete: 'CASCADE'
      });
    };
  
    return StayImage;
  };
  