import axios from "axios";
import { config } from "../../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Headers d'authentification
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Ajouter un acces à un séjour
export function createAccess(accessData) {
    return axios.post(`${config.api_url}/api/accesses`, accessData, authHeaders())
        .then((res) => {
            console.log(res)
            return res.data
    })
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Enlever un acces d'un séjour
export function removeAccessFromStay(stayId, accessId) {
    return axios.delete(`${config.api_url}/api/stay-accesses/${stayId}/${accessId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

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
// Ajouter un accès à un séjour
// remarque : body vide car on utilise les paramètres de l'url, on est obliger d'ajouter des paramètres dans la requête, cepandant cest une f onctionde lien entre deux tables (donc pas d'ajour de données dans une des tables)
export function addStayAccess(stayId, accessId) {
    return axios.post(`${config.api_url}/api/stay-accesses/${stayId}/${accessId}`, {}, authHeaders())
        .then((res) => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// supprimer un acces lié à un sejour
export function deleteStayAccess(stayAccessId) {
    return axios.delete(`${config.api_url}/api/stay-accesses/${stayAccessId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Vérifier si un accès est lié à d'autres séjours
export function checkAccessUsage(accessId) {
    return axios.get(`${config.api_url}/api/stay-accesses/check/${accessId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}