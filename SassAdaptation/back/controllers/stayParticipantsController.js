const { StayParticipant, Stay, User } = require("../models");

/**
 * Récupère tous les participants d'un séjour donné.
 * URL attendue : GET /api/stayParticipants/:stay_id
 */
// exports.getStayParticipants = async (req, res) => {
//   const { stay_id } = req.params;
//   try {
//     const participants = await StayParticipant.findAll({
//       where: { stay_id }
//     });
//     return res.status(200).json({
//       status: 200,
//       msg: "Participants récupérés avec succès",
//       data: participants
//     });
//   } catch (error) {
//     console.error("Erreur lors de la récupération des participants :", error);
//     return res.status(500).json({
//       status: 500,
//       msg: "Erreur serveur lors de la récupération des participants",
//       error: error.message
//     });
//   }
// };

/**
 * Ajoute un nouveau participant (une demande de réservation) pour un séjour.
 * Le middleware checkMaxParticipants doit avoir validé que l'ajout ne dépasse pas la capacité maximale.
 * URL attendue : POST /api/stayParticipants
 */
exports.addStayParticipant = async (req, res) => {
  const { stay_id, participant_id, people_number, status, comment } = req.body;
  try {
    console.log(stay_id, participant_id, people_number, status, comment)
    const newParticipant = await StayParticipant.create({
      stay_id,
      participant_id,
      people_number,
      //  status: status || 'en_attente_validation',
      comment
    });
    console.log(newParticipant)
    // Recalculer le nombre total de participants (toutes demandes confondues) et mettre à jour le statut du séjour.
    // await updateStayStatus(stay_id);

    return res.status(200).json({
      status: 200,
      msg: "Demande de réservation ajoutée avec succès",
      participants: newParticipant
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du participant :", error);
    return res.status(500).json({
      status: 500,
      msg: "Erreur serveur lors de l'ajout du participant",
      error: error.message
    });
  }
};

/**
 * Mise à jour d'une demande de réservation par l'utilisateur (sans modification du statut).
 * URL attendue : PUT /api/stayParticipants/:id
 */
exports.updateStayParticipant = async (req, res) => {
  const { id } = req.params;
  const { people_number, comment } = req.body;
  try {
    const participant = await StayParticipant.findByPk(id);
    if (!participant) {
      return res.status(404).json({
        status: 404,
        msg: "Participant introuvable"
      });
    }

    // Mise à jour des champs autorisés pour l'utilisateur
    participant.people_number = people_number !== undefined ? people_number : participant.people_number;
    participant.comment = comment || participant.comment;
    await participant.save();

    // Recalculer et mettre à jour le statut du séjour en fonction de toutes les demandes
    await updateStayStatus(participant.stay_id);

    return res.status(200).json({
      status: 200,
      msg: "Participant mis à jour avec succès",
      data: participant
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du participant :", error);
    return res.status(500).json({
      status: 500,
      msg: "Erreur serveur lors de la mise à jour du participant",
      error: error.message
    });
  }
};

/**
 * Supprime une demande de réservation (stayParticipant).
 * URL attendue : DELETE /api/stayParticipants/:id
 */
exports.deleteStayParticipant = async (req, res) => {
  const { id } = req.params;
  try {
    const participant = await StayParticipant.findByPk(id);
    if (!participant) {
      return res.status(404).json({
        status: 404,
        msg: "Participant introuvable"
      });
    }
    await participant.destroy();

    // Recalculer et mettre à jour le statut du séjour
    await updateStayStatus(participant.stay_id);

    return res.status(200).json({
      status: 200,
      msg: "Participant supprimé avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du participant :", error);
    return res.status(500).json({
      status: 500,
      msg: "Erreur serveur lors de la suppression du participant",
      error: error.message
    });
  }
};

/**
 * Fonction pour recalculer et mettre à jour le statut d'un séjour
 * en fonction du nombre total de participants enregistrés (toutes demandes).
 * Chaque demande compte pour 1 (l'utilisateur) + people_number (accompagnants).
 */
const updateStayStatus = async (stay_id) => {
  try {
    const participants = await StayParticipant.findAll({ where: { stay_id } });
    const totalParticipants = participants.reduce(
      (total, p) => total + 1 + Number(p.people_number),
      0
    );

    const stay = await Stay.findByPk(stay_id);
    if (stay) {
      if (totalParticipants >= stay.min_participant) {
        stay.status = "validé";
      } else {
        stay.status = "en_attente_validation";
      }
      await stay.save();
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du séjour :", error);
  }
};

/**
 * Fonction destinée à l'administration :
 * Permet de modifier le statut d'une demande (stayParticipant) pour l'administrateur.
 * Après modification, on recalcule le statut du séjour en ne considérant que les demandes avec le status "validé".
 * URL attendue : PUT /api/stayParticipants/admin/:id
 */
exports.adminUpdateStayParticipantStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const participant = await StayParticipant.findByPk(id);
    if (!participant) {
      return res.status(404).json({
        status: 404,
        msg: "Participant introuvable"
      });
    }
    // Mise à jour du statut (ex. "validé", "refusé", etc.)
    participant.status = status;
    await participant.save();

    // Recalculer le statut du séjour en ne prenant en compte que les demandes validées
    await updateStayStatusValidated(participant.stay_id);

    return res.status(200).json({
      status: 200,
      msg: "Statut de la demande modifié avec succès",
      data: participant
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut par l'admin :", error);
    return res.status(500).json({
      status: 500,
      msg: "Erreur serveur lors de la modification du statut",
      error: error.message
    });
  }
};

/**
 * Fonction pour recalculer et mettre à jour le statut d'un séjour
 * en ne tenant compte que des demandes ayant le statut "validé".
 */
const updateStayStatusValidated = async (stay_id) => {
  try {
    // Sélectionner uniquement les demandes validées
    const validatedParticipants = await StayParticipant.findAll({ 
      where: { 
        stay_id,
        status: "validé"
      } 
    });
    const totalValidated = validatedParticipants.reduce(
      (total, p) => total + 1 + Number(p.people_number),
      0
    );

    const stay = await Stay.findByPk(stay_id);
    if (stay) {
      if (totalValidated >= stay.min_participant) {
        stay.status = "validé";
      } else {
        stay.status = "en_attente_validation";
      }
      await stay.save();
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut (validé) du séjour :", error);
  }
};


// Fonction pour récupérer toutes les demandes de réservation (stayParticipants)
exports.getAllStayParticipants = async (req, res) => {
  try {
    const participants = await StayParticipant.findAll({
      include: [
        {
            model: User,
            as: 'participant',
            attributes: ['id', 'firstname', 'lastname']
        }
      ]
    });

    // Calcul du total des personnes pour chaque demande (participant + accompagnants)
    const participantsWithTotal = participants.map((participant) => ({
      ...participant.dataValues,
      total_people: 1 + Number(participant.people_number) // 1 pour le participant + 'people_number' pour les accompagnants
    }));

    return res.status(200).json({
      status: 200,
      msg: "Participants récupérés avec succès",
      data: participantsWithTotal
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des participants :", error);
    return res.status(500).json({
      status: 500,
      msg: "Erreur serveur lors de la récupération des participants",
      error: error.message
    });
  }
};

// Fonction pour récupérer toutes les demandes de réservation pour un séjour donné
exports.getStayParticipants = async (req, res) => {
  const { stay_id } = req.params;
  try {
    const participants = await StayParticipant.findAll({
      where: { stay_id }
    });

    const participantsWithTotal = participants.map((participant) => ({
      ...participant.dataValues,
      total_people: 1 + Number(participant.people_number) // 1 pour le participant + 'people_number' pour les accompagnants
    }));

    return res.status(200).json({
      status: 200,
      msg: "Participants récupérés avec succès",
      data: participantsWithTotal
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des participants :", error);
    return res.status(500).json({
      status: 500,
      msg: "Erreur serveur lors de la récupération des participants",
      error: error.message
    });
  }
};