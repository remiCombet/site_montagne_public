// Map pour stocker les tentatives par IP
const ipRequestsMap = new Map();

// Rate limiter middleware
const contactRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 60 secondes
  
  if (ipRequestsMap.has(ip)) {
    const lastRequest = ipRequestsMap.get(ip);
    const timeSinceLastRequest = now - lastRequest;
    
    if (timeSinceLastRequest < windowMs) {
      const remainingTime = Math.ceil((windowMs - timeSinceLastRequest) / 1000);
      return res.status(429).json({ 
        success: false,
        message: `Trop de requêtes. Veuillez réessayer dans ${remainingTime} secondes.` 
      });
    }
  }
  
  // Enregistrer cette requête
  ipRequestsMap.set(ip, now);
  
  // Nettoyer les anciennes entrées toutes les heures
  if (ipRequestsMap.size > 1000) {
    const oneHourAgo = now - (60 * 60 * 1000);
    for (const [key, timestamp] of ipRequestsMap.entries()) {
      if (timestamp < oneHourAgo) {
        ipRequestsMap.delete(key);
      }
    }
  }
  
  next();
};

module.exports = contactRateLimiter;