import { validateFormAsync } from "./validateUtils";

export const validateStayStepField = async (label, field, value) => {
    if (!value) return `${label} est requis.`;

    switch (field) {
        case "stepNumber":
            if (isNaN(value) || Number(value) <= 0) return `${label} doit être un nombre positif.`;
            break;
        case "title":
            if (value.length < 3) return `${label} doit comporter au moins 3 caractères.`;
            if (value.length > 100) return `${label} ne peut pas dépasser 100 caractères.`;
            break;
        case "description":
            if (value.length < 10) return `${label} doit comporter au moins 10 caractères.`;
            if (value.length > 1000) return `${label} ne peut pas dépasser 1000 caractères.`;
            break;
        case "duration":
            if (isNaN(value) || Number(value) <= 0) return `${label} doit être un nombre positif.`;
            break;
        case "elevationGain":
            if (isNaN(value) || Number(value) < 0) return `${label} doit être un nombre positif ou nul.`;
            break;
        case "elevationLoss":
            if (isNaN(value) || Number(value) < 0) return `${label} doit être un nombre positif ou nul.`;
            break;
        case "stayId":
            if (isNaN(value) || Number(value) <= 0) return `${label} doit être un identifiant valide.`;
            break;
        case "accommodationId":
            if (isNaN(value) || Number(value) <= 0) return `${label} doit être un identifiant valide.`;
            break;
        default:
            return true;
    }

    return true;
};

export const validateStayStepForm = async (fields) => {
    return await validateFormAsync(fields, validateStayStepField);
};