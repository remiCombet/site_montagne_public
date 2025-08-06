// const express = require('express');
// const { Stay, StayRequest } = require('../models');

// // Middleware pour vérifier la capacité du séjour
// const checkMaxParticipants = async (req, res, next) => {
//     const { stayId, people_number, participant_id } = req.body;
    
//     try {
//         // Trouver le séjour correspondant
//         const stay = await Stay.findByPk(stayId);
//         if (!stay) {
//             return res.status(404).json({ status: 404, msg: "Stay not found" });
//         }

//         // Récupérer le nombre total de participants pour ce séjour
//         const totalParticipants = await StayRequest.sum('people_number', {
//             where: { stayId }
//         }) + 1;

//         // Vérifier si la demande dépasse la capacité
//         if (totalParticipants + people_number > stay.maxParticipants) {
//             return res.status(400).json({
//                 status: 400,
//                 msg: `Le nombre total de participants pour ce séjour ne peut pas dépasser ${stay.maxParticipants}.`
//             });
//         }

//         // Si tout va bien, passer au contrôleur suivant
//         next();
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ status: 500, msg: "Erreur serveur" });
//     }
// };

// module.exports = checkMaxParticipants;

const express = require('express');
const { Stay, StayParticipant } = require('../models');

// Middleware pour vérifier la capacité du séjour
const checkMaxParticipants = async (req, res, next) => {
    const { stay_id, people_number, participant_id } = req.body;
    
    try {
        console.log('entrée dans le middleware checkMaxParticipants');
        // Vérification des valeurs requises
        if (!stay_id) {
            return res.status(400).json({ status: 400, msg: "L'identifiant du séjour est requis" });
        }

        console.log(`Vérification de la capacité du séjour ${stay_id} pour ${people_number} personnes supplémentaires`);
        
        // Trouver le séjour correspondant
        const stay = await Stay.findByPk(stay_id);
        if (!stay) {
            console.error(`Séjour avec ID ${stay_id} non trouvé`);
            return res.status(404).json({ status: 404, msg: "Stay not found" });
        }

        console.log(`Séjour trouvé: ${stay.title}, capacité max: ${stay.max_participant}`);

        // Récupérer le nombre total de participants pour ce séjour
        const participants = await StayParticipant.findAll({
            where: { stay_id }
        });

        console.log(`Nombre de participants actuels: ${participants.length}`);
        
        // Calculer le nombre total de participants (1 par inscription + le nombre d'accompagnants)
        // On ne compte que les statuts différents de "refusé"
        const totalParticipants = participants.reduce(
            (total, p) => {
                if (p.status !== 'refusé') {
                    return total + 1 + Number(p.people_number || 0);
                }
                return total;
            },
            0
        );

        console.log(`Participants (hors refusés): ${totalParticipants}, à ajouter: ${1 + Number(people_number || 0)}`);

        // Vérifier si la demande dépasse la capacité
        if (totalParticipants + 1 + Number(people_number || 0) > stay.max_participant) {
            console.error(`Capacité maximale dépassée: ${totalParticipants + 1 + Number(people_number || 0)} > ${stay.max_participant}`);
            return res.status(400).json({
                status: 400,
                msg: `Le nombre total de participants pour ce séjour ne peut pas dépasser ${stay.max_participant}.`
            });
        }

        console.log(`Participants actuels: ${totalParticipants}, à ajouter: ${1 + Number(people_number || 0)}`);

        // Vérifier si la demande dépasse la capacité
        if (totalParticipants + 1 + Number(people_number || 0) > stay.max_participant) {
            console.error(`Capacité maximale dépassée: ${totalParticipants + 1 + Number(people_number || 0)} > ${stay.max_participant}`);
            return res.status(400).json({
                status: 400,
                msg: `Le nombre total de participants pour ce séjour ne peut pas dépasser ${stay.max_participant}.`
            });
        }

        console.log("Vérification de la capacité: OK, passage au contrôleur suivant");
        // Si tout va bien, passer au contrôleur suivant
        next();
    } catch (error) {
        console.error("Erreur lors de la vérification de la capacité:", error);
        return res.status(500).json({ status: 500, msg: "Erreur serveur lors de la vérification de la capacité" });
    }
};

module.exports = checkMaxParticipants;