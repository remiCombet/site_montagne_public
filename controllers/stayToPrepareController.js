const { StayToPrepare, Stay, Category } = require('../models');
const { validationResult } = require('express-validator');

// Ajouter un équipement à un séjour
exports.addStayToPrepare = async (req, res) => {
    const { stay_id, category_id } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json({
        status: 400,
        msg: 'Erreur de validation',
        errors: errors.array(),
        });
    }

    if (!stay_id || !category_id) {
        return res.json({
            status: 400,
            msg: "stay_id et category_id sont requis."
        });
    }

    try {
        const stayToPrepare = await StayToPrepare.create({ stay_id, category_id });

        // Réponse
        res.json({
            status: 200,
            msg: "équipement à emmener ajouté au séjour avec succès",
            stayToPrepare
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
exports.getToPreparesByStay = async (req, res) => {
    const { stay_id } = req.params;

    try {
        // Récupérer le séjour avec ses équipements associés
        const stay = await Stay.findByPk(stay_id, {
            include: [
                {
                    model: StayToPrepare,
                    as: 'toPrepares',
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
            msg: "Séjour et équipements à emmener récupérés avec succès.",
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
exports.getAllStayToPrepares = async (req, res) => {
    try {
        const associations = await StayToPrepare.findAll({
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
            stayToPrepare: associations
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
exports.removeStayToPrepare = async (req, res) => {
    const { id } = req.params;

    try {
        const stayToPrepare = await StayToPrepare.findByPk(id);

        // Si pas trouvé
        if (!stayToPrepare) {
            return res.json({
                status: 404,
                msg: "Association introuvable."
            });
        }

        // Suppression
        await StayToPrepare.destroy({
            where: { id: stayToPrepare.id }
        });

        // Réponse
        res.json({
            status: 200,
            msg: "Association supprimée avec succès.",
            stayToPrepare
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
