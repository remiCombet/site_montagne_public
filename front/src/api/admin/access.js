import axios from "axios";
import { config } from "../../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Headers d'authentification
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Ajouter un thème à un acces
export function createAccess(accessData) {
    return axios.post(`${config.api_url}/api/accesses`, accessData, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// on ne s'en sert pas ? 
// Récupérer un acces par son id
// export function getAccessByid(accessId) {
//     return axios.get(`${config.api_url}/api/accesses/${accessId}`, authHeaders())
//         .then(res => res.data)
//         .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
// }

// Modifier un acces
export function updateAccess(accessId, accessData) {
    return axios.put(`${config.api_url}/api/accesses/${accessId}`, accessData, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer un acces
export function deleteAccess(accessId) {
    return axios.delete(`${config.api_url}/api/accesses/${accessId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Gestion de stayAccess
// Ajouter un un acces a un sejour
export function addStayAccess(stayAccessData) {
    return axios.post(`${config.api_url}/api/stay-accesses`, stayAccessData, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// supprimer un acces lié à un sejour
export function deleteStayAccess(stayAccessId) {
    return axios.delete(`${config.api_url}/api/stay-accesses/${stayAccessId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}