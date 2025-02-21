const { StayTheme, Stay, Theme } = require('../models');
const { validationResult } = require('express-validator');

// Récupérer tous les thèmes associés à un séjour
exports.getThemesByStay = async (req, res) => {
  const { stay_id } = req.params;
  console.log('zbrah: ', stay_id)
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.json({
      status: 400,
      msg: 'Erreur de validation',
      errors: errors.array(),
    });
  }

  try {
    const stayThemes = await StayTheme.findAll({
      where: { stay_id },
      include: [
        { model: Stay, as: 'stay' },
        { model: Theme, as: 'theme' },
      ],
    });

    if (stayThemes.length === 0) {
      return res.json({
        status: 404,
        msg: 'Aucun thème trouvé pour ce séjour.',
      });
    }

    // Extraire les données du séjour (les afficher une seule fois)
    // On prend le premier séjour car ils sont tous identiques
    const stayData = stayThemes[0].stay;

    // Extraire uniquement les informations des thèmes
    const themes = stayThemes.map(stayTheme => ({
      id: stayTheme.theme.id,
      name: stayTheme.theme.name,
    }));

    res.json({
      status: 200,
      msg: 'Thèmes récupérés avec succès.',
      themes: themes,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: "Oups, une erreur est survenue",
    });
  }
};



// Ajouter un thème à un séjour
exports.addThemeToStay = async (req, res) => {
  const { stayId, themeId} = req.body;
  console.log("stay :", stayId, "theme :", themeId)
  try {
    // Vérifier si le thème est déjà associé à ce séjour
    const existingAssociation = await StayTheme.findOne({
      where: { stay_id: stayId, theme_id: themeId }
    });

    if (existingAssociation) {
        return res.status(400).json({ status: 400, msg: "Ce thème est déjà associé à ce séjour." });
    }

    const stayTheme = await StayTheme.create({
      stay_id: stayId,
      theme_id: themeId,
    });

    res.json({
      status: 201,
      msg: 'Thème ajouté au séjour avec succès.',
      stayTheme,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: "Oups, une erreur est survenue",
      error: error
    });
  }
};

// Supprimer un thème d'un séjour
exports.removeThemeFromStay = async (req, res) => {
  const { stay_id, theme_id } = req.params;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.json({
      status: 400,
      msg: 'Erreur de validation',
      errors: errors.array(),
    });
  }

  try {
    const deleted = await StayTheme.destroy({
      where: {
        stay_id,
        theme_id,
      },
    });

    if (deleted) {
      res.json({
        status: 200,
        msg: 'Thème supprimé du séjour avec succès.',
      });
    } else {
      res.json({
        status: 404,
        msg: 'Aucun thème trouvé pour ce séjour.',
      });
    }
  } catch (error) {
    console.error(error);
    res.json({
      status: 500,
      msg: "Oups, une erreur est survenue",
    });
  }
};

// fonction pour vérifier si un theme est ssocié a un séjour
exports.checkThemeUsage = async (req, res) => {
  try {
      const { themeId } = req.params;

      // Vérifier si ce thème est encore utilisé dans `stay_theme`
      const stayCount = await StayTheme.count({ where: { theme_id: themeId } });

      res.json({ status: 200, isUsed: stayCount > 0 });
  } catch (error) {
      console.error("Erreur lors de la vérification du thème :", error);
      res.json({ status: 500, msg: "Erreur serveur lors de la vérification du thème." });
  }
};
