const { Stay, StayParticipant, User } = require('../models');

// attention supprimer les reponse dans les catch error: error.message en prod

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
    return 'en_attente_de_validation'; // Valeur par défaut en cas d'erreur
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
    
    const { title, description, location, price, physical_level, technical_level, min_participant, max_participant, start_date, end_date, reception_point_id, status, user_id } = req.body;

    console.log('Données reçues :', req.body);

    try {
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

        // Ajouter le fill_status calculé (sera "participants_insuffisants" pour un nouveau séjour)
        const stayWithFillStatus = await addFillStatusInfo(newStay);

        // réponse
        res.json({
            status: 200,
            msg: "séjour créé avec succès",
            stay: stayWithFillStatus
        });
    } catch (error) {
        // gestion des erreurs
        console.error('Erreur lors de la création:', error);

        // réponse
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
        
        // Ajouter le fill_status et les statistiques de participants à chaque séjour
        const staysWithFillStatus = await Promise.all(stays.map(stay => addFillStatusInfo(stay)));
  
        // séjour trouvé
        res.json({
            status: 200,
            stays: staysWithFillStatus
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération des séjours"
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

        // cas positif
        res.json({
            status: 200,
            stay: stayWithFillStatus,
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération du séjour"
        });
    }
};

// modifier un séjour
exports.updateStay = async (req, res) => {
    const { id } = req.params;
    const { title, description, location, price, physical_level, technical_level, min_participant, max_participant, start_date, end_date, reception_point_id, status, user_id } = req.body;

    console.log("Données reçues dans le body :", req.body);
    console.log("ID reçu dans params :", req.params.id);
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
        stay.title = title || stay.title;
        stay.description = description || stay.description;
        stay.location = location || stay.location;
        stay.price = price || stay.price;
        stay.physical_level = physical_level || stay.physical_level;
        stay.technical_level = technical_level || stay.technical_level;
        stay.min_participant = min_participant || stay.min_participant;
        stay.max_participant = max_participant || stay.max_participant;
        stay.start_date = start_date || stay.start_date;
        stay.end_date = end_date || stay.end_date;
        stay.reception_point_id = reception_point_id || stay.reception_point_id;
        stay.status = status || stay.status;
        stay.user_id = user_id || stay.user_id;

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