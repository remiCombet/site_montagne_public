const { Stay, StayImage } = require('../models');
const { Op } = require('sequelize');
const CloudinaryService = require('../utils/upload');
const StayImageHelpers = require('../utils/stayImageHelper');
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

// Vous pouvez implémenter les fonctions deleteImage et updateImage de manière similaire
// en adaptant le code du contrôleur d'articles