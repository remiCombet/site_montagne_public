const { Stay } = require('../models');  // Assure-toi que le modèle `Stay` est bien importé

// Middleware pour vérifier l'existence du stayId
const checkStayIdExists = async (req, res, next) => {
    const { stayId } = req.params;
    console.log('Vérification du stayId dans le middleware:', stayId);  // Vérifie ce que contient `stayId`
  
    try {
      const stay = await Stay.findByPk(stayId);  // Vérifie si le séjour existe dans la base de données
  
      if (!stay) {
        return res.status(404).json({
          status: 404,
          msg: "Le séjour avec cet ID n'existe pas.",
        });
      }
  
      // Si le séjour existe, on passe à la suite
      console.log('stay trouvé, on passe à la suite');  // Log ici pour confirmer
      next();
    } catch (error) {
      console.error('Erreur lors de la vérification du stayId:', error);
      return res.status(500).json({
        status: 500,
        msg: 'Erreur lors de la vérification de l\'ID du séjour.',
      });
    }
  };
  

module.exports = { checkStayIdExists };