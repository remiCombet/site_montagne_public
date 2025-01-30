module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('article_images', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      article_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'articles',
          key: 'id',
        },
      },
      image_url: {
        type: Sequelize.STRING(512),
        allowNull: false,
      },
      image_alt: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      thumbnail: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('article_images');
  },
};
