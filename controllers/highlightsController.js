const { Highlight } = require('../models');

// attention supprimer les reponse dans les catch error: error.message en prod

// Ajouter un point positif
exports.createHighlights = async (req, res) => {
    const { title, description, stay_id } = req.body;

    try {
        // Tout est ok
        const newhighlight = await Highlight.create({
            title,
            description,
            stay_id
        });

        // message
        res.json({
            status: 200,
            msg: "point positif créé avec succès",
            hightlight: newhighlight
        });
    } catch (error) {
        // gestion des erreurs
        console.error('erreur lors de la création:', error);

        // réponse
        res.json({
            status: 500,
            msg: "oups une erreur est survenue",
            error: error.message,
        });
    }
};

// récupérer tous les points positifs
exports.getAllHighlights = async (req, res) => {
    try {
        const highlights = await Highlight.findAll();

        // cas ou pas de point positif trouvé
        if (!highlights || highlights.length === 0) {
            return res.json({
                status: 404,
                msg: "aucun point positif trouvée"
            });
        }

        // cas ou le point positif est trouvé
        res.json({
            status: 200,
            highlights
        });
    } catch (error) {
        // Gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération des points positifs"
        });
    }
};

// Récupérer un point positif par son id
exports.getHighlightsById = async (req, res) => {
    const { id } = req.params;

    try {
        const highlight = await Highlight.findByPk(id);

        // cas ou pas de point positif trouvé
        if (!highlight) {
            return res.json({
                status: 404,
                msg: "aucun point positif trouvé"
            });
        }

        // cas positif, réponse
        res.json({
            status: 200,
            highlight
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération du point positif"
        });
    }
};

// Modifier un point positif
exports.updateHighlights = async (req, res) => {
    const { id } = req.params;
    const { title, description, stay_id } = req.body;

    try {
        const highlight = await Highlight.findByPk(id);

        // cas ou pas de point positif trouvé
        if (!highlight) {
            return res.json({
                status: 404,
                msg: "aucun point positif trouvé"
            });
        }

        // cas ou tout est bon
        highlight.title = title || highlight.title;
        highlight.description = description || highlight.description;
        highlight.stay_id = stay_id || highlight.stay_id;

        // sauvegarde des changements
        await highlight.save();

        // réponse positive
        res.json ({
            status : 200,
            msg: "point positif modifié avec succes",
            highlight
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la modification du point positif"
        });
    }
};

// Supprimer un point positif
exports.deleteHighlights = async (req, res) => {
    const { id } = req.params;

    try {
        const highlight = await Highlight.findByPk(id);

        // cas ou pas de point positif trouvé
        if (!highlight) {
            return res.json({
                status: 404,
                msg: "aucune point positif trouvée"
            });
        }

        // catégorie trouvé, suppression
        await highlight.destroy();

        // réponse
        res.json({
            status : 200,
            msg: "point positif supprimé avec succes"
        })
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status:500,
            msg: "oups une erreur est survenue"
        });
    }
};