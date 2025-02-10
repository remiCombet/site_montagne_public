const { Theme } = require('../models');
const { validationResult } = require('express-validator');

// attention supprimer les reponse dans les catch error: error.message en prod

// Ajouter un theme
exports.createTheme = async (req, res) => {
    const { name } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json({
            status: 400,
            msg: 'Erreur de validation',
            errors: errors.array(),
        });
    }

    try {
        // Tout est ok
        const newhighlight = await Theme.create({
            name
        });

        // message
        res.json({
            status: 200,
            msg: "theme créé avec succès",
            theme: newhighlight
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

// récupérer tous les themes
exports.getAllTheme = async (req, res) => {
    try {
        const themes = await Theme.findAll();

        // cas ou pas de theme trouvé
        if (!themes || themes.length === 0) {
            return res.json({
                status: 404,
                msg: "aucun theme trouvée"
            });
        }

        // cas ou theme est trouvé
        res.json({
            status: 200,
            themes
        });
    } catch (error) {
        // Gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération des themes"
        });
    }
};

// Récupérer un point positif par son id
exports.getThemeById = async (req, res) => {
    const { id } = req.params;

    try {
        const theme = await Theme.findByPk(id);

        // cas ou pas de theme trouvé
        if (!theme) {
            return res.json({
                status: 404,
                msg: "aucun theme trouvé"
            });
        }

        // cas positif, réponse
        res.json({
            status: 200,
            theme
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération du theme"
        });
    }
};

// Modifier un point positif
exports.updateTheme = async (req, res) => {
    const errors = validationResult(req);
    const { id } = req.params;
    const { name } = req.body;

    if (!errors.isEmpty()) {
        return res.json({
            status: 400,
            msg: 'Erreur de validation',
            errors: errors.array(),
        });
    }

    try {
        const theme = await Theme.findByPk(id);

        // cas ou pas de theme trouvé
        if (!theme) {
            return res.json({
                status: 404,
                msg: "aucun theme trouvé"
            });
        }

        // cas ou tout est bon
        theme.name = name || theme.name;

        // sauvegarde des changements
        await theme.save();

        // réponse positive
        res.json ({
            status : 200,
            msg: "theme modifié avec succes",
            theme
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la modification du theme"
        });
    }
};

// Supprimer un theme
exports.deleteTheme = async (req, res) => {
    const { id } = req.params;

    try {
        const theme = await Theme.findByPk(id);

        // cas ou pas de theme trouvé
        if (!theme) {
            return res.json({
                status: 404,
                msg: "aucune theme trouvée"
            });
        }

        // catégorie trouvé, suppression
        await theme.destroy();

        // réponse
        res.json({
            status : 200,
            msg: "theme supprimé avec succes"
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