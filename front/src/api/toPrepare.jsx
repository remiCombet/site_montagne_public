import axios from 'axios';
import { config } from "../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('Vent_dAmes_Montagne');
};

// fonction pour créer un élément à prévoir
export const createToPrepare = (data) => {
    return axios.post(`${config.api_url}/api/stay-to-prepare/add`, data, {headers: { Authorization: `Bearer ${getAuthToken()}` }})
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};

// fonction pour récupérer les éléments à prévoir liés à un séjour
export const getToPrepareByStayId = (stayId) => {
    return axios.get(`${config.api_url}/api/stay-to-prepare/stay/${stayId}`, {headers: { Authorization: `Bearer ${getAuthToken()}` }})
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};

// fonction pour supprimer un élément à prévoir
export const deleteToPrepare = (toPrepareId) => {
    return axios.delete(`${config.api_url}/api/stay-to-prepare/${toPrepareId}`, {headers: { Authorization: `Bearer ${getAuthToken()}` }})
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};
