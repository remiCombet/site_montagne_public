const { Category } = require('../models');

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

// récupérer toutes les catégories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();

        // cas ou pas de catégorie trouvé
        if (!categories || categories.length === 0) {
            return res.json({
                status: 404,
                msg: "aucune catégorie trouvée"
            });
        }

        // cas ou la catégorie est trouvée
        res.json({
            status: 200,
            category: categories
        });
    } catch (error) {
        // Gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération des catégories"
        });
    }
};

// Récupérer une catégorie par son id
exports.getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        // cas ou pas de catégorie trouvé
        if (!category) {
            return res.json({
                status: 404,
                msg: "aucune catégorie trouvée"
            });
        }

        // cas positif, réponse
        res.json({
            status: 200,
            category
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération de la catégorie"
        });
    }
};

// Modifier une catégorie
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { type, name, description } = req.body;

    try {
        const category = await Category.findByPk(id);

        // cas ou pas de catégorie trouvé
        if (!category) {
            return res.json({
                status: 404,
                msg: "aucune catégorie trouvée"
            });
        }

        // cas ou tout est bon
        category.type = type || category.type;
        category.name = name || category.name;
        category.description = description || category.description;

        // sauvegarde des changements
        await category.save();

        // réponse positive
        res.json ({
            status : 200,
            msg: "catégorie modifiée avec succes",
            category
        });
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la modification de la catégorie"
        });
    }
};

// Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        // cas ou pas de catégorie trouvé
        if (!category) {
            return res.json({
                status: 404,
                msg: "aucune catégorie trouvée"
            });
        }

        // catégorie trouvé, suppression
        await category.destroy();

        // réponse
        res.json({
            status : 200,
            msg: "catégorie supprimée avec succes"
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