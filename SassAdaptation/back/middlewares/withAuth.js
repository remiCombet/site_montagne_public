const jwt = require("jsonwebtoken");
require('dotenv').config();
const secret = process.env.JWT_SECRET;

const withAuth = (req, res, next) => {
    // Récupération du token dans le header
    const token = req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];

    // Si pas de token
    if (!token) {
        return res.json({ status:401, msg: "Access token is missing"});
    }

    try {
        // vérification du token
        const decoded = jwt.verify(token, secret);

        // Ajout des informations essentielles
        req.user = {
            id: decoded.userId,
            isAdmin: decoded.isAdmin || false,
        };

        // Middleware suivant
        next ();
    } catch (error) {
        return res.json({ status:404, message: "Invalid or expired token" });
    }
};

module.exports = withAuth;