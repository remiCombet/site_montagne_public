const { Accommodation } = require('../models');

// Récupérer toutes les accommodations
exports.getAllAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.findAll();
    
    if (accommodations.length === 0) {
      return res.json({
        status: 404,
        msg: 'Aucune accommodation trouvée.',
      });
    }
    
    res.json({
      status: 200,
      msg: 'Liste des accommodations récupérées avec succès.',
      accommodations,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: "Oups, une erreur est survenue lors de la récupération des accommodations.",
    });
  }
};


// Récupérer une accommodation par son ID
exports.getAccommodationById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const accommodation = await Accommodation.findByPk(id);
    if (accommodation) {
      res.json({
        status: 200,
        msg: 'Accommodation récupérée avec succès.',
        accommodation,
      });
    } else {
      res.json({
        status: 404,
        msg: 'Accommodation non trouvée.',
      });
    }
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: "Oups, une erreur est survenue lors de la récupération de l'accommodation.",
    });
  }
};

// Récupérer un logement en fonction de l'étape 
exports.getAccommodationByStayStep = async (req, res) => {
  const { stayStepId } = req.params;

  try {
    // Vérifier si l'étape de séjour existe
    const stayStep = await StayStep.findByPk(stayStepId);
    if (!stayStep) {
      return res.json({
        status: 404,
        msg: 'L\'étape de séjour spécifiée n\'existe pas.',
      });
    }

    // Récupérer l'hébergement lié à cette étape
    const accommodation = await Accommodation.findByPk(stayStep.accommodation_id);
    if (!accommodation) {
      return res.json({
        status: 404,
        msg: 'Aucun hébergement trouvé pour cette étape de séjour.',
      });
    }

    res.json({
      status: 200,
      msg: 'Hébergement récupéré avec succès.',
      accommodation,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: 'Oups, une erreur est survenue lors de la récupération de l\'hébergement.',
    });
  }
};

// Créer une nouvelle accommodation
exports.createAccommodation = async (req, res) => {
  const { name, description, meal_type, meal_description } = req.body;

  try {
    const accommodation = await Accommodation.create({
      name,
      description,
      meal_type,
      meal_description,
    });

    res.json({
      status: 201,
      msg: 'Accommodation créée avec succès.',
      accommodation,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: "Oups, une erreur est survenue lors de la création de l'accommodation.",
    });
  }
};

// Mettre à jour une accommodation
exports.updateAccommodation = async (req, res) => {
  const { id } = req.params;
  const { name, description, meal_type, meal_description } = req.body;

  try {
    const accommodation = await Accommodation.findByPk(id);

    if (accommodation) {
      await accommodation.update({
        name,
        description,
        meal_type,
        meal_description,
      });

      res.json({
        status: 200,
        msg: 'Accommodation mise à jour avec succès.',
        accommodation,
      });
    } else {
      res.json({
        status: 404,
        msg: 'Accommodation non trouvée.',
      });
    }
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: "Oups, une erreur est survenue lors de la mise à jour de l'accommodation.",
    });
  }
};

// Supprimer une accommodation
exports.deleteAccommodation = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Accommodation.destroy({
      where: { id },
    });

    if (deleted) {
      res.json({
        status: 200,
        msg: 'Accommodation supprimée avec succès.',
      });
    } else {
      res.json({
        status: 404,
        msg: 'Accommodation non trouvée.',
      });
    }
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: "Oups, une erreur est survenue lors de la suppression de l'accommodation.",
    });
  }
};
