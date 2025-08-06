export const validateFormAsync = async (fields, validateField) => {
    let errors = {};
    for (const { name, field, value } of fields) {
        const error = await validateField(name, field, value);
        if (error !== true) {
            errors[field] = error;
        }
    }
    return errors;
};