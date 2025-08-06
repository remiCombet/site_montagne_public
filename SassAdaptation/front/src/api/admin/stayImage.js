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

// Ajouter une image à un séjour
export function addImages(stayId, formData) {
    const normalizedFormData = new FormData();
    
    // Extraire l'image et la description (une seule)
    let image = null;
    let description = '';
    
    for (let pair of formData.entries()) {
        const [key, value] = pair;
        if (key === 'fichierImage') {
            image = value;
        } else if (key === 'descriptionImage') {
            description = value;
        }
    }
    
    // Ajouter l'image et la description au FormData normalisé
    if (image) {
        normalizedFormData.append('images', image);
    }
    
    if (description) {
        normalizedFormData.append('image_alt', description);
    }
    // Debug
    console.log('FormData envoyé:');
    for (let pair of normalizedFormData.entries()) {
        console.log(pair[0] + ':', pair[1] instanceof File ? pair[1].name : pair[1]);
    }
    
    return axios.post(
        `${config.api_url}/api/stays/${stayId}/images`, 
        normalizedFormData, 
        formDataHeaders()
    )
    .then(res => {
        return res.data;
    })
    .catch(err => {
        console.error('Erreur lors de l\'ajout de l\'image:', err.response?.data);
        return err.response?.data || { 
            status: 500, 
            msg: "Erreur lors de l'ajout de l'image" 
        };
    });
}

// Mettre à jour une image
export function updateImage(stayId, imageId, formDataOrObject) {
    const formData = new FormData();
    
    // Si c'est un objet standard
    if (!(formDataOrObject instanceof FormData) && typeof formDataOrObject === 'object') {
        // Terme métier -> terme technique
        if (formDataOrObject.fichierImage) {
            formData.append('image', formDataOrObject.fichierImage);
        }
        if (formDataOrObject.descriptionImage) {
            formData.append('image_alt', formDataOrObject.descriptionImage);
        }
    } 
    // Si c'est un FormData, transformer les clés
    else if (formDataOrObject instanceof FormData) {
        for (let pair of formDataOrObject.entries()) {
            const [key, value] = pair;
            
            switch(key) {
                case 'fichierImage':
                    formData.append('image', value);
                    break;
                case 'descriptionImage':
                    formData.append('image_alt', value);
                    break;
                default:
                    formData.append(key, value);
            }
        }
    }

    // Debug
    console.log('FormData de mise à jour:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1] instanceof File ? pair[1].name : pair[1]);
    }
    
    return axios.put(
        `${config.api_url}/api/stays/${stayId}/images/${imageId}`, 
        formData, 
        formDataHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Mettre à jour uniquement la description d'une image
export function updateImageAlt(stayId, imageId, altText) {
    return axios.patch(
        `${config.api_url}/api/stays/${stayId}/images/${imageId}/alt`,
        { image_alt: altText },
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer une image
export function deleteImage(stayId, imageId) {
    return axios.delete(`${config.api_url}/api/stays/${stayId}/images/${imageId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}