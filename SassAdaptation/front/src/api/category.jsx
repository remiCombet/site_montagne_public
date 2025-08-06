import axios from 'axios';
import { config } from "../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => {
  return localStorage.getItem('Vent_dAmes_Montagne');
};

// fonction pour créer une catégorie
export const createCategory = (data) => {
    return axios.post(`${config.api_url}/api/categories/add`, data, {headers: { Authorization: `Bearer ${getAuthToken()}` }})
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
}

// fonction pour récupérer toutes les catégories
export const getAllCategories = () => {
    return axios.get(`${config.api_url}/api/categories`)
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
}

// fonction pour récupérer une cétégorie par son id
export const getCategoryById = (categoryId) => {
    return axios.get(`${config.api_url}/api/categories/${categoryId}`, {headers: { Authorization: `Bearer ${getAuthToken()}` }})
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
}

//  fonction pour modifier une catégorie
export const updateCategory = (categoryId, data) => {
    return axios.put(`${config.api_url}/api/categories/${categoryId}`, data, {headers: { Authorization: `Bearer ${getAuthToken()}` }})
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
}

// fonction pour supprimer une catégorie
export const deleteCategory = (categoryId) => {
    return axios.delete(`${config.api_url}/api/categories/${categoryId}`, {headers: { Authorization: `Bearer ${getAuthToken()}` }})
    .then((res) => res.data)
    .catch((err) => ({ status: 500, msg: 'Erreur serveur', error: err }));
}