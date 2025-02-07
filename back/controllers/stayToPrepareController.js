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

// Récupérer tous les équipements à prévoir liés à un séjour
exports.getToPrepareByStayId = async (req, res) => {
    try {
        const { stay_id } = req.params;

        // Récupérer les éléments à prévoir pour le séjour donné
        const toPrepare = await StayToPrepare.findAll({
            where: { stay_id },
            include: {
                model: Category,
                as: 'category'
            }
        });

        // Regrouper les éléments par type de catégorie (ex: vetement, pharmacie)
        const groupedToPrepare = toPrepare.reduce((acc, item) => {
            const categoryType = item.category.type;
            if (!acc[categoryType]) {
                acc[categoryType] = [];
            }
            acc[categoryType].push(item);
            return acc;
        }, {});

        // Reformater la réponse pour correspondre à la structure souhaitée
        const response = {
            status: 200,
            toPrepare: groupedToPrepare
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.json({ status: 500, msg: 'Erreur serveur' });
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
