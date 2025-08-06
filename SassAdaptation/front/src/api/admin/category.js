import axios from "axios";
import { config } from "../../config";
import { authHeaders } from "../../utils/auth";

// Récupérer toutes les catégories
export function getAllCategories() {
    return axios.get(
        `${config.api_url}/api/categories`,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Ajouter une catégorie
export function createCategory(data) {
    return axios.post(
        `${config.api_url}/api/categories`,
        data,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Modifier une catégorie
export function updateCategory(id, data) {
    return axios.put(
        `${config.api_url}/api/categories/${id}`,
        data,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer une catégorie
export function deleteCategory(id) {
    return axios.delete(
        `${config.api_url}/api/categories/${id}`,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}