// const { Stay, StayParticipant } = require('../models');

// // Fonction pour récupérer le nombre total de participants d'un séjour
// const getTotalParticipants = async (req, res) => {
//     const { stay_id } = req.params;

//     try {
//         // Calcul du nombre total de participants en prenant en compte les lignes et le sum de people_number
//         const [totalParticipants, participantCount] = await Promise.all([
//             StayParticipant.sum('people_number', { where: { stay_id } }), // Somme des personnes supplémentaires
//             StayParticipant.count({ where: { stay_id } }) // Nombre de participants
//         ]);

//         // Calcul final en ajoutant 1 pour chaque participant + le total sum des people_number
//         const totalWithRequester = (totalParticipants || 0) + participantCount;

//         return res.json({ 
//             status: 200, 
//             msg: "Total participants récupéré", 
//             data: totalWithRequester 
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ status: 500, msg: "Erreur serveur" });
//     }
// };
// exports.getTotalParticipants();

// // Fonction pour ajouter un participant à un séjour
// exports.addStayParticipant = async (req, res) => {
//     const { stay_id } = req.params;
//     const { participant_id, people_number, status = 'en_attente', comment } = req.body;

//     try {
//         // Récupérer le nombre total de participants avant d'ajouter un nouveau participant
//         const totalParticipantsResponse = await getTotalParticipants(stay_id); // Appel de la fonction getTotalParticipants
//         if (totalParticipantsResponse.status !== 200) {
//             return res.status(totalParticipantsResponse.status).json(totalParticipantsResponse);
//         }

//         const totalParticipants = totalParticipantsResponse.data;
//         console.log(totalParticipants)
//         const stay = await Stay.findByPk(stay_id);
//         if (!stay) {
//             return res.status(404).json({ status: 404, msg: "Stay not found" });
//         }

//         // Vérifie que le nombre total de participants ne dépasse pas la capacité maximale
//         const totalWithNewParticipant = totalParticipants + people_number;
//         if (totalWithNewParticipant > stay.max_participant) {
//             return res.status(400).json({ status: 400, msg: "Nombre de participants dépasse la capacité maximale." });
//         }

//         // Ajoute le participant
//         const newParticipant = await StayParticipant.create({
//             stay_id,
//             participant_id,
//             people_number,
//             status,
//             comment
//         });

//         // Appel à la fonction de mise à jour du statut
//         await updateStayStatus(stay_id);

//         return res.json({ status: 200, msg: "Participant ajouté avec succès", newParticipant });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ status: 500, msg: "Erreur serveur" });
//     }
// };

// // Fonction pour supprimer un participant d'un séjour
// exports.removeStayParticipant = async (req, res) => {
//     const { stay_id, participant_id } = req.params;

//     try {
//         const stay = await Stay.findByPk(stay_id);
//         if (!stay) {
//             return res.status(404).json({ status: 404, msg: "Stay not found" });
//         }

//         const participant = await StayParticipant.findOne({
//             where: { stay_id, user_id: participant_id }
//         });
//         if (!participant) {
//             return res.status(404).json({ status: 404, msg: "Participant not found" });
//         }

//         // Supprime le participant
//         await participant.destroy();

//         // Appel à la fonction de mise à jour du statut
//         await updateStayStatus(stay_id);

//         return res.json({ status: 200, msg: "Participant supprimé avec succès", data: stay });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ status: 500, msg: "Erreur serveur" });
//     }
// };

// // Fonction pour récupérer le nombre total de participants et mettre à jour le statut du séjour
// const updateStayStatus = async (stay_id) => {
//     try {
//         const stay = await Stay.findByPk(stay_id);
//         if (!stay) {
//             return { status: 404, msg: "Stay not found" };
//         }

//         // Calcul du nombre total de participants
//         const totalPeople = await StayParticipant.sum('people_number', {
//             where: { stay_id }
//         });
//         const totalParticipants = (totalPeople || 0) + 1;  // On ajoute 1 pour la personne qui fait la demande

//         // Mise à jour du statut du séjour
//         let status;
//         if (totalParticipants >= stay.max_participant) {
//             status = 'validé';
//         } else if (totalParticipants >= stay.min_participant) {
//             status = 'en_attente_validation';
//         } else {
//             status = 'en_attente';
//         }

//         // Met à jour le statut du séjour dans la base
//         await stay.update({ status });

//         return { status: 200, msg: "Stay status updated successfully", data: stay };
//     } catch (error) {
//         console.error(error);
//         return { status: 500, msg: "Erreur serveur" };
//     }
// };

// // Fonction pour récupérer tous les participants d'un séjour
// exports.getStayParticipants = async (req, res) => {
//     const { stay_id } = req.params;

//     try {
//         const participants = await StayParticipant.findAll({
//             where: { stay_id },
//             include: ['user'], // Inclure les infos utilisateur (si nécessaire)
//         });

//         return res.json({ status: 200, msg: "Participants récupérés avec succès", data: participants });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ status: 500, msg: "Erreur serveur" });
//     }
// };


const { Stay, StayParticipant, User } = require('../models');

// Fonction pour ajouter un participant à un séjour
exports.addStayParticipant = async (req, res) => {
    const { stay_id } = req.params;
    const { participant_id, people_number, comment } = req.body;

    try {
        // Vérification si people_number est supérieur à 0
        if (people_number < 0) {
            return res.status(400).json({ status: 400, msg: "Le nombre de personnes doit être positif." });
        }

        // Récupérer le nombre total de participants avant d'ajouter un nouveau participant
        const [totalParticipants, participantCount] = await Promise.all([
            StayParticipant.sum('people_number', { where: { stay_id } }), // Somme des personnes supplémentaires
            StayParticipant.count({ where: { stay_id } }) // Nombre de participants
        ]);

        // Calcul final du total des participants en ajoutant 1 pour la personne qui fait la demande
        const totalWithRequester = (totalParticipants || 0) + participantCount + 1; // 1 pour la personne qui fait la demande

        // Trouver le séjour
        const stay = await Stay.findByPk(stay_id);
        if (!stay) {
            return res.status(404).json({ status: 404, msg: "Stay not found" });
        }

        // Vérifie que le nombre total de participants ne dépasse pas la capacité maximale
        if (totalWithRequester + people_number > stay.max_participant) {
            return res.status(400).json({ status: 400, msg: "Nombre de participants dépasse la capacité maximale." });
        }

        // Ajoute le participant seulement si le nombre total est valide
        const newParticipant = await StayParticipant.create({
            stay_id,
            participant_id,
            people_number,
            status: "en_attente",
            comment
        });

        // Calcul du nombre total de participants confirmés
        const confirmedParticipants = totalWithRequester + people_number;

        // Calcul du nombre de participants en attente
        const pendingParticipants = await StayParticipant.count({
            where: {
                stay_id,
                status: 'en_attente'
            }
        });

        // Nombre total de participants (confirmés + en attente)
        const totalParticipantsCount = confirmedParticipants + pendingParticipants;

        // Mise à jour du statut en fonction du nombre de participants confirmés
        let updatedStatus = "en_attente_de_validation"; // statut par défaut
        if (totalParticipantsCount < stay.min_participant) {
            updatedStatus = "participants_insuffisants";
        } else if (totalParticipantsCount >= stay.max_participant) {
            updatedStatus = "complet";
        }

        // Mise à jour du statut du séjour si nécessaire
        if (updatedStatus !== stay.status) {
            await Stay.update({ status: updatedStatus }, { where: { id: stay_id } });
        }

        return res.json({
            status: 200,
            msg: "Participant ajouté avec succès",
            newParticipant,
            stayStatus: updatedStatus
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, msg: "Erreur serveur" });
    }
};

// Export de la fonction pour récupérer le nombre total de participants d'un séjour
exports.getTotalParticipants = async (req, res) => {
    const { stay_id } = req.params;

    try {
        // Appel à la fonction interne qui effectue le calcul
        const totalParticipantsResponse = await getTotalParticipants(stay_id);

        // Renvoie la réponse de la fonction interne
        return res.json(totalParticipantsResponse);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, msg: "Erreur serveur" });
    }
};

// Fonction pour récupérer le nombre total de participants d'un séjour
const getTotalParticipants = async (stay_id) => {
    try {
        // Calcul du nombre total de participants en prenant en compte les lignes et le sum de people_number
        const [totalParticipants, participantCount, pendingCount, participants] = await Promise.all([
            StayParticipant.sum('people_number', { where: { stay_id } }),
            StayParticipant.count({ where: { stay_id } }),
            StayParticipant.count({ where: { stay_id, status: 'en_attente' } }),
            StayParticipant.findAll({ 
                where: { stay_id },
                attributes: ['participant_id', 'people_number', 'status'],
                include: { model: User, as: "participant", attributes: ['id', 'lastname', 'firstname', 'email'] }
            })
        ]);

        // Récupérer les détails du séjour
        const stay = await Stay.findByPk(stay_id, {
            attributes: ['id', 'title', 'max_participant', 'min_participant', 'status']
        });

        if (!stay) {
            return { status: 404, msg: "Stay not found" };
        }

        // Calcul final en ajoutant 1 pour chaque participant + le total sum des people_number
        const totalWithRequester = (totalParticipants || 0) + participantCount;

        return {
            status: 200,
            msg: "Total participants récupéré",
            data: {
                total_participants: totalWithRequester,
                pending_participants: pendingCount,
                stay_details: stay,
                participants_list: participants
            }
        };
    } catch (error) {
        console.error(error);
        return { status: 500, msg: "Erreur serveur" };
    }
};

exports.updateStayParticipant = async (req, res) => {
    const { stay_id, participant_id } = req.params;
    const { people_number, comment } = req.body;

    try {
        // Vérification si le participant existe
        const participant = await StayParticipant.findOne({ where: { stay_id, participant_id } });
        if (!participant) {
            return res.status(404).json({ status: 404, msg: "Participant non trouvé" });
        }

        // Calcul du total des participants avant mise à jour
        const [totalParticipants, participantCount] = await Promise.all([
            StayParticipant.sum('people_number', { where: { stay_id } }),
            StayParticipant.count({ where: { stay_id } })
        ]);

        // Calcul du total en tenant compte du participant mis à jour
        const totalWithRequester = (totalParticipants || 0) + participantCount - participant.people_number + people_number;

        // Récupérer le séjour
        const stay = await Stay.findByPk(stay_id);
        if (!stay) {
            return res.status(404).json({ status: 404, msg: "Stay not found" });
        }

        // Vérifie que le nombre total de participants ne dépasse pas la capacité maximale
        if (totalWithRequester > stay.max_participant) {
            return res.status(400).json({ status: 400, msg: "Nombre de participants dépasse la capacité maximale." });
        }

        // Met à jour les informations du participant
        participant.people_number = people_number;
        participant.comment = comment;
        await participant.save();

        // Calcul du nouveau statut en fonction du nombre total de participants
        let updatedStatus = stay.status;

        if (totalWithRequester >= stay.min_participant && totalWithRequester < stay.max_participant) {
            updatedStatus = "en_attente_de_validation";
        } else if (totalWithRequester < stay.min_participant) {
            updatedStatus = "participants_insuffisants";
        } else if (totalWithRequester >= stay.max_participant) {
            updatedStatus = "complet";
        }

        // Mise à jour du statut du séjour si nécessaire
        if (stay.status !== updatedStatus) {
            await Stay.update({ status: updatedStatus }, { where: { id: stay_id } });
        }

        return res.json({
            status: 200,
            msg: "Participant mis à jour avec succès",
            participant,
            stayStatus: updatedStatus
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, msg: "Erreur serveur" });
    }
};

// Fonction pour supprimer un participant
exports.deleteStayParticipant = async (req, res) => {
    const { stay_id, participant_id } = req.params;

    try {
        // Récupérer le séjour
        const stay = await Stay.findByPk(stay_id);
        if (!stay) {
            return res.status(404).json({ status: 404, msg: "Stay not found" });
        }

        // Supprimer le participant
        await StayParticipant.destroy({ where: { stay_id, participant_id } });

        // Recalculer le nombre total de participants après la suppression
        const [totalParticipants, participantCount] = await Promise.all([
            StayParticipant.sum('people_number', { where: { stay_id } }),
            StayParticipant.count({ where: { stay_id } })
        ]);

        // Calcul final en ajoutant 1 pour chaque participant + le total sum des people_number
        const totalWithRequester = (totalParticipants || 0) + participantCount;

        // Mise à jour du statut du séjour
        let updatedStatus = stay.status;

        if (totalWithRequester >= stay.min_participant) {
            updatedStatus = "en_attente_de_validation";
        } else if (totalWithRequester < stay.min_participant) {
            updatedStatus = "participants_insuffisants";
        } else if (totalWithRequester >= stay.max_participant) {
            updatedStatus = "complet";
        }

        // Mise à jour du statut du séjour
        await Stay.update({ status: updatedStatus }, { where: { id: stay_id } });

        return res.json({
            status: 200,
            msg: "Participant supprimé et statut mis à jour",
            stayStatus: updatedStatus
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, msg: "Erreur serveur" });
    }
};

// // Fonction interne pour calculer le nombre total de participants
// const getTotalParticipants = async (stay_id) => {
//     try {
//         // Calcul du nombre total de participants en prenant en compte les lignes et le sum de people_number
//         const [totalParticipants, participantCount] = await Promise.all([
//             StayParticipant.sum('people_number', { where: { stay_id } }),
//             StayParticipant.count({ where: { stay_id } })
//         ]);

//         // Calcul final en ajoutant 1 pour chaque participant + le total sum des people_number
//         const totalWithRequester = (totalParticipants || 0) + participantCount;

//         return { status: 200, msg: "Total participants récupéré", data: totalWithRequester };
//     } catch (error) {
//         console.error(error);
//         return { status: 500, msg: "Erreur serveur" };
//     }
// };
