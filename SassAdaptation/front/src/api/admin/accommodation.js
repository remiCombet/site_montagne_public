import axios from "axios";
import { config } from "../../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Headers d'authentification
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Ajouter un logement à un acces
export function createAccommodation(accommodationData) {
    return axios.post(`${config.api_url}/api/accommodations`, accommodationData, authHeaders())
        .then((res) => {
            console.log(res)
            return res.data;
        })
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
};

// Modifier un logement
export function updateAccommodation(accommodationId, accommodationData) {
    return axios.put(`${config.api_url}/api/accommodations/${accommodationId}`, accommodationData, authHeaders())
        .then((res) => {
            console.log(res)
            return res.data;
        })
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
};

// Supprimer un logement
export function deleteAccommodation(accommodationId) {
    return axios.delete(`${config.api_url}/api/accommodations/${accommodationId}`, authHeaders())
        .then((res) => {
            console.log(res)
            return res.data;
        })
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
};