import axios from "axios";
import { config } from "../../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Headers d'authentification
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Ajouter un point positif à un séjour
export function createHighlight(highlightData) {
    return axios.post(`${config.api_url}/api/highlights`, highlightData, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// on ne s'en sert pas ? 
// Récupérer un point positif par son id
export function getHighlightsByid(highlightId) {
    return axios.get(`${config.api_url}/api/highlights/${highlightId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Modifier un point positif
export function updateHighlight(highlightId, highlightData) {
    return axios.put(`${config.api_url}/api/highlights/${highlightId}`, highlightData, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer un point positif
export function deleteHighlight(highlightId) {
    return axios.delete(`${config.api_url}/api/highlights/${highlightId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}