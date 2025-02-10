import axios from "axios";
import { config } from "../config";

// récupérer tous les thèmes
export function getAllThemes() {
    return axios.get(`${config.api_url}/api/themes`)
    .then(res => res.data)
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

