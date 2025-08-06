const entities = require('entities');

// Middleware pour décoder les paramètres d'URL et query uniquement sur les routes GET
const decodeGetData = (req, res, next) => {
  if (req.method === 'GET') {
    // Décoder les paramètres de la requête GET (query et params)
    if (req.query) {
      Object.keys(req.query).forEach((key) => {
        req.query[key] = entities.decodeHTML(req.query[key]);
      });
    }

    if (req.params) {
      Object.keys(req.params).forEach((key) => {
        req.params[key] = entities.decodeHTML(req.params[key]);
      });
    }
  }
  next();
};

module.exports = decodeGetData;
