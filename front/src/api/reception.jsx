import axios from 'axios';
import { config } from "../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('Vent_dAmes_Montagne');
};

// Fonction pour créer un point de réception
export const createReceptionPoint = (data) => {
  return axios
    .post(`${config.api_url}/api/reception-point/add`, data, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};

// Fonction pour récupérer tous les points de réception
export const getAllReceptionPoints = () => {
  return axios
    .get(`${config.api_url}/api/reception-point/`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};

// Fonction pour récupérer un point de réception par ID
export const getReceptionPointById = (id) => {
  return axios
    .get(`${config.api_url}/api/reception-point/${id}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};

// // Fonction pour récupérer un point de réception par `stayId`
// export const getReceptionPointByStayId = (stayId) => {
//     return axios
//       .get(`${config.api_url}/api/stay/${stayId}/reception`, {
//         headers: { Authorization: `Bearer ${getAuthToken()}` }
//       })
//       .then((res) => res.data)
//       .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
// };

// Fonction pour récupérer un point de réception par `stayId`
export const getReceptionPointByStayId = (receptionPointId) => {
    return axios
      .get(`${config.api_url}/api/reception-point/${receptionPointId}/reception`)
      .then((res) => res.data)
      .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};
  

// Fonction pour mettre à jour un point de réception
export const updateReceptionPoint = (id, data) => {
  return axios
    .put(`${config.api_url}/api/reception-point/${id}`, data, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};

// Fonction pour supprimer un point de réception
export const deleteReceptionPoint = (id) => {
  return axios
    .delete(`${config.api_url}/api/reception-point/${id}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
};
