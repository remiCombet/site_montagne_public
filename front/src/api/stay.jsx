import axios from "axios";
import { config } from "../config";

// Fonction pour récupérer le token d'authentification
const getAuthToken = () => localStorage.getItem('Vent_dAmes_Montagne');

// Headers d'authentification
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getAuthToken()}` }
});

// Headers pour FormData avec authentification
const formDataHeaders = () => ({
    headers: { 
        // Ne pas inclure 'Content-Type': 'multipart/form-data' car Axios l'ajoute automatiquement
        Authorization: `Bearer ${getAuthToken()}`
    }
});

// Fonction utilitaire pour créer le FormData
const createStayFormData = (stayData) => {
    const formData = new FormData();

    // Ajouter les champs texte
    Object.keys(stayData).forEach(key => {
        if (key !== 'image' && key !== 'imageAlt') {
            // Conversion des types numériques
            if (key === 'price') {
                formData.append(key, parseFloat(stayData[key]));
            } else if (['min_participant', 'max_participant', 'reception_point_id', 'user_id'].includes(key)) {
                formData.append(key, parseInt(stayData[key]));
            } else {
                formData.append(key, stayData[key]);
            }
        }
    });
    
    // Ajouter l'image et sa description si elles existent
    if (stayData.image) {
        formData.append('images', stayData.image);
        formData.append('imageAlts', stayData.imageAlt || '');
    }

    return formData;
};

// Créer un séjour
export function createStay(stayData) {
    const formData = createStayFormData(stayData);

    // Debug
    console.log('FormData envoyé:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1] instanceof File ? pair[1].name : pair[1]);
    }

    return axios.post(`${config.api_url}/api/stays`, formData, formDataHeaders())
        .then(res => res.data)
        .catch(err => {
            console.error("Erreur complète:", err);
            return err.response?.data || { status: 500, msg: "Erreur serveur" };
        });
}

// Récupérer tous les séjours
export function getAllStays() {
    return axios.get(`${config.api_url}/api/stays`)
        .then((res) => {
            console.log('api :', res.data);
            return res.data;
        })
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Récupérer un séjour par ID
export function getStayById(stayId) {
    return axios.get(`${config.api_url}/api/stays/${stayId}`)
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Mettre à jour un séjour
export function updateStay(stayId, stayData) {
    const formData = createStayFormData(stayData);

    // Debug
    console.log('FormData de mise à jour:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1] instanceof File ? pair[1].name : pair[1]);
    }

    return axios.put(`${config.api_url}/api/stays/${stayId}`, formData, formDataHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer un séjour
export function deleteStay(stayId) {
    return axios.delete(`${config.api_url}/api/stays/${stayId}`, authHeaders())
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Mettre à jour le statut d'un séjour
export function updateStayStatus(stayId, status) {
    return axios.put(
        `${config.api_url}/api/stays/status/${stayId}`, 
        { status }, 
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Mettre à jour le point de réception d'un séjour
export function updateStayReceptionPoint(stayId, reception_point_id) {
    return axios.patch(
        `${config.api_url}/api/stays/reception-point/${stayId}`, 
        { reception_point_id }, 
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Obtenir le statut de remplissage d'un séjour
export function getStayFillStatus(stayId) {
    return axios.get(`${config.api_url}/api/stays/fill-status/${stayId}`)
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}