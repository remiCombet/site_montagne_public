import axios from "axios";
import { config } from "../../config";
import { authHeaders } from "../../utils/auth";

// Récupérer tous les équipements à préparer pour un séjour
export function getStayToPrepareByCategoryId(stayId) {
    return axios.get(
        `${config.api_url}/api/stay-to-prepare/stay/${stayId}`,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Ajouter un équipement à préparer
export function addStayToPrepare(stayId, categoryId) {
    // Validation préliminaire
    if (!stayId || !categoryId) {
        return Promise.reject({ 
            status: 400, 
            msg: "stayId et categoryId sont requis" 
        });
    }
    
    return axios.post(
        `${config.api_url}/api/stay-to-prepare/stay/${stayId}`,
        { category_id: categoryId },
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer un équipement à préparer
export function removeStayToPrepare(stayId, categoryId) {
    return axios.delete(
        `${config.api_url}/api/stay-to-prepare/stay/${stayId}/${categoryId}`,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}