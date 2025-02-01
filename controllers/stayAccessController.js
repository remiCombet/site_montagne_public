const { StayAccess, Stay, Access } = require('../models');

// Ajouter un accès à un séjour
exports.addStayAccess = async (req, res) => {
    const { stay_id, access_id } = req.body;

    if (!stay_id || !access_id) {
        return res.json({
            status: 400,
            msg: "stay_id et access_id sont requis."
        });
    }

    try {
        const stayAccess = await StayAccess.create({ stay_id, access_id});

        // réponse
        res.json({
            status: 200,
            msg: "accès ajouté à un séjour avec succes",
            access: stayAccess
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            msg: "oups, une erreur est survenue"
        })
    }
};

// récupérer tous les acces liés à un séjour
exports.getAccessByStay = async (req, res) => {
    const {stay_id} = req.params;

    try {
        const accesses = await StayAccess.findAll({
            where: { stay_id },
            include: [{ model : Access, as: 'access'}],
        });

        res.json({
            status: 200,
            access: accesses
        })
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            msg: "oups, une erreur est survenue"
        });
    }
};

// lister toutes les associations StayAccess
exports.getAllStayAccess = async (req, res) => {
    try {
        const associations = await StayAccess.findAll({
            include: [
                { model: Stay, as: 'stay'},
                { model: Access, as: 'access'},
            ]
        });

        // Vérification si aucune association n'est trouvée
        if (associations.length === 0) {
            return res.json({
                status: 404,
                msg: "Aucune association trouvée entre Stay et Access."
            });
        }

        // Réponse 
        res.json({
            status: 200,
            stayAccess : associations
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            msg: "Erreur serveur",
            error: error.message
        });
    }
};

// Supprimer un accès à un séjour
exports.removeStayAccess = async (req, res) => {
    const { id } = req.params;
    
    try {
        const stayAccess = await StayAccess.findByPk(id);

        // si pas trouvé
        if (!stayAccess) {
            return res.json({
                status: 404,
                msg: "Association introuvable."
            });
        }

        // cas positif
        await StayAccess.destroy({
            where: { id: stayAccess.id }
        });

        // réponse
        res.json({
            status: 200,
            msg: "Association supprimée avec succès.",
            stayAccess
        })
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur",
            error: error.message
        });
    }
};