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

// Ajouter des images à un article
export function addImages(articleId, formData) {
    // Création d'un nouveau FormData avec les noms de champs normalisés
    const normalizedFormData = new FormData();
    
    // Normalisation des noms de champs pour correspondre au backend
    for (let pair of formData.entries()) {
        const [key, value] = pair;
        const normalizedKey = key === 'imageAlts' ? 'image_alt' : key;
        normalizedFormData.append(normalizedKey, value);
    }

    return axios.post(
        `${config.api_url}/api/articles/${articleId}/images`, 
        normalizedFormData, 
        formDataHeaders()
    )
    .then(res => {
        return res.data;
    })
    .catch(err => {
        console.error('Erreur lors de l\'ajout des images:', err.response?.data);
        return err.response?.data || { 
            status: 500, 
            msg: "Erreur lors de l'ajout des images" 
        };
    });
}

// Mettre à jour une image
export function updateImage(articleId, imageId, newImage, imageAlt) {
    const formData = new FormData();
    
    if (newImage) {
        formData.append('image', newImage);
    }
    if (imageAlt) {
        formData.append('image_alt', imageAlt);
    }

    return axios.put(`${config.api_url}/api/articles/${articleId}/images/${imageId}`, formData, formDataHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer une image
export function deleteImage(articleId, imageId) {
    return axios.delete(`${config.api_url}/api/articles/${articleId}/images/${imageId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}
