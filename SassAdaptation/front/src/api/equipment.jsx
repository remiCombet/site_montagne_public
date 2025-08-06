import axios from 'axios';
import { config } from "../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('Vent_dAmes_Montagne');
};

// fonction pour créer un équipement
export const createEquipment = (data) => {
    return axios.post(`${config.api_url}/api/stay-equipments/add`, data, {headers: { Authorization: `Bearer ${getAuthToken()}` }})
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};

// fonction pour récupérer les équipements liés à un séjour
export const getEquipmentsByStayId = (stayId) => {
    return axios.get(`${config.api_url}/api/stay-equipments/stay/${stayId}`, {headers: { Authorization: `Bearer ${getAuthToken()}` }})
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};

// fonction pour supprimer un équipement
export const deleteEquipment = (equipmentId) => {
    return axios.delete(`${config.api_url}/api/stay-equipments/${equipmentId}`, {headers: { Authorization: `Bearer ${getAuthToken()}` }})
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};