import { validateForm } from "./validateUtils";

export const validateUserField = (label, field, value) => {
    if (!value) return `${label} est requis.`;

    switch (field) {
        case "firstname":
        case "lastname":
            if (value.length < 2) return `${label} doit comporter au moins 2 caractères.`;
            if (value.length > 50) return `${label} ne peut pas dépasser 50 caractères.`;
            break;
        case "email":
            const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
            if (!emailRegex.test(value)) return `${label} n'est pas valide.`;
            break;
        case "password":
            const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
            if (!passwordRegex.test(value)) {
                return `Le champ ${label} doit contenir au minimum 8 caractères et au moins : un chiffre, une lettre majuscule, une lettre minuscule et un caractère spécial.`;
            }
            break;
        case "phone":
            const phoneRegex = /^\d{10,15}$/;
            if (!phoneRegex.test(value)) return `${label} doit être un numéro valide (10 à 15 chiffres).`;
            break;
        default:
            return true;
    }
    return true;
};

export const validateUserForm = (fields) => validateForm(fields, validateUserField);
