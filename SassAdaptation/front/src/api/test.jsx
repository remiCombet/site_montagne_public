import axios from "axios";
import { config } from "../config";

// Ajouter un participant à un séjour
export function addStayParticipant(stayId, participantData) {
    return axios.post(`${config.api_url}/api/${stayId}/participants`, participantData)
        .then((res) => {
            console.log('Participant ajouté : ', res.data);
            return res.data;
        })
        .catch((err) => {
            console.error('Erreur lors de l\'ajout du participant : ', err);
            return err;
        });
}

// Supprimer un participant d'un séjour
// export function removeStayParticipant(stayId, participantId) {
//     return axios.delete(`${config.api_url}/api/${stayId}/participants/${participantId}`)
//         .then((res) => {
//             console.log('Participant supprimé : ', res.data);
//             return res.data;
//         })
//         .catch((err) => {
//             console.error('Erreur lors de la suppression du participant : ', err);
//             return err;
//         });
// }

// Récupérer tous les participants d'un séjour
// export function getStayParticipants(stayId) {
//     return axios.get(`${config.api_url}/api/${stayId}/participants`)
//         .then((res) => {
//             console.log('Participants récupérés : ', res.data);
//             return res.data;
//         })
//         .catch((err) => {
//             console.error('Erreur lors de la récupération des participants : ', err);
//             return err;
//         });
// }

// Récupérer le nombre total de participants pour un séjour
export function getTotalParticipants(stayId) {
    return axios.get(`${config.api_url}/api/${stayId}/total-participants`)
        .then((res) => {
            console.log('Total participants : ', res.data);
            return res.data;
        })
        .catch((err) => {
            console.error('Erreur lors de la récupération du total des participants : ', err);
            return err;
        });
}
