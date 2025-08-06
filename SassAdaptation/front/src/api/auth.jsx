import axios from "axios";
import { config } from "../config";

// Fonction pour s'inscrire (signup)
export function signupUser(userData) {
    return axios.post(`${config.api_url}/api/users/sign-up`, userData)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return err;
        });
}

// fonction pour qu'un utilisateur se connecte
export function loginUser(datas) {
    return axios.post(`${config.api_url}/api/login`, datas)
    .then((res)=>{
        return res.data
    })
    .catch((err)=>{
        return err
    })
}


// fonction de vérification pour la reconnexion
export function checkMyToken() {
    const token = window.localStorage.getItem('Vent_dAmes_Montagne');

    return axios.post(`${config.api_url}/api/login/checkMyToken`, {}, {headers: {"x-access-token": token}})
    .then((res)=>{
        return res.data
    })
    .catch((err)=>{
        return err
    })
}


// Fonction pour se déconnecter (logout)
export function logoutUser() {
    localStorage.removeItem('Vent_dAmes_Montagne');
}
