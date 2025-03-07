const express = require('express');
// Pour accéder aux params du parent
const router = express.Router({ mergeParams: true }); 
const articleImageController = require('../controllers/articleImageController');
const { validateImages } = require('../validators/articleValidator');
const validate = require('../middlewares/validationMiddleware');
const withAuth = require('../middlewares/withAuth');
const withAdminAuth = require('../middlewares/withAuthAdmin');

// Routes pour les images avec validation
router.post('/', 
    withAuth, 
    withAdminAuth,
    validateImages,
    validate, 
    articleImageController.addImages
);

router.delete('/:imageId', 
    withAuth, 
    withAdminAuth, 
    articleImageController.deleteImage
);

router.put('/:imageId', 
    withAuth, 
    withAdminAuth,
    validateImages,
    validate, 
    articleImageController.updateImage
);

module.exports = router;