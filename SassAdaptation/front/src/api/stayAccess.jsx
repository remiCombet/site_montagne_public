import axios from "axios";
import { config } from "../config";

// Fonction pour récupérer le token depuis localStorage
const getAuthToken = () => {
    return localStorage.getItem('Vent_dAmes_Montagne');
}

// Ajouter un accès à un séjour
export function addStayAccess(stayId, accessId) {
    return axios.post(`${config.api_url}/api/stay-accesses/add`,
        { stay_id: stayId, access_id: accessId },
        // { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    )
    .then((res) => {
        return res.data;
    })
    .catch((err) => {
        return err;
    });
}

// Récupérer tous les accès liés à un séjour
export function getAccessByStayId(stayId) {
    return axios.get(
        `${config.api_url}/api/stay-accesses/${stayId}`,
        // { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    )
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: "Erreur serveur", error: err }));
}

// Lister toutes les associations StayAccess
export function getAllStayAccess() {
    return axios.get(
        `${config.api_url}/api/stay-accesses`,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    )
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: "Erreur serveur", error: err }));
}

// Supprimer un accès à un séjour
export function removeStayAccess(id) {
    return axios.delete(
        `${config.api_url}/api/stay-accesses/${id}`,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    )
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: "Erreur serveur", error: err }));
}
