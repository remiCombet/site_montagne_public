const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Créer une fenêtre DOM virtuelle pour DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - The input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Sanitiser avec DOMPurify
  let sanitized = DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [], // Aucune balise HTML autorisée
    ALLOWED_ATTR: [] // Aucun attribut autorisé
  });
  
  // Vérifier les patterns suspects même après sanitization
  const suspiciousPatterns = [
    /javascript:/i,
    /data:.*base64/i,
    /eval\(/i,
    /document\.cookie/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(sanitized))) {
    return '[Contenu supprimé pour des raisons de sécurité]';
  }
  
  return sanitized;
};

/**
 * Validate contact message
 * @param {string} message - The message to validate
 * @returns {Object} Validation result with isValid and errors
 */
const validateContactMessage = (message) => {
  const errors = [];
  
  if (!message || message.trim().length === 0) {
    errors.push("Le message ne peut pas être vide");
  } else if (message.length > 2000) {
    errors.push("Le message ne doit pas dépasser 2000 caractères");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  sanitizeInput,
  validateContactMessage
};