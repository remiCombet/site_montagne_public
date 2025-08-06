import axios from "axios";
import { config } from "../config";
import { authHeaders } from "../utils/auth";

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

// articles
// récupérer un article par son ID
export function getArticleById(id) {
    return axios.get(`${config.api_url}/api/articles/${id}`)
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// récupérer tous les articles
export function getAllArticles() {
    return axios.get(`${config.api_url}/api/articles`)
        .then((res) => {
            console.log(res.data)
            return res.data
    })
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// séjours
export function getStayDetails(stayId) {
    return axios.get(`${config.api_url}/api/stays/${stayId}`)
        .then((res) => {
            console.log(res.data)
            return res.data
        })
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Fonction pour ajouter un participant à un séjour (créer une demande de réservation)
export function addStayParticipant(participantData) {
    console.log("Envoi de la demande de réservation avec données:", participantData);
    
    // IMPORTANT: Utiliser stayParticipants sans tiret pour correspondre au backend
    return axios.post(
        `${config.api_url}/api/stay-participants`, 
        participantData, 
        authHeaders()
    )
    .then(res => {
        console.log("Réponse de la demande de réservation:", res.data);
        return res.data;
    })
    .catch(err => {
        console.error("Erreur lors de la création de la demande de réservation:", err);
        console.error("URL utilisée:", `${config.api_url}/api/stayParticipants`);
        console.error("Données envoyées:", participantData);
        return err.response?.data || { 
            status: 500, 
            msg: err.message || "Erreur serveur lors de la création de la demande de réservation" 
        };
    });
}

// Modifier aussi cette fonction pour utiliser le bon endpoint
export function checkUserStayParticipation(stayId) {
    console.log("Vérification de la participation au séjour:", stayId);
    
    // IMPORTANT: Utiliser stayParticipants sans tiret
    return axios.get(
        `${config.api_url}/api/stay-participants/check/${stayId}`,
        authHeaders()
    )
    .then(res => {
        console.log("Réponse vérification participation:", res.data);
        return res.data;
    })
    .catch(err => {
        console.log("Aucune demande existante trouvée pour ce séjour:", stayId);
        return { status: 404, exists: false };
    });
}

// Mettre également à jour les autres fonctions pour cohérence
export function getStayParticipants(stayId) {
    return axios.get(
        `${config.api_url}/api/stay-participants/stay/${stayId}`,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => {
        console.error("Erreur lors de la récupération des participants:", err);
        return err.response?.data || { status: 500, msg: "Erreur serveur" };
    });
}

export function updateStayParticipant(participantId, updatedData) {
    return axios.put(
        `${config.api_url}/api/stay-participants/${participantId}`,
        updatedData,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => {
        console.error("Erreur lors de la mise à jour de la demande:", err);
        return err.response?.data || { status: 500, msg: "Erreur serveur" };
    });
}

export function cancelStayParticipation(participantId) {
    return axios.delete(
        `${config.api_url}/api/stay-participants/${participantId}`,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => {
        console.error("Erreur lors de l'annulation de la demande:", err);
        return err.response?.data || { status: 500, msg: "Erreur serveur" };
    });
}