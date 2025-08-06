import axios from "axios";
import { config } from "../../config";
import { authHeaders } from "../../utils/auth";

// récupérer toutes les demandes de réservation
export function getAllStayRequests() {
    return axios.get(
        `${config.api_url}/api/stay-participants`,
        authHeaders()
    )
    .then((res) => {
        return res.data
    })
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// récupérer les demande de réservation en fonction de l'id du séjour
export function getStayRequestsByStayId(stayId) {
    return axios.get(
        `${config.api_url}/api/stay-participants/stay/${stayId}`,
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}

// Modifier le statut d'une demande de réservation
export function updateStayRequestStatus(requestId, newStatus) {
    return axios.patch(
        `${config.api_url}/api/stay-participants/admin/${requestId}`,
        { status: newStatus },
        authHeaders()
    )
    .then(res => res.data)
    .catch(err => err.response?.data || { status: 500, msg: "Erreur serveur" });
}
