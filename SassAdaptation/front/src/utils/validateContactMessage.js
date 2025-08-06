/**
 * Valide les données du formulaire de contact
 * @param {string} message - Le contenu du message à vérifier
 * @returns {Object} Un objet contenant isValid (booléen) et errors (tableau de messages d'erreur)
 */
export const validateContactMessage = (message) => {
    const errors = [];
    
    // Vérification de base - présence du message
    if (!message || message.trim().length === 0) {
        errors.push("Le message ne peut pas être vide");
    }
    
    // Vérification de la longueur maximale
    if (message && message.trim().length > 2000) {
        errors.push("Le message ne doit pas dépasser 2000 caractères");
    }
    
    // Détection de patterns potentiellement dangereux
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /onerror=/i,
        /onload=/i,
        /onclick=/i,
        /data:.*base64/i,
        /eval\(/i,
        /document\.cookie/i,
        /<iframe/i,
        /<embed/i
    ];
    
    if (message && suspiciousPatterns.some(pattern => pattern.test(message))) {
        errors.push("Le message contient du contenu non autorisé");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Vérifie si un utilisateur peut soumettre un nouveau message (limitation de débit)
 * @param {number} lastSubmissionTime - Timestamp du dernier envoi réussi
 * @param {number} [minInterval=60000] - Intervalle minimum entre deux envois (ms)
 * @returns {Object} Un objet contenant canSubmit (booléen) et waitTime (secondes à attendre)
 */
export const checkRateLimit = (lastSubmissionTime, minInterval = 60000) => {
    if (!lastSubmissionTime) {
        return { canSubmit: true, waitTime: 0 };
    }
    
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    
    if (timeSinceLastSubmission < minInterval) {
        const waitTimeSeconds = Math.ceil((minInterval - timeSinceLastSubmission) / 1000);
        return {
            canSubmit: false,
            waitTime: waitTimeSeconds
        };
    }
    
    return { canSubmit: true, waitTime: 0 };
};