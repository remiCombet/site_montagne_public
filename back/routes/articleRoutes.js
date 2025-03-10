const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { validateArticle, validateImages } = require('../validators/articleValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Routes publiques pour les articles
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);

// Routes protégées pour les articles
router.post('/', 
    withAuth, 
    withAdminAuth, 
    [validateArticle, validateImages],
    validate, 
    articleController.createArticle
);

router.put('/:id', 
    withAuth, 
    withAdminAuth, 
    [validateArticle, validateImages],
    validate, 
    articleController.updateArticle
);

router.delete('/:id', 
    withAuth, 
    withAdminAuth, 
    articleController.deleteArticle
);

// Routes pour les images des articles
router.use('/:id/images', require('./articleImagesRoutes'));

module.exports = router;