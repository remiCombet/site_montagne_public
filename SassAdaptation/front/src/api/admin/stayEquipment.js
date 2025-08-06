import axios from "axios";
import { config } from "../../config";
import { authHeaders } from "../../utils/auth";

// Récupérer tous les équipements d'un séjour prévus par le guide
export function getStayEquipmentsByStayId(stayId) {
    return axios.get(
        `${config.api_url}/api/stay-equipments/stay/${stayId}`,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Ajouter un équipement prévu
export function addStayEquipment(stayId, categoryId) {
    // Validation préliminaire
    if (!stayId || !categoryId) {
        return Promise.reject({ 
            status: 400, 
            msg: "stayId et categoryId sont requis" 
        });
    }
    
    return axios.post(
        `${config.api_url}/api/stay-equipments/stay/${stayId}`,
        { category_id: categoryId },
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Supprimer un équipement prévu
export function removeStayEquipment(stayId, categoryId) {
    return axios.delete(
        `${config.api_url}/api/stay-equipments/stay/${stayId}/${categoryId}`,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}