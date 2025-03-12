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
    // Création d'un nouveau FormData avec transformation des champs
    const normalizedFormData = new FormData();
    
    // Stocker temporairement les descriptions pour pouvoir les traiter ensemble
    const descriptions = [];
    const images = [];
    
    // Première passe: collecter toutes les images et descriptions
    for (let pair of formData.entries()) {
        const [key, value] = pair;
        if (key === 'fichierImage') {
            images.push(value);
        } else if (key === 'descriptionImage') {
            descriptions.push(value);
        }
    }
    
    // Deuxième passe: ajouter les images
    images.forEach(image => {
        normalizedFormData.append('images', image);
    });
    
    // Ajouter les descriptions comme un tableau unique
    descriptions.forEach(desc => {
        normalizedFormData.append('image_alt', desc);
    });

    // Debug
    console.log('FormData envoyé:');
    for (let pair of normalizedFormData.entries()) {
        console.log(pair[0] + ':', pair[1] instanceof File ? pair[1].name : pair[1]);
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
export function updateImage(articleId, imageId, formDataOrObject) {
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
        if (formDataOrObject.estPrincipale !== undefined) {
            formData.append('thumbnail', formDataOrObject.estPrincipale ? '1' : '0');
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
                case 'estPrincipale':
                    formData.append('thumbnail', value ? '1' : '0');
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
        `${config.api_url}/api/articles/${articleId}/images/${imageId}`, 
        formData, 
        formDataHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer une image
export function deleteImage(articleId, imageId) {
    return axios.delete(`${config.api_url}/api/articles/${articleId}/images/${imageId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}
