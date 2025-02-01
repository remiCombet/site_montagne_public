const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// attention supprimer les reponse dans les catch error: error.message en prod

// Ajouter un utilisateur
exports.createUser = async (req, res) => {
    const { firstname, lastname, email, password, phone } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json({
            status: 400,
            msg: 'Erreur de validation',
            errors: errors.array(),
        });
    }

    try {
        // Vérification si l'adresse email est déja dans la bdd
        const existingUser = await User.findOne({ where : { email }});
        if (existingUser) {
            return res.json({
                status: 400,
                msg: "email déjà pris"
            });
        }
        
        // hasshage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cas ou tout est ok, création du nouvel utilisateur
        const newUser = await User.create({
            firstname,
            lastname,
            email,
            password : hashedPassword,
            phone,
            role: 'user'
        });

        // réponse positive
        res.json({
            status: 200,
            msg: "utilisateur créé avec succès",
            user: newUser
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
}

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        // cas ou utilisateur non trouvé
        if (!users || users.length === 0) {
            return res.json({
                status: 404,
                msg: "aucun utilisateur trouvé"
            });
        }

        // Utilisateurs trouvés
        res.json({
            status: 200,
            users
        });
    } catch (error) {
        // Gestion des erreurs
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération des utilisateurs"
        });
    }
}

// Récupérer un utilisateur par son id
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json({
            status: 400,
            msg: 'Erreur de validation',
            errors: errors.array(),
        });
    }

    try {
        const user = await User.findByPk(id);

        // Cas ou utilisateur non trouvé
        if (!user) {
            return res.json({
                status: 404,
                msg: "utilisateur non trouvé"
            });
        }

        // cas positif
        res.json({
            status:200,
            user,
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            message: "Erreur serveur lors de la récupération de l'utilisateur"
        });
    }
}

// Modifier un utilisateur
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, phone } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.json({
            status: 400,
            msg: 'Erreur de validation',
            errors: errors.array(),
        });
    }

    try {
        const user = await User.findByPk(id);

        // non trouvé
        if (!user) {
            return res.json({
                status: 404,
                msg: "utilisateur non trouvé"
            })
        }

         // vérification si l'adresse modifiée n'est pas déja dans la bdd
         if (email && email !== user.email) {
                const existingUser = await User.findOne({ where : {email} });

                // si elle est déja présente, réponse
                if (existingUser) {
                    return res.json({
                        status: 400,
                        msg: 'Cet email est déjà enregistré. Veuillez en utiliser un autre.'
                    });
                }

         }

        //  tout est bon
        user.firstname = firstname || user.firstname;
        user.lastname = lastname || user.lastname;
        user.email = email || user.email;
        user.phone = phone || user.phone;

        // sauvegarde des changements
        await user.save();

        // réponse
        res.json({
            status: 200,
            msg: "utilisateur modifié avec succès",
            user,
        })

    } catch (error) {
        console.error(error);
        res.json({
            status:500,
            msg: "oups une erreur est survenue",
            error: error.message 
        });
    }
}

// supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    // const loggdInUserId = req.user.id;
    // const isAdmin = req.user.isAdmin;

    try {
        const user = await User.findByPk(id);
        
        // non trouvé
        if (!user) {
            return res.json({
                status: 404,
                msg: "utilisateur non trouvé"
            });
        }

        // Vérification : utilisateur authentifié modifie son propre compte, ou c'est un admin?
        // if (user.id !== loggdInUserId && !isAdmin) {
        //     return res.json({
        //         status: 403,
        //         msg: "vous ne pouvez pas modifier ce compte"
        //     })
        // }

        // Utilisateur trouvé, suppression
        await user.destroy();

        // réponse
        res.json({
            status: 200,
            msg: "utilisateur supprimé avec succès"
        })
    } catch (error) {
        // gestion des erreurs
        console.error(error);
        res.json({
            status:500,
            msg: "oups une erreur est survenue",
            error: error.message 
        });
    }
}