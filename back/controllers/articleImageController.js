const { Article, ArticleImage } = require('../models');
const CloudinaryService = require('../utils/upload');
const fs = require('fs').promises;

const DEFAULT_IMAGE = 'https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png';

exports.addImages = async (req, res) => {
    const { id: articleId } = req.params;

    try {
        // Vérifier si l'article existe
        const article = await Article.findByPk(articleId);
        if (!article) {
            return res.status(404).json({
                status: 404,
                message: "Article non trouvé"
            });
        }

        if (!req.files?.images) {
            return res.status(400).json({
                status: 400,
                message: "Aucune image fournie"
            });
        }

        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const uploadedImages = [];

        // Vérifier s'il existe déjà une miniature
        const existingThumbnail = await ArticleImage.findOne({
            where: { 
                article_id: articleId,
                thumbnail: true 
            }
        });

        for (const file of images) {
            try {
                // Vérification du type de fichier
                if (!CloudinaryService.isAllowedImageType(file.mimetype)) {
                    console.warn(`Type de fichier non autorisé: ${file.name}, ignoré`);
                    continue;
                }

                const safeName = CloudinaryService.generateSafeFileName(file.name);
                
                // Upload direct de l'image
                const uploadResult = await CloudinaryService.uploadImage(file, 'articles', safeName);
                console.log('Upload réussi:', uploadResult);

                // Création de l'entrée dans la base de données
                const newImage = await ArticleImage.create({
                    article_id: articleId,
                    image_url: uploadResult.url,
                    image_alt: req.body.image_alt || safeName,
                    thumbnail: !existingThumbnail && uploadedImages.length === 0
                });

                uploadedImages.push({
                    id: newImage.id,
                    url: newImage.image_url,
                    alt: newImage.image_alt,
                    thumbnail: newImage.thumbnail
                });

                // Nettoyage du fichier temporaire
                if (file.tempFilePath) {
                    await fs.unlink(file.tempFilePath);
                }

            } catch (imageError) {
                console.error('Erreur traitement image:', imageError);
                continue;
            }
        }

        return res.status(201).json({
            status: 201,
            message: "Images ajoutées avec succès",
            images: uploadedImages
        });

    } catch (error) {
        console.error('Erreur ajout images:', error);
        return res.status(500).json({
            status: 500,
            message: "Erreur lors de l'ajout des images",
            error: error.message
        });
    }
};

exports.deleteImage = async (req, res) => {
    const { id: articleId, imageId } = req.params;

    try {
        const image = await ArticleImage.findOne({
            where: { 
                id: imageId,
                article_id: articleId
            }
        });

        if (!image) {
            return res.status(404).json({
                status: 404,
                message: "Image non trouvée"
            });
        }

        // Ne pas supprimer l'image par défaut
        if (image.image_url === DEFAULT_IMAGE) {
            console.log('Image par défaut, conservation...');
            return res.status(400).json({
                status: 400,
                message: "Impossible de supprimer l'image par défaut"
            });
        }

        // Vérifier si l'image est utilisée ailleurs
        const imageUsageCount = await ArticleImage.count({
            where: {
                image_url: image.image_url
            }
        });

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
            console.log(`Image utilisée dans d'autres articles, conservation dans Cloudinary`);
        }

        await image.destroy();

        // Si c'était une miniature, définir une nouvelle miniature si d'autres images existent
        if (image.thumbnail) {
            const nextImage = await ArticleImage.findOne({
                where: { article_id: articleId }
            });
            if (nextImage) {
                await nextImage.update({ thumbnail: true });
            }
        }

        res.status(200).json({
            status: 200,
            message: "Image supprimée avec succès"
        });

    } catch (error) {
        console.error('Erreur suppression image:', error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la suppression de l'image",
            error: error.message
        });
    }
};

exports.updateImage = async (req, res) => {
    const { id: articleId, imageId } = req.params;
    const { image_alt } = req.body;

    try {
        const image = await ArticleImage.findOne({
            where: { 
                id: imageId,
                article_id: articleId
            }
        });

        if (!image) {
            return res.status(404).json({
                status: 404,
                message: "Image non trouvée"
            });
        }

        const updates = {};

        // Mise à jour de l'alt text si fourni
        if (image_alt) {
            updates.image_alt = image_alt;
        }

        // Mise à jour de l'image si fournie
        if (req.files?.image) {
            const file = req.files.image;

            if (!CloudinaryService.isAllowedImageType(file.mimetype)) {
                return res.status(400).json({
                    status: 400,
                    message: "Type de fichier non autorisé"
                });
            }

            // Vérifier si l'ancienne image est utilisée ailleurs
            const oldImageUrl = image.image_url;
            const imageUsageCount = await ArticleImage.count({
                where: {
                    image_url: oldImageUrl
                }
            });

            const safeName = CloudinaryService.generateSafeFileName(file.name);
            const uploadResult = await CloudinaryService.uploadImage(file, 'articles', safeName);
            updates.image_url = uploadResult.url;

            // Supprimer l'ancienne image si elle n'est pas utilisée ailleurs et n'est pas l'image par défaut
            if (imageUsageCount === 1 && oldImageUrl !== DEFAULT_IMAGE) {
                const oldPublicId = CloudinaryService.getPublicIdFromUrl(oldImageUrl);
                if (oldPublicId) {
                    try {
                        await CloudinaryService.deleteImage(oldPublicId);
                        console.log(`Ancienne image supprimée de Cloudinary: ${oldPublicId}`);
                    } catch (error) {
                        console.error(`Erreur lors de la suppression de l'ancienne image ${oldPublicId}:`, error);
                    }
                }
            } else {
                console.log(`Image conservée dans Cloudinary (par défaut ou utilisée ailleurs)`);
            }

            // Nettoyage du fichier temporaire
            if (file.tempFilePath) {
                await fs.unlink(file.tempFilePath);
            }
        }

        await image.update(updates);

        res.status(200).json({
            status: 200,
            message: "Image mise à jour avec succès",
            image: {
                id: image.id,
                url: image.image_url,
                alt: image.image_alt,
                thumbnail: image.thumbnail
            }
        });

    } catch (error) {
        console.error('Erreur mise à jour image:', error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la mise à jour de l'image",
            error: error.message
        });
    }
};