const { StayEquipment, Stay, Category } = require('../models');

// Ajouter un équipement à un séjour
exports.addStayEquipment = async (req, res) => {
    const { stay_id, category_id } = req.body;

    if (!stay_id || !category_id) {
        return res.json({
            status: 400,
            msg: "stay_id et category_id sont requis."
        });
    }

    try {
        const stayEquipment = await StayEquipment.create({ stay_id, category_id });

        // Réponse
        res.json({
            status: 200,
            msg: "équipement ajouté au séjour avec succès",
            stayEquipment
        });
    } catch (error) {
        // Gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            msg: "Oups, une erreur est survenue",
            error: error.message
        });
    }
};

// Récupérer tous les équipements liés à un séjour
exports.getEquipmentsByStay = async (req, res) => {
    const { stay_id } = req.params;

    try {
        // Récupérer le séjour avec ses équipements associés
        const stay = await Stay.findByPk(stay_id, {
            include: [
                {
                    model: StayEquipment,
                    as: 'equipments',
                    include: [
                        { model: Category, as: 'category' }
                    ],
                    attributes: { exclude: ['stay_id', 'category_id'] }
                }
            ]
        });

        // Vérifier si le séjour existe
        if (!stay) {
            return res.json({
                status: 404,
                msg: "Séjour non trouvé."
            });
        }

        // Réponse avec les informations du séjour et des équipements
        res.json({
            status: 200,
            msg: "Séjour et équipements récupérés avec succès.",
            stay 
        });
    } catch (error) {
        // Gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            msg: "Oups, une erreur est survenue"
        });
    }
};

// Lister toutes les associations StayCategory
exports.getAllStayEquipments = async (req, res) => {
    try {
        const associations = await StayEquipment.findAll({
            include: [
                { model: Stay, as: 'stay' },
                { model: Category, as: 'category' },
            ]
        });

        // Vérification si aucune association n'est trouvée
        if (associations.length === 0) {
            return res.json({
                status: 404,
                msg: "Aucune association trouvée entre Stay et Category."
            });
        }

        // Réponse
        res.json({
            status: 200,
            msg: "Associations récupérées avec succès",
            stayEquipment: associations
        });
    } catch (error) {
        // Gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            msg: "Erreur serveur",
            error: error.message
        });
    }
};

// Supprimer une equipement d'un séjour
exports.removeStayEquipment = async (req, res) => {
    const { id } = req.params;

    try {
        const stayEquipment = await StayEquipment.findByPk(id);

        // Si pas trouvé
        if (!stayEquipment) {
            return res.json({
                status: 404,
                msg: "Association introuvable."
            });
        }

        // Suppression
        await StayEquipment.destroy({
            where: { id: stayEquipment.id }
        });

        // Réponse
        res.json({
            status: 200,
            msg: "Association supprimée avec succès.",
            stayEquipment
        });
    } catch (error) {
        // Gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            msg: "Erreur serveur",
            error: error.message
        });
    }
};
