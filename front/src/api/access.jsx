import axios from "axios";
import { config } from "../config";

// Fonction pour récupérer le token depuis localStorage
const getAuthToken = () => {
    return localStorage.getItem('Vent_dAmes_Montagne');
}

// fonction pour récupérer les points forts d'un séjour
export function getAllAccesses() {
    return axios.get(`${config.api_url}/api/accesses`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}