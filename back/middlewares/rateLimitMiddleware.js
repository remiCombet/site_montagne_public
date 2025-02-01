const rateLimit = require('express-rate-limit');

// Limiter le nombre de tentatives de connexion
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite chaque IP à 5 requêtes
    message: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
});

module.exports = loginLimiter;
