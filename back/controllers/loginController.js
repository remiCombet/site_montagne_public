const { User } = require('../models');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

// Fonction pour connecter un utilisateur
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Vérification des paramètres
    if (!email || !password) {
        return res.json({ status: 400, msg: "Veuillez fournir un email et un mot de passe." });
    }

    try {
        // Recherche de l'utilisateur par email
        const user = await User.findOne({ where: { email } });

        // Vérification si l'utilisateur existe
        if (!user) {
            return res.json({ status: 404, msg: "Utilisateur non trouvé" });
        }

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ status: 400, msg: "Mot de passe incorrect"});
        }

        // Création du token JWT
        const payload = {
            userId: user.id,  // Id de l'utilisateur
            isAdmin: user.id_role === 1 || false,  // Ajout du statut d'administrateur
        };

        // Génération du token (avec une expiration de 1 heure par exemple)
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });

        // Envoi de la réponse avec le token
        res.json({
            status: 200,
            msg: "Connexion réussie",
            token,
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                role: user.id_role === 1 ? "admin" : "user",
            }
        });
    } catch (error) {
        console.error(error);
        res.json({ status: 500, msg: "Erreur serveur lors de la connexion" });
    }
};

// Fonction de reconnexion
exports.checkToken = async (req, res) => {
    try {
        const { id, isAdmin } = req.user;
        
        // Recherche de l'utilisateur dans la base de données
        const user = await User.findByPk(id);

        // Vérification si l'utilisateur existe encore dans la base de données
        if (!user) {
            return res.json({ status:404, msg: "Utilisateur non trouvé" });
        }

        // Réponse avec les informations utilisateur
        res.json({
            status: 200,
            msg: "Token valide",
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                role: user.id_role === 1 ? "admin" : "user",
            },
        });
    } catch (error) {
        console.error(error);
        res.json({ status: 500, msg: "Erreur serveur lors de la vérification du token" })
    }
};
