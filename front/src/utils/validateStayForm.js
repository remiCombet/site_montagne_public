import { validateFormAsync } from "./validateUtils";
// import { checkAssociations } from "../api/validate"; 

export const validateStayField = async (label, field, value) => {
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
        case "location":
            if (value.length < 5) return `${label} doit comporter au moins 5 caractères.`;
            if (value.length > 100) return `${label} ne peut pas dépasser 100 caractères.`;
            break;
        case "price":
            if (isNaN(value)) return `${label} doit être un nombre valide.`;
            if (Number(value) <= 0) return `${label} doit être supérieur à 0.`;
            break;
        case "start_date":
        case "end_date":
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(value)) return `${label} doit être une date valide (format : YYYY-MM-DD).`;
            break;
        case "physical_level":
        case "technical_level":
            const levels = ["facile", "modéré", "sportif", "difficile", "extrême"];
            if (!levels.includes(value)) return `${label} doit être l'un des niveaux suivants : ${levels.join(", ")}.`;
            break;
        // case "theme":
        // case "category":
        // case "highlight":
        //     return await validateAssociation(value, field);
        default:
            return true;
    }

    return true;
};

// 🔹 Vérifie l'existence des IDs côté backend via une API
// const validateAssociation = async (associationIds, modelName) => {
//     if (!Array.isArray(associationIds) || associationIds.length === 0) {
//         return `${modelName} est requis.`;
//     }

//     try {
//         const response = await checkAssociations({ [modelName]: associationIds });
//         if (response.status !== 200) {
//             return `Erreur de validation pour ${modelName}.`;
//         }

//         const { invalidIds } = response.data;
//         if (invalidIds.length > 0) {
//             return `${modelName} avec les IDs suivants n'existent pas : ${invalidIds.join(", ")}.`;
//         }
//     } catch (error) {
//         return `Erreur de validation pour ${modelName}.`;
//     }

//     return true;
// };

export const validateStayForm = async (fields) => {
    return await validateFormAsync(fields, validateStayField);
};