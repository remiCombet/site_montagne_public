import { validateFormAsync } from "./validateUtils";

export const validateHighlightField = async (label, field, value) => {
    if (!value) return `${label} est requis.`;

    switch (field) {
        case "title":
            if (value.length < 3) return `${label} doit comporter au moins 3 caractères.`;
            if (value.length > 100) return `${label} ne peut pas dépasser 100 caractères.`;
            break;
        case "description":
            if (value.length < 10) return `${label} doit comporter au moins 10 caractères.`;
            if (value.length > 500) return `${label} ne peut pas dépasser 500 caractères.`;
            break;
        case "stay_id":
            if (isNaN(value) || Number(value) <= 0) return `${label} doit être un identifiant valide.`;
            break;
        default:
            return true;
    }

    return true;
};

export const validateHighlightForm = async (fields) => {
    return await validateFormAsync(fields, validateHighlightField);
};
