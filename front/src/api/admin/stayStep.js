import axios from "axios";
import { config } from "../../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Headers d'authentification
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Créer une étape
export function createStayStep(stayId, stayStepsData) {
    return axios.post(`${config.api_url}/api/stay-steps/${stayId}`, stayStepsData, authHeaders())
    .then((res) => {
        console.log(res.data);
        return res.data
    })
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
};

// Modifier une étape
export function updateStayStep(stayId, stayStepId, stayStepsData) {
    return axios.put(`${config.api_url}/api/stay-steps/${stayId}/${stayStepId}`, stayStepsData, authHeaders())
    .then((res) => {
        console.log(res.data);
        return res.data
    })
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
};

// Supprimer un étape
export function deleteStayStep(stayId, stayStepId) {
    return axios.delete(`${config.api_url}/api/stay-steps/${stayId}/${stayStepId}`, authHeaders())
    .then((res) => {
        console.log(res.data);
        return res.data
    })
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
};