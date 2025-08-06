const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const ArticleImage = sequelize.define(
      'ArticleImage',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        article_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'articles',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE' 
        },
        image_url: {
          type: DataTypes.STRING(512),
          allowNull: false,
        },
        image_alt: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        thumbnail: {
          type: DataTypes.TINYINT(1),
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        tableName: 'article_images',
        timestamps: false,
        underscored: true
      }
    );
  
    ArticleImage.associate = (models) => {
      ArticleImage.belongsTo(models.Article, {
        foreignKey: 'article_id',
        as: 'article',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE' 
      });
    };
  
    return ArticleImage;
  };
  