import { validateFormAsync } from "./validateUtils";

export const validateThemeField = async (label, field, value) => {
    if (!value) return `${label} est requis.`;

    switch (field) {
        case "name":
            if (value.length < 3) return `${label} doit comporter au moins 3 caractères.`;
            if (value.length > 50) return `${label} ne peut pas dépasser 50 caractères.`;
            break;
        case "stay_id":
            if (isNaN(value) || Number(value) <= 0) return `${label} doit être un identifiant valide.`;
            break;
        default:
            return true;
    }

    return true;
};

export const validateThemeForm = async (fields) => {
    return await validateFormAsync(fields, validateThemeField);
};
