import axios from "axios";
import { config } from "../config";

// récupérer tous les thèmes
export function getAllThemes() {
    return axios.get(`${config.api_url}/api/themes`)
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// récupérer tous les themes d'un séjour
export function getAllThemesByStayid(stayId) {
    return axios.get(`${config.api_url}/api/stay-themes/stay/${stayId}`)
    .then((res) => {
        return res.data
    })
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Récupérer les accès
export function getAllAccesses() {
    console.log("getAllAccesses() called"); // Vérifie si la fonction est appelée

    return axios.get(`${config.api_url}/api/accesses`)
    .then((res) =>  {
        console.log("Réponse API :", res.data); // Vérifie si une réponse est reçue
        return res.data;
    })
    .catch(err => {
        console.error("Erreur API :", err);
        return err.response?.data || { status: 500, msg: "Erreur serveur" };
    });
}


// probleme sur la logique d'ajout d'un point positifr devrait etre lié dans tous les cas a séjour a la différence de theme ou on peux avoir plusieure themes dans différents séjour 
// récupérer tous les point positif
export function getAllHighlights() {
    return axios.get(`${config.api_url}/api/highlights`)
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// récupérer les points positifs liés a un séjour
export function getHighlightsByStayId(stayId) {
    return axios.get(`${config.api_url}/api/highlights/stays/${stayId}`)
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// fonction pour récupérer les points forts d'un séjour
export function getStayStepByStayId(stayId) {
    return axios.get(`${config.api_url}/api/stay-steps/${stayId}`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}

// récupérer les logements des étapes
export function getAccommodationByStayStepId(stayStepId) {
    return axios.get(`${config.api_url}/api/accommodations/${stayStepId}`)
    .then((res) => {
        console.log(res.data);
        return res.data
    })
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// récupérer les logements
export function getAllAccommodations() {
    return axios.get(`${config.api_url}/api/accommodations`)
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// pour les tables de liaison
// Récupérer les acces liés à un séjour
export function getAllStayAccess(stayId) {
    return axios.get(`${config.api_url}/api/stay-accesses/${stayId}`)
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Récupérer tous les points de réception
export function getAllReceptionPoints() {
    return axios.get(`${config.api_url}/api/reception-points`)
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Récupérer un point de réception par ID
export function getReceptionPointById(receptionPointId) {
    return axios.get(`${config.api_url}/api/reception-points/${receptionPointId}`)
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// récupérer le point de récéption d'un séjour
export function getReceptionPointByStayId(stayId) {
    return axios.get(`${config.api_url}/api/reception-points/stay/${stayId}`)
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Vérifier les routes
// Récupérer les équipements à préparer pour un séjour
export function getStayToPrepareByStayId(stayId) {
    return axios.get(`${config.api_url}/api/stay-to-prepare/stay/${stayId}`)
        .then(res => {
            if (res.data.status === 200) {
                // Convertir l'objet equipments en tableau de catégories
                const equipmentsData = res.data.equipments || {};
                const categorizedEquipments = Object.entries(equipmentsData).map(([category, items]) => ({
                    category,
                    items
                }));
                
                return {
                    status: 200,
                    equipments: categorizedEquipments
                };
            }
            return res.data;
        })
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Récupérer les équipements prévus par le guide pour un séjour
// remarque on doit rendre cette fonction api dynamique etant donné que l'on a pas des  types d'équipements fixes
export function getStayEquipmentsByStayId(stayId) {
    return axios.get(`${config.api_url}/api/stay-equipments/stay/${stayId}`)
        .then(res => {
            if (res.data.status === 200) {
                // Convertir l'objet equipments en tableau de catégories
                const equipmentsData = res.data.equipments || {};
                const categorizedEquipments = Object.entries(equipmentsData).map(([category, items]) => ({
                    category,
                    items
                }));
                
                return {
                    status: 200,
                    equipments: categorizedEquipments
                };
            }
            return res.data;
        })
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Récupérer une catégorie spécifique
export function getCategoryById(categoryId) {
    return axios.get(`${config.api_url}/api/categories/${categoryId}`)
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}