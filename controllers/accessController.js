const { Access } = require('../models');

// attention supprimer les reponse dans les catch error: error.message en prod

// Ajouter un acces
exports.createAccess = async (req, res) => {
    const { category, informations } = req.body;

    try {
        // Tout est ok
        const newAccess = await Access.create({
            category,
            informations
        });

        // message
        res.json({
            status: 200,
            msg: "acces créé avec succès",
            access: newAccess
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
exports.getAllAccess = async (req, res) => {
    try {
        const access = await Access.findAll();

        // cas ou pas de acces trouvé
        if (!access || access.length === 0) {
            return res.json({
                status: 404,
                msg: "aucun acces trouvée"
            });
        }

        // cas ou le acces est trouvé
        res.json({
            status: 200,
            access
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

// Récupérer un acces par son id
exports.getAccessById = async (req, res) => {
    const { id } = req.params;

    try {
        const access = await Access.findByPk(id);

        // cas ou pas de acces trouvé
        if (!access) {
            return res.json({
                status: 404,
                msg: "aucun acces trouvé"
            });
        }

        // cas positif, réponse
        res.json({
            status: 200,
            access
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération du acces"
        });
    }
};

// Modifier un acces
exports.updateAccess = async (req, res) => {
    const { id } = req.params;
    const { category, informations } = req.body;

    try {
        const access = await Access.findByPk(id);

        // cas ou pas de acces trouvé
        if (!access) {
            return res.json({
                status: 404,
                msg: "aucun acces trouvé"
            });
        }

        // cas ou tout est bon
        access.category = category || access.category;
        access.informations = informations || access.informations;

        // sauvegarde des changements
        await access.save();

        // réponse positive
        res.json ({
            status : 200,
            msg: "acces modifié avec succes",
            access
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la modification du acces"
        });
    }
};

// Supprimer un acces
exports.deleteAccess = async (req, res) => {
    const { id } = req.params;

    try {
        const access = await Access.findByPk(id);

        // cas ou pas de acces trouvé
        if (!access) {
            return res.json({
                status: 404,
                msg: "aucune acces trouvée"
            });
        }

        // acces trouvé, suppression
        await access.destroy();

        // réponse
        res.json({
            status : 200,
            msg: "acces supprimé avec succes"
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