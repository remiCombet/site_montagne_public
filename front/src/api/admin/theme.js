import axios from "axios";
import { config } from "../../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Headers d'authentification
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Ajouter un thème à un séjour
export function createTheme(themeData) {
    return axios.post(`${config.api_url}/api/themes`, themeData, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// on ne s'en sert pas ? 
// Récupérer un theme par son id
export function getThemesByid(themeId) {
    return axios.get(`${config.api_url}/api/themes/${themeId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Modifier un thème
export function updateTheme(themeId, themeData) {
    return axios.put(`${config.api_url}/api/themes/${themeId}`, themeData, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer un thème
export function deleteTheme(themeId) {
    return axios.delete(`${config.api_url}/api/themes/${themeId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}