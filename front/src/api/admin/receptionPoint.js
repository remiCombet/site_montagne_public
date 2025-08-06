import axios from 'axios';
import { config } from '../../config';

// Function to get the authentication token
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Authentication headers
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

const API_URL = `${config.api_url}/api`;

export function createReceptionPoint(receptionPointData) {
    return axios.post(`${API_URL}/reception-points`, receptionPointData, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

export function updateReceptionPoint(receptionPointId, receptionPointData) {
    return axios.put(`${API_URL}/reception-points/${receptionPointId}`, receptionPointData, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

export function deleteReceptionPoint(receptionPointId) {
    return axios.delete(`${API_URL}/reception-points/${receptionPointId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}
