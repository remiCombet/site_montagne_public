const { Category } = require('../models');
const category = require('../models/category');

// attention supprimer les reponse dans les catch error: error.message en prod

// Ajouter un catégorie
exports.createCategory = async (req, res) => {
    const { type, name, description } = req.body;

    try {
        // Tout est ok
        const newCategory = await Category.create({
            type,
            name,
            description
        });

        // message
        res.json({
            status: 200,
            msg: "catégorie créé avec succès",
            category: newCategory
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

// getAllcategories