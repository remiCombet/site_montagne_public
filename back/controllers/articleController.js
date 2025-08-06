const { Article, ArticleImage } = require('../models');
const { Op } = require('sequelize');
const CloudinaryService = require('../utils/upload');
const ImageHelpers = require('../utils/imageHelpers');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;

// image par défaut
const DEFAULT_IMAGE = 'https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png';

exports.createArticle = async (req, res) => {
    const { title, shortDescription, content, location, startDate, endDate, userId } = req.body;
    console.log(req.body);
    let imageAlts = [];
    if (req.body.imageAlts) {
        imageAlts = Array.isArray(req.body.imageAlts) ? req.body.imageAlts : [req.body.imageAlts];
    }
    
    try {
        // 1 - Vérifier si l'article existe déjà
        const existingArticle = await Article.findOne({
            where: { title }
        });

        // Si l'article existe déjà
        if (existingArticle) {
            return res.status(400).json({
                status: 400,
                msg: "Cet article existe déjà."
            });
        }

        // 2 - Créer l'article
        const article = await Article.create({
            title,
            short_description: shortDescription,
            content,
            location,
            start_date: startDate,
            end_date: endDate,
            id_user: parseInt(userId)
        });

        let isThumbnailSet = false;
        const imageUrls = [];

        // Validation manuelle des descriptions d'images
        if (imageAlts && imageAlts.length > 0) {
            for (const alt of imageAlts) {
                if (typeof alt !== 'string' || alt.trim().length < 3 || alt.trim().length > 255) {
                    return res.status(400).json({
                        status: 400,
                        message: "Chaque description d'image doit contenir entre 3 et 255 caractères"
                    });
                }
                
                const regex = /^[a-zA-Z0-9àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ\s.,!?-]+$/;
                if (!regex.test(alt.trim())) {
                    return res.status(400).json({
                        status: 400,
                        message: "Les descriptions ne peuvent contenir que des lettres, chiffres et caractères spéciaux basiques"
                    });
                }
            }
        }

        // 3 - Traiter les images
        if (req.files?.images) {
            const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            
            for (let index = 0; index < images.length; index++) {
                const file = images[index];
                try {
                    const safeName = CloudinaryService.generateSafeFileName(file.name);
                    
                    // 1. Vérifier le type de fichier
                    if (!CloudinaryService.isAllowedImageType(file.mimetype)) {
                        throw new Error(`Type de fichier non autorisé: ${file.name}`);
                    }

                    // 2. Utiliser ImageHelpers pour vérifier si l'image existe déjà
                    const imageResult = await ImageHelpers.checkAndGetExistingImage(article.id, safeName);
                    
                    if (imageResult.exists && imageResult.inArticle) {
                        console.log(`L'image ${safeName} existe déjà dans cet article, on la saute`);
                        continue;
                    }

                    let uploadResult;
                    
                    // Si l'image existe dans Cloudinary mais pas dans cet article
                    if (imageResult.exists && !imageResult.inArticle && imageResult.url) {
                        console.log('Image déjà existante dans Cloudinary, réutilisation...');
                        uploadResult = { url: imageResult.url };
                    } else {
                        // Upload nouvelle image dans Cloudinary
                        uploadResult = await CloudinaryService.uploadImage(file, 'articles', safeName);
                    }

                    // 4. Création de l'entrée en base de données
                    await ArticleImage.create({
                        article_id: article.id,
                        image_url: uploadResult.url,
                        image_alt: imageAlts[index] || safeName,
                        thumbnail: !isThumbnailSet ? 1 : 0,
                    });

                    isThumbnailSet = true;
                    imageUrls.push(uploadResult.url);

                    // Nettoyage du fichier temporaire
                    if (file.tempFilePath) {
                        await fs.unlink(file.tempFilePath);
                    }
                } catch (error) {
                    console.error('Erreur traitement image:', error);
                    continue;
                }
            }
        } else {
            // image par défaut si aucune n'est fournie
            await ArticleImage.create({
                article_id: article.id,
                image_url: DEFAULT_IMAGE,
                image_alt: 'image par défaut',
                thumbnail: 1
            });

            imageUrls.push(DEFAULT_IMAGE);
        }

        return res.json ({ 
            status: 200,
            message: "article et images ajoutés avec succès",
            article: {
                id: article.id,
                title: article.title,
                short_description: article.short_description,
                content: article.content,
                location: article.location,
                start_date: article.start_date,
                end_date: article.end_date,
                images: imageUrls,
            },
        });
    } catch (error) {
        console.error('Erreur création article:', error);
        return res.status(500).json({ 
            error: 'Erreur lors de la création de l\'article et de l\'ajout des images',
            details: error.message 
        });
    }
};

// récupérer tous les articles
exports.getAllArticles = async (req, res) => {
    try {
        // récupération des articles avec leurs images
        const articles = await Article.findAll({
            include: [{
                model: ArticleImage,
                as: 'images',
                attributes: ['id', 'image_url', 'image_alt', 'thumbnail']
            }],
            order: [['createdAt', 'DESC']]
        });

        if (!articles.length) {
            return res.json({
                status: 404,
                message: 'Aucun article trouvé'
            });
        }

        // transformation des données pour le front 
        const formattedArticles = articles.map(article => {
            // trouver la miniature
            const thumbnail = article.images.find(img => img.thumbnail) || 
                article.images[0] || 
                { image_url: process.env.DEFAULT_IMAGE_URL, image_alt: 'Image par défaut' };

            return {
                id: article.id,
                title: article.title,
                shortDescription: article.short_description,
                content: article.content,
                thumbnail: thumbnail.image_url,
                thumbnailAlt: thumbnail.image_alt,
                location: article.location,
                startDate: article.start_date,
                endDate: article.end_date,
                createdAt: article.createdAt,
                images: article.images.map(img => ({
                    id: img.id,
                    url: img.image_url,
                    alt: img.image_alt,
                    thumbnail: img.thumbnail
                }))
            };
        });

        return res.json({
            status: 200,
            count: formattedArticles.length,
            articles: formattedArticles
        });

    } catch (error) {
        console.error('Erreur récupération articles:', error);
        return res.json({
            status: 500,
            message: 'Erreur lors de la récupération des articles',
            error: error.message
        });
    }
};

exports.getArticleById = async (req, res) => {
    const { id } = req.params;

    try {
        // Récupération de l'article avec ses images
        const article = await Article.findOne({
            where: { id },
            include: [{
                model: ArticleImage,
                as: 'images',
                attributes: ['id', 'image_url', 'image_alt', 'thumbnail']
            }]
        });

        if (!article) {
            return res.status(404).json({
                status: 404,
                message: 'Article non trouvé'
            });
        }

        // Séparation des images normales et de la miniature
        const thumbnail = article.images.find(img => img.thumbnail);
        const otherImages = article.images.filter(img => !img.thumbnail);

        return res.status(200).json({
            status: 200,
            article: {
                id: article.id,
                title: article.title,
                content: article.content,
                short_description: article.short_description,
                location: article.location,
                start_date: article.start_date,
                end_date: article.end_date,
                created_at: article.created_at,
                updated_at: article.updated_at,
                thumbnail: thumbnail?.image_url || process.env.DEFAULT_IMAGE_URL,
                images: otherImages.map(img => ({
                    id: img.id,
                    url: img.image_url,
                    alt: img.image_alt
                }))
            }
        });

    } catch (error) {
        console.error('Erreur récupération article:', error);
        return res.status(500).json({
            status: 500,
            message: 'Erreur lors de la récupération de l\'article',
            error: error.message
        });
    }
};

// Mise à jour d'un article
exports.updateArticle = async (req, res) => {
    const { id } = req.params;
    const { title, shortDescription, content, location, startDate, endDate } = req.body;

    try {
        const article = await Article.findByPk(id);

        if (!article) {
            return res.status(404).json({
                status: 404,
                message: "Article non trouvé"
            });
        }

        // Mise à jour des données textuelles uniquement
        await article.update({
            title,
            short_description: shortDescription,
            content,
            location,
            start_date: startDate,
            end_date: endDate
        });

        // Récupération de l'article mis à jour
        const updatedArticle = await Article.findOne({
            where: { id },
            include: [{
                model: ArticleImage,
                as: 'images',
                attributes: ['id', 'image_url', 'image_alt', 'thumbnail']
            }]
        });

        // Formatage de la réponse
        const thumbnail = updatedArticle.images.find(img => img.thumbnail);
        
        return res.status(200).json({
            status: 200,
            message: "Article mis à jour avec succès",
            article: {
                id: updatedArticle.id,
                title: updatedArticle.title,
                content: updatedArticle.content,
                short_description: updatedArticle.short_description,
                location: updatedArticle.location,
                start_date: updatedArticle.start_date,
                end_date: updatedArticle.end_date,
                thumbnail: thumbnail?.image_url || process.env.DEFAULT_IMAGE_URL,
                images: updatedArticle.images.map(img => ({
                    id: img.id,
                    url: img.image_url,
                    alt: img.image_alt,
                    thumbnail: img.thumbnail
                }))
            }
        });

    } catch (error) {
        console.error('Erreur mise à jour article:', error);
        return res.status(500).json({
            status: 500,
            message: "Erreur lors de la mise à jour de l'article",
            error: error.message
        });
    }
};

// Suppression d'un article
exports.deleteArticle = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Récupérer l'article avec ses images
        const article = await Article.findOne({
            where: { id },
            include: [{
                model: ArticleImage,
                as: 'images',
                attributes: ['id', 'image_url']
            }]
        });

        if (!article) {
            return res.status(404).json({
                status: 404,
                message: "Article non trouvé"
            });
        }

        // 2. Pour chaque image, vérifier si elle est utilisée ailleurs
        for (const image of article.images) {
            // Ne pas supprimer l'image par défaut
            if (image.image_url === DEFAULT_IMAGE) {
                console.log('Image par défaut, conservation...');
                continue;
            }
        
            // Utiliser ImageHelpers pour vérifier l'utilisation de l'image
            const imageUsageCount = await ImageHelpers.countImageUsage(image.image_url);
        
            // Si l'image n'est utilisée que dans cet article, la supprimer de Cloudinary
            if (imageUsageCount === 1) {
                const publicId = CloudinaryService.getPublicIdFromUrl(image.image_url);
                if (publicId) {
                    try {
                        await CloudinaryService.deleteImage(publicId);
                        console.log(`Image supprimée de Cloudinary: ${publicId}`);
                    } catch (error) {
                        console.error(`Erreur lors de la suppression de l'image ${publicId}:`, error);
                    }
                }
            } else {
                console.log(`Image ${image.image_url} utilisée dans d'autres articles, conservation dans Cloudinary`);
            }
        }

        // 3. Supprimer l'article (les images seront supprimées automatiquement grâce au CASCADE)
        await article.destroy();

        return res.status(200).json({
            status: 200,
            message: "Article supprimé avec succès"
        });

    } catch (error) {
        console.error('Erreur suppression article:', error);
        return res.status(500).json({
            status: 500,
            message: "Erreur lors de la suppression de l'article",
            error: error.message
        });
    }
};