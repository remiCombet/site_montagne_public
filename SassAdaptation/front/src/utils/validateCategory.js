export const validateCategory = (fields) => {
    const errors = [];
    
    fields.forEach(({ name, value }) => {
        switch (name) {
            case 'type':
                if (!value || value.trim().length < 2) {
                    errors.push("Le type doit contenir au moins 2 caractères");
                }
                if (value && value.trim().length > 50) {
                    errors.push("Le type ne peut pas dépasser 50 caractères");
                }
                if (value && !/^[a-zA-ZÀ-ÿ\s-]+$/.test(value)) {
                    errors.push("Le type ne doit contenir que des lettres, espaces et tirets");
                }
                break;

            case 'name':
                if (!value || value.trim().length < 2) {
                    errors.push("Le nom doit contenir au moins 2 caractères");
                }
                if (value && value.trim().length > 100) {
                    errors.push("Le nom ne peut pas dépasser 100 caractères");
                }
                if (value && !/^[a-zA-ZÀ-ÿ0-9\s-]+$/.test(value)) {
                    errors.push("Le nom ne doit contenir que des lettres, chiffres, espaces et tirets");
                }
                break;

            case 'description':
                if (!value || value.trim().length < 3) {
                    errors.push("La description doit contenir au moins 3 caractères");
                }
                if (value && value.trim().length > 255) {
                    errors.push("La description ne peut pas dépasser 255 caractères");
                }
                break;
        }
    });

    return errors;
};