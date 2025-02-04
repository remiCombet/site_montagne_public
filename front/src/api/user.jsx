import axios from "axios";
import { config } from "../config";

// // Fonction pour ajouter un utilisateur
// export function addOneUser(datas) {
//     return axios.post(`${config.api_url}/api/users/add`, datas)
//         .then((res) => {
//             return res.data;
//         })
//         .catch((err) => {
//             return err;
//         });
// }

// Fonction pour récupérer tous les utilisateurs
export function getAllUsers() {
    return axios.get(`${config.api_url}/api/users/`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}

// Fonction pour récupérer un utilisateur par ID
export function getUserById(userId) {
    return axios.get(`${config.api_url}/api/users/${userId}`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}

// Fonction pour mettre à jour un utilisateur
export function updateUser(userData, userId) {
    const token = window.localStorage.getItem('Vent_dAmes_Montagne');
    return axios.put(`${config.api_url}/api/users/${userId}`, userData, {
        headers: {
            "x-access-token": token,
        }
    })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}

// Fonction pour supprimer un utilisateur
export function deleteUser(userId) {
    const token = window.localStorage.getItem('Vent_dAmes_Montagne');
    return axios.delete(`${config.api_url}/api/users/${userId}`, {
        headers: {
            "x-access-token": token,
        }
    })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}
