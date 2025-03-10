import axios from "axios";
import { config } from "../../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Headers d'authentification
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Headers pour FormData avec authentification
const formDataHeaders = () => ({
    headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getAuthToken()}`
    }
});

// Fonction utilitaire pour créer le FormData
const createArticleFormData = (articleData) => {
    const formData = new FormData();

    // Ajouter les champs texte
    Object.keys(articleData).forEach(key => {
        if (key !== 'images' && key !== 'imageAlts') {
            formData.append(key, articleData[key]);
        }
    });
    
    // Ajouter les images et leurs descriptions
    if (articleData.images) {
        articleData.images.forEach((image, index) => {
            formData.append('images', image);
            formData.append('image_alt', articleData.imageAlts[index] || '');
        });
    }

    return formData;
};

// Créer un article
export function createArticle(articleData) {
    const formData = createArticleFormData(articleData);

    // Debug
    console.log('FormData envoyé:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
    }

    return axios.post(`${config.api_url}/api/articles`, formData, formDataHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Mettre à jour un article
export function updateArticle(id, articleData) {
    const formData = createArticleFormData(articleData);

    return axios.put(`${config.api_url}/api/articles/${id}`, formData, formDataHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer un article
export function deleteArticle(id) {
    return axios.delete(`${config.api_url}/api/articles/${id}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}