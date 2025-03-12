const { Stay, StayParticipant, User, StayImage } = require('../models');
const { Op } = require('sequelize');
const CloudinaryService = require('../utils/upload');
const StayImageHelpers = require('../utils/stayImageHelpers');
const fs = require('fs').promises;

// attention supprimer les reponse dans les catch error: error.message en prod

// Image par défaut
const DEFAULT_IMAGE = 'https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png';

// Fonction utilitaire pour formater les images d'un séjour
const formatStayImages = (stay) => {
    // Si aucune image n'est trouvée
    if (!stay.images || stay.images.length === 0) {
        stay.dataValues.thumbnail = DEFAULT_IMAGE;
        stay.dataValues.thumbnailAlt = 'Image par défaut';
        stay.dataValues.formattedImages = [];
        return stay;
    }
    
    // Trouver l'image principale (thumbnail ou première image)
    const thumbnail = stay.images.find(img => img.thumbnail) || stay.images[0];
    
    // Ajouter les propriétés d'image au séjour
    stay.dataValues.thumbnail = thumbnail.image_url;
    stay.dataValues.thumbnailAlt = thumbnail.image_alt;
    
    // Formater toutes les images
    stay.dataValues.formattedImages = stay.images.map(img => ({
        id: img.id,
        url: img.image_url,
        alt: img.image_alt,
        thumbnail: img.thumbnail
    }));
    
    return stay;
};

// Fonction utilitaire pour calculer le fill_status d'un séjour
const calculateFillStatus = async (stayId) => {
  try {
    // Récupérer le séjour
    const stay = await Stay.findByPk(stayId);
    if (!stay) return null;
    
    // Récupérer les demandes validées pour ce séjour
    const validRequests = await StayParticipant.findAll({
      where: { 
        stay_id: stayId,
        status: 'validé'
      }
    });
    
    // Calculer le nombre de participants confirmés
    let confirmedParticipants = 0;
    validRequests.forEach(request => {
      confirmedParticipants += 1 + (request.people_number || 0);
    });
    
    // Déterminer l'état de remplissage
    if (confirmedParticipants < stay.min_participant) {
      return 'participants_insuffisants';
    } else if (confirmedParticipants >= stay.max_participant) {
      return 'complet';
    } else {
      return 'en_attente_de_validation';
    }
  } catch (error) {
    console.error('Erreur lors du calcul du fill_status:', error);
    // Valeur par défaut en cas d'erreur
    return 'en_attente_de_validation';
  }
};

// Ajouter les informations de remplissage à un séjour
const addFillStatusInfo = async (stay) => {
  try {
    // Récupérer les demandes validées pour ce séjour
    const validRequests = await StayParticipant.findAll({
      where: { 
        stay_id: stay.id,
        status: 'validé'
      }
    });
    
    // Calculer le nombre de participants confirmés
    let confirmedParticipants = 0;
    validRequests.forEach(request => {
      confirmedParticipants += 1 + (request.people_number || 0);
    });
    
    // Ajouter les données calculées au séjour
    stay.dataValues.confirmedParticipants = confirmedParticipants;
    
    // Déterminer l'état de remplissage
    if (confirmedParticipants < stay.min_participant) {
      stay.dataValues.fill_status = 'participants_insuffisants';
    } else if (confirmedParticipants >= stay.max_participant) {
      stay.dataValues.fill_status = 'complet';
    } else {
      stay.dataValues.fill_status = 'en_attente_de_validation';
    }
    
    return stay;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du fill_status:', error);
    stay.dataValues.fill_status = 'en_attente_de_validation';
    return stay;
  }
};

// Ajouter un séjour
exports.createStay = async (req, res) => {
    console.log('Requête reçue pour créer un séjour');
    
    const { title, description, location, price, physical_level, technical_level, 
            min_participant, max_participant, start_date, end_date, reception_point_id, 
            status, user_id } = req.body;

    console.log('Données reçues :', req.body);
    
    // Gestion des descriptions d'images
    let imageAlts = [];
    if (req.body.imageAlts) {
        imageAlts = Array.isArray(req.body.imageAlts) ? req.body.imageAlts : [req.body.imageAlts];
    }

    try {
        // 1. Vérifier si un séjour avec le même titre existe déjà
        const existingStay = await Stay.findOne({
            where: { title }
        });

        if (existingStay) {
            return res.json({
                status: 400,
                msg: "Un séjour avec ce titre existe déjà."
            });
        }

        // 2. Créer le séjour
        const newStay = await Stay.create({
            title,
            description,
            location,
            price,
            physical_level,
            technical_level,
            min_participant,
            max_participant,
            start_date,
            end_date,
            reception_point_id,
            status,
            user_id
        });

        // 3. Traiter les images
        let isThumbnailSet = false;
        const imageUrls = [];

        if (req.files?.images) {
            const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            
            for (let index = 0; index < images.length; index++) {
                const file = images[index];
                try {
                    const safeName = CloudinaryService.generateSafeFileName(file.name);
                    
                    // Vérifier le type de fichier
                    if (!CloudinaryService.isAllowedImageType(file.mimetype)) {
                        throw new Error(`Type de fichier non autorisé: ${file.name}`);
                    }

                    // Utiliser StayImageHelpers pour vérifier si l'image existe déjà
                    const imageResult = await StayImageHelpers.checkAndGetExistingImage(newStay.id, safeName);
                    
                    if (imageResult.exists && imageResult.inStay) {
                        console.log(`L'image ${safeName} existe déjà dans ce séjour, on la saute`);
                        continue;
                    }

                    let uploadResult;
                    
                    // Si l'image existe dans Cloudinary mais pas dans ce séjour
                    if (imageResult.exists && !imageResult.inStay && imageResult.url) {
                        console.log('Image déjà existante dans Cloudinary, réutilisation...');
                        uploadResult = { url: imageResult.url };
                    } else {
                        // Upload nouvelle image dans Cloudinary
                        uploadResult = await CloudinaryService.uploadImage(file, 'stays', safeName);
                    }

                    // Création de l'entrée en base de données
                    await StayImage.create({
                        stay_id: newStay.id,
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
            // Image par défaut si aucune n'est fournie
            await StayImage.create({
                stay_id: newStay.id,
                image_url: DEFAULT_IMAGE,
                image_alt: 'Image par défaut',
                thumbnail: 1
            });

            imageUrls.push(DEFAULT_IMAGE);
        }

        // Récupérer le séjour avec les images ajoutées
        const stayWithImages = await Stay.findByPk(newStay.id, {
            include: [{
                model: StayImage,
                as: 'images'
            }]
        });
        
        // Ajouter le fill_status calculé
        const stayWithFillStatus = await addFillStatusInfo(stayWithImages);
        
        // Formater les images pour la réponse
        const formattedStay = formatStayImages(stayWithFillStatus);

        // Réponse
        res.json({
            status: 200,
            msg: "Séjour créé avec succès",
            stay: formattedStay
        });
        
    } catch (error) {
        // Gestion des erreurs
        console.error('Erreur lors de la création:', error);

        // Réponse
        res.json({
            status: 500,
            msg: "Oups, une erreur est survenue",
            error: error.message,
        });
    }
};

// récupérer tous les séjours
exports.getAllStays = async (req, res) => {
    try {
        const stays = await Stay.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname']
                },
                {
                    model: StayImage,
                    as: 'images',
                    attributes: ['id', 'image_url', 'image_alt', 'thumbnail']
                }
            ]
        });

        // cas ou séjour non trouvé
        if (!stays || stays.length === 0) {
            return res.json({
                status: 404,
                msg: "séjour non trouvé"
            });
        }
        
        // Ajouter le fill_status et les images formatées à chaque séjour
        const formattedStays = await Promise.all(
            stays.map(async (stay) => {
                // Ajouter les informations de remplissage
                const enrichedStay = await addFillStatusInfo(stay);
                
                // Formater les images pour ce séjour
                return formatStayImages(enrichedStay);
            })
        );
  
        // séjour trouvé
        res.json({
            status: 200,
            stays: formattedStays
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération des séjours",
            error: error.message
        });
    }
};

// récupérer un séjour par son id
exports.getStayById = async (req, res) => {
    const { id } = req.params;

    try {
        const stay = await Stay.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname']
                },
                {
                    model: StayImage,
                    as: 'images',
                    attributes: ['id', 'image_url', 'image_alt', 'thumbnail']
                }
            ]
        });

        // Cas ou séjour non trouvé
        if (!stay) {
            return res.json({
                status: 404,
                msg: "séjour non trouvé"
            });
        }

        // Ajouter le fill_status et les statistiques de participants
        const stayWithFillStatus = await addFillStatusInfo(stay);
        
        // Formater les images
        const formattedStay = formatStayImages(stayWithFillStatus);

        // cas positif
        res.json({
            status: 200,
            stay: formattedStay,
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération du séjour",
            error: error.message
        });
    }
};

// modifier un séjour
exports.updateStay = async (req, res) => {
    const { id } = req.params;
    const { title, description, location, price, physical_level, technical_level, 
            min_participant, max_participant, start_date, end_date, 
            reception_point_id, status, user_id } = req.body;

    console.log("Données reçues dans le body :", req.body);
    console.log("ID reçu dans params :", req.params.id);
    
    try {
        const stay = await Stay.findByPk(id);

        // Non trouvé
        if (!stay) {
            return res.json({
                status: 404,
                msg: "Séjour non trouvé"
            });
        }

        // Mise à jour des données textuelles uniquement
        await stay.update({
            title: title || stay.title,
            description: description || stay.description,
            location: location || stay.location,
            price: price || stay.price,
            physical_level: physical_level || stay.physical_level,
            technical_level: technical_level || stay.technical_level,
            min_participant: min_participant || stay.min_participant,
            max_participant: max_participant || stay.max_participant,
            start_date: start_date || stay.start_date,
            end_date: end_date || stay.end_date,
            reception_point_id: reception_point_id || stay.reception_point_id,
            status: status || stay.status,
            user_id: user_id || stay.user_id
        });
        
        // Récupérer le séjour mis à jour avec les images
        const updatedStay = await Stay.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname']
                },
                {
                    model: StayImage,
                    as: 'images',
                    attributes: ['id', 'image_url', 'image_alt', 'thumbnail']
                }
            ]
        });
        
        // Ajouter le fill_status calculé
        const stayWithFillStatus = await addFillStatusInfo(updatedStay);
        
        // Formater les images pour la réponse
        const formattedStay = formatStayImages(stayWithFillStatus);

        // Réponse
        res.json({
            status: 200,
            msg: "Séjour modifié avec succès",
            stay: formattedStay,
        });

    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            msg: "Oups une erreur est survenue",
            error: error.message 
        });
    }
};

// modifier le statut d'un séjour
exports.updateStayStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const stay = await Stay.findByPk(id);

        // non trouvé
        if (!stay) {
            return res.json({
                status: 404,
                msg: "séjour non trouvé"
            })
        }

        //  tout est bon
        stay.status = status || stay.status;

        // sauvegarde des changements
        await stay.save();
        
        // Ajouter le fill_status calculé
        const stayWithFillStatus = await addFillStatusInfo(stay);

        // réponse
        res.json({
            status: 200,
            msg: "séjour modifié avec succès",
            stay: stayWithFillStatus,
        });

    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status:500,
            msg: "oups une erreur est survenue",
            error: error.message 
        });
    }
};

// modifier le point de reception d'un séjour
exports.updateStayReceptionPoint = async (req, res) => {
    const { stayId } = req.params;
    const { reception_point_id } = req.body;

    try {
        const stay = await Stay.findByPk(stayId);
        
        if (!stay) {
            return res.json({
                status: 404,
                msg: "Séjour non trouvé"
            });
        }

        await stay.update({ reception_point_id });
        
        // Ajouter le fill_status calculé
        const stayWithFillStatus = await addFillStatusInfo(stay);

        res.json({
            status: 200,
            msg: "Point de réception du séjour mis à jour avec succès",
            stay: stayWithFillStatus
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            msg: "Erreur lors de la mise à jour du point de réception"
        });
    }
};

// supprimer un séjour
exports.deleteStay = async (req, res) => {
    const { id } = req.params;
   
    try {
        const stay = await Stay.findByPk(id);
        
        // non trouvé
        if (!stay) {
            return res.json({
                status: 404,
                msg: "séjour non trouvé"
            });
        }

        // séjour trouvé, suppression
        await stay.destroy();

        // réponse
        res.json({
            status: 200,
            msg: "séjour supprimé avec succès"
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status:500,
            msg: "oups une erreur est survenue",
            error: error.message 
        });
    }
};

// Obtenir l'état de remplissage d'un séjour (méthode utilitaire pour les autres services)
exports.getStayFillStatus = async (req, res) => {
    const { id } = req.params;
    
    try {
        const fillStatus = await calculateFillStatus(id);
        
        if (!fillStatus) {
            return res.json({
                status: 404,
                msg: "séjour non trouvé"
            });
        }
        
        res.json({
            status: 200,
            fill_status: fillStatus
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            msg: "Erreur lors du calcul de l'état de remplissage",
            error: error.message
        });
    }
};