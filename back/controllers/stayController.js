const { Stay } = require('../models');

// attention supprimer les reponse dans les catch error: error.message en prod

// Ajouter un séjour
exports.createStay = async (req, res) => {
    console.log('Requête reçue pour créer un séjour');
    
    const { title, description, location, price, physical_level, technical_level, min_participant, max_participant, start_date, end_date, reception_point_id, status, user_id } = req.body;

    console.log('Données reçues :', req.body);

    try {
        const newStay  = await Stay.create({
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

        // réponse
        res.json({
            status: 200,
            msg: "séjour créé avec succès",
            stay: newStay
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
        const stays = await Stay.findAll();

        // cas ou séjour non trouvé
        if (!stays || stays.length === 0) {
            return res.json({
                status: 404,
                msg: "séjour non trouvé"
            });
        }
  
        // séjour trouvé
        res.json ({
            status: 200,
            stays
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
        const stay = await Stay.findByPk(id);

        // Cas ou séjour non trouvé
        if (!stay) {
            return res.json({
                status: 404,
                msg: "séjour non trouvé"
            });
        }

        // cas positif
        res.json({
            status:200,
            stay,
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

        // réponse
        res.json({
            status: 200,
            msg: "séjour modifié avec succès",
            stay,
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

        // réponse
        res.json({
            status: 200,
            msg: "séjour modifié avec succès",
            stay,
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