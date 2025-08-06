const { StayStep, Stay, Accommodation } = require('../models'); // Assurez-vous que ces modèles sont importés correctement

// Récupérer toutes les étapes de séjour pour un séjour spécifique
exports.getAllStaySteps = async (req, res) => {
  const { stayId } = req.params;
  console.log('stayId :',stayId)
  try {
    const staySteps = await StayStep.findAll({
      where: { stay_id: stayId },
      attributes: [ 'id', 'stay_id', 'step_number', 'title', 'description', 'duration', 'elevation_gain', 'elevation_loss'],
      include: [
        { model: Accommodation, as: 'accommodation' },
      ],
    });

    if (staySteps.length === 0) {
      return res.json({
        status: 404,
        msg: 'Aucune étape de séjour trouvée pour ce séjour.',
      });
    }

    res.json({
      status: 200,
      msg: 'Les étapes de séjour ont été récupérées avec succès.',
      staySteps,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: 'Oups, une erreur est survenue lors de la récupération des étapes de séjour.',
    });
  }
};

// Créer une nouvelle étape de séjour
exports.createStayStep = async (req, res) => {
  const { accommodation_id, step_number, title, description, duration, elevation_gain, elevation_loss } = req.body;
  const { stayId } = req.params;

  try {
    const stayStep = await StayStep.create({
      step_number,
      title,
      description,
      duration,
      elevation_gain,
      elevation_loss,
      stay_id: stayId,
      accommodation_id,
    });

    res.json({
      status: 201,
      msg: 'L\'étape de séjour a été créée avec succès.',
      stayStep,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: 'Oups, une erreur est survenue lors de la création de l\'étape de séjour.',
    });
  }
};

// Récupérer une étape de séjour par son ID
exports.getStayStepById = async (req, res) => {
    const { stayId, stepId } = req.params;
  
    try {
      // Trouver l'étape de séjour correspondante
      const stayStep = await StayStep.findOne({
        where: {
          id: stepId,
          stay_id: stayId,
        },
        include: [
          {
            model: Accommodation,
            as: 'accommodation',
          },
        ],
      });
  
      // Si l'étape de séjour n'est pas trouvée, envoyer une erreur
      if (!stayStep) {
        return res.status(404).json({
          status: 404,
          msg: 'L\'étape de séjour n\'a pas été trouvée.',
        });
      }
  
      // Sinon, envoyer la réponse avec les informations de l'étape de séjour
      res.json({
        status: 200,
        msg: 'Étape de séjour récupérée avec succès.',
        stayStep,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        msg: "Oups, une erreur est survenue lors de la récupération de l'étape de séjour.",
      });
    }
  };

// Mettre à jour une étape de séjour
exports.updateStayStep = async (req, res) => {
  const { stayId, stepId } = req.params;
  const { accommodation_id, step_number, title, description, duration, elevation_gain, elevation_loss } = req.body;

  try {
    const stayStep = await StayStep.findOne({
      where: {
        id: stepId,
        stay_id: stayId
      }
    });

    if (!stayStep) {
      return res.json({
        status: 404,
        msg: 'Étape de séjour non trouvée.',
      });
    }

    await stayStep.update({
      step_number,
      title,
      description,
      duration,
      elevation_gain,
      elevation_loss,
      accommodation_id,
    });

    res.json({
      status: 200,
      msg: 'L\'étape de séjour a été mise à jour avec succès.',
      stayStep,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: 'Oups, une erreur est survenue lors de la mise à jour de l\'étape de séjour.',
    });
  }
};

// Supprimer une étape de séjour
exports.deleteStayStep = async (req, res) => {
  const { stayId, stepId } = req.params;

  try {
    const stayStep = await StayStep.findOne({
      where: {
        id: stepId,
        stay_id: stayId
      }
    });

    if (!stayStep) {
      return res.json({
        status: 404,
        msg: 'Étape de séjour non trouvée.',
      });
    }

    await stayStep.destroy();

    res.json({
      status: 200,
      msg: 'L\'étape de séjour a été supprimée avec succès.',
    });
  } catch (error) {
    console.error('Erreur de suppression:', error);
    res.json({
      status: 500,
      msg: 'Oups, une erreur est survenue lors de la suppression de l\'étape de séjour.',
    });
  }
};
