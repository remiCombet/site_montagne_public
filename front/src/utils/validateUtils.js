export const validateForm = (fields, validateField) => {
    return fields.reduce((errors, { name, field, value }) => {
        const error = validateField(name, field, value);
        if (error !== true) errors[field] = error;
        return errors;
    }, {});
};
