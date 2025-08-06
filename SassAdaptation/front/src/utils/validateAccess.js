export const validateAccess = (fields) => {
    const errors = [];
    
    fields.forEach(({ name, field, value }) => {
        switch (field) {
            case 'category':
                if (!value || value.trim().length < 2) {
                    errors.push("La catégorie doit contenir au moins 2 caractères");
                }
                if (value && value.trim().length > 50) {
                    errors.push("La catégorie ne peut pas dépasser 50 caractères");
                }
                break;

            case 'information':
                if (!value || value.trim().length < 10) {
                    errors.push("Les informations doivent contenir au moins 10 caractères");
                }
                if (value && value.trim().length > 500) {
                    errors.push("Les informations ne peuvent pas dépasser 500 caractères");
                }
                break;
        }
    });

    return errors;
};