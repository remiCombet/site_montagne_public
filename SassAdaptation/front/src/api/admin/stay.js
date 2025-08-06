import axios from "axios";
import { config } from "../../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Headers d'authentification
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Mettre à jour le point de réception d'un séjour
export function updateStayReceptionPoint(stayId, receptionPointId) {
    return axios.patch(
        `${config.api_url}/api/stays/reception-point/${stayId}`, 
        { reception_point_id: receptionPointId }, 
        authHeaders()
    )
    .then((res) => {
        return res.data;
    })
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
};

// Mettre à jour le statut d'un séjour
export function updateStayStatus(stayId, status) {
    return axios.put(
        `${config.api_url}/api/stays/status/${stayId}`, 
        { status }, 
        authHeaders()
    )
    .then((res) => {
        return res.data;
    })
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
};