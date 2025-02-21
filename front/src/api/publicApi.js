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

// pour les tables de liaison
// Récuprer les acces liés à un séjour
export function getAllStayAccess(stayId) {
    return axios.get(`${config.api_url}/api/stay-accesses/${stayId}`)
        .then(res => res.data)
        .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}
