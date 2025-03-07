const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const Article = sequelize.define(
      'Article',
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
        short_description: {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        location: {
          type: DataTypes.STRING(255),
          allowNull: true,
          defaultValue: null,
        },
        start_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          defaultValue: null,
        },
        end_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          defaultValue: null,
        },
        id_user: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
      },
      {
        tableName: 'articles',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        underscored: false
      }
    );
  
    Article.associate = (models) => {
        Article.belongsTo(models.User, {
          foreignKey: 'id_user',
          as: 'user',
        });
        Article.hasMany(models.ArticleImage, {
          foreignKey: 'article_id',
          as: 'images',
          onDelete: 'CASCADE'
        });
      };
  
    return Article;
  };
  