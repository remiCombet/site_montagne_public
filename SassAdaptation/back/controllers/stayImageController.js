const { Stay, StayImage } = require('../models');
const { Op } = require('sequelize');
const CloudinaryService = require('../utils/upload');
const StayImageHelpers = require('../utils/stayImageHelpers');
const { url } = require('inspector');
const fs = require('fs').promises;

const DEFAULT_IMAGE = 'https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png';

exports.addImages = async (req, res) => {
    const { id: stayId } = req.params;

    try {
        // Vérifier si le séjour existe
        const stay = await Stay.findByPk(stayId);
        if (!stay) {
            return res.status(404).json({
                status: 404,
                message: "Séjour non trouvé"
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
        
        // Récupérer les descriptions d'images
        let imageAlts = [];
        
        if (Array.isArray(req.body.image_alt)) {
            imageAlts = req.body.image_alt;
        } 
        else if (typeof req.body.image_alt === 'string' && req.body.image_alt.startsWith('[')) {
            try {
                imageAlts = JSON.parse(req.body.image_alt);
            } catch(e) {
                imageAlts = [req.body.image_alt];
            }
        } 
        else if (req.body.image_alt) {
            imageAlts = [req.body.image_alt];
        }
        
        // Vérifier s'il existe déjà une miniature
        const existingThumbnail = await StayImage.findOne({
            where: { 
                stay_id: stayId,
                thumbnail: true 
            }
        });

        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            try {
                if (!CloudinaryService.isAllowedImageType(file.mimetype)) {
                    console.warn(`Type de fichier non autorisé: ${file.name}, ignoré`);
                    continue;
                }

                const safeName = CloudinaryService.generateSafeFileName(file.name);
                
                const imageResult = await StayImageHelpers.checkAndGetExistingImage(stayId, safeName);
                
                if (imageResult.exists && imageResult.inStay) {
                    console.warn(`L'image ${safeName} existe déjà dans ce séjour, on la saute`);
                    continue;
                }
                
                let uploadResult;
                
                if (imageResult.exists && !imageResult.inStay && imageResult.url) {
                    console.log('Image déjà existante dans Cloudinary, réutilisation...');
                    uploadResult = { url: imageResult.url };
                } else {
                    uploadResult = await CloudinaryService.uploadImage(file, 'stays', safeName);
                    console.log('Upload réussi:', uploadResult);
                }

                const imageAlt = i < imageAlts.length ? imageAlts[i] : safeName;

                const newImage = await StayImage.create({
                    stay_id: stayId,
                    image_url: uploadResult.url,
                    image_alt: imageAlt,
                    thumbnail: !existingThumbnail && uploadedImages.length === 0
                });

                uploadedImages.push({
                    id: newImage.id,
                    url: newImage.image_url,
                    alt: newImage.image_alt,
                    thumbnail: newImage.thumbnail
                });

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

exports.updateImage = async (req, res) => {
    const { id: stayId, imageId } = req.params;
    const { image_alt } = req.body;
    console.log(stayId, imageId, image_alt);
    try {
        const image = await StayImage.findOne({
            where: {
                id: imageId,
                stay_id: stayId
            }
        });

        if (!image) {
            return res.status(404).json({
                status: 404,
                message: "Image non trouvée"
            });
        }

        const updates = {};

        // Mise à jour de l'alt si fourni
        if (image_alt) {
            updates.image_alt = image_alt;
        }

        // Toujours forcer thumbnail à true dans le modèle à image unique
        updates.thumbnail = true;

        // Mise à jour de l'image si fournie
        if (req.files?.image) {
            const file = req.files.image;
            if (!CloudinaryService.isAllowedImageType(file.mimetype)) {
                return res.status(400).json({
                    status: 400,
                    message: "Type de fichier non autorisé"
                });
            }

            const safeName = CloudinaryService.generateSafeFileName(file.name);
            
            // Vérifier si l'image existe déja en excluant l'image en cours de modification
            const imageExistsInStay = await StayImageHelpers.checkImageExistsInStay(
                stayId,
                safeName,
                imageId
            );

            if (imageExistsInStay) {
                return res.status(400).json({
                    status: 400,
                    message: "Une image similaire existe déjà dans ce séjour"
                });
            }

            // Vérifier si l'ancienne image est utilisée ailleurs
            const oldImageUrl = image.image_url;
            const imageUsageCount = await StayImageHelpers.countImageUsage(oldImageUrl, imageId);

            // Upload de la nouvelle image
            const uploadResult = await CloudinaryService.uploadImage(file, 'stays', safeName);
            updates.image_url = uploadResult.url;

            // Supprimer l'ancienne image si elle n'est pas utilisée ailleurs et n'est pas l'image par défaut
            if (imageUsageCount === 0 && oldImageUrl !== DEFAULT_IMAGE) {
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

        // réponse
        return res.json({
            status: 200,
            message: "Image mise à jour avec succès",
            image: {
                id: image.id,
                url: image.image_url,
                alt: image.image_alt,
                thumbnail: true
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

// Suppression d'une image
exports.deleteImage = async (req, res) => {    
    const { id: stayId, imageId } = req.params;

    try {
        // Trouver l'image à supprimer
        const image = await StayImage.findOne({
            where: { 
                id: imageId,
                stay_id: stayId
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

        // Compter le nombre total d'images pour ce séjour
        const totalImages = await StayImage.count({
            where: { stay_id: stayId }
        });

        // Si c'est la seule image, remplacer par l'image par défaut au lieu de supprimer
        if (totalImages === 1) {
            console.log("Dernière image du séjour, remplacement par l'image par défaut");
            
            // Utiliser la fonction du module pour vérifier l'usage avant de supprimer de Cloudinary
            const imageUsageCount = await StayImageHelpers.countImageUsage(image.image_url);
            
            // Si l'image n'est utilisée que dans ce séjour, la supprimer de Cloudinary
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
            }

            // Mettre à jour l'image existante avec l'image par défaut
            await image.update({
                image_url: DEFAULT_IMAGE,
                image_alt: 'Image par défaut',
                thumbnail: true
            });

            return res.status(200).json({
                status: 200,
                message: "Image remplacée par l'image par défaut",
                image: {
                    id: image.id,
                    url: DEFAULT_IMAGE,
                    alt: 'Image par défaut',
                    thumbnail: true
                }
            });
        }
        
        // Sinon, procéder à la suppression normale

        // Utiliser la fonction du module pour vérifier l'usage
        const imageUsageCount = await StayImageHelpers.countImageUsage(image.image_url);

        // Si l'image n'est utilisée que dans ce séjour, la supprimer de Cloudinary
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
            console.log(`Image utilisée dans d'autres séjours, conservation dans Cloudinary`);
        }

        // Vérifier si c'était une miniature
        const wasThumbnail = image.thumbnail;

        // Supprimer l'image de la base de données
        await image.destroy();

        // Si c'était une miniature, définir une nouvelle miniature
        if (wasThumbnail) {
            const nextImage = await StayImage.findOne({
                where: { stay_id: stayId }
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