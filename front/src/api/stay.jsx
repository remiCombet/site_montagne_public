import axios from "axios";
import { config } from "../config";

// Fonction pour récupérer le token depuis localStorage
const getAuthToken = () => {
    return localStorage.getItem('Vent_dAmes_Montagne');
}

// Fonction pour créer un séjour
export function createStay(stayData) {
    const token = getAuthToken();
    return axios.post(`${config.api_url}/api/stays`, stayData, {
        headers: {
            "x-access-token": token,
        }
    })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}

// Fonction pour récupérer tous les séjours
export function getAllStays() {
    return axios.get(`${config.api_url}/api/stays`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}

// Fonction pour récupérer un séjour par son ID
export function getStayById(stayId) {
    return axios.get(`${config.api_url}/api/stays/${stayId}`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}

// Fonction pour mettre à jour un séjour
export function updateStay(stayId, stayData) {
    const token = getAuthToken();
    
    return axios.put(`${config.api_url}/api/stays/${stayId}`, stayData, {
        headers: {
            "x-access-token": token,
        }
    })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}

// Fonction pour supprimer un séjour
export function deleteStay(stayId) {
    const token = getAuthToken();
    return axios.delete(`${config.api_url}/api/stays/${stayId}`, {
        headers: {
            "x-access-token": token,
        }
    })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}

