export const validateAccommodation = (fields) => {
    const errors = [];
    
    fields.forEach(({ name, field, value }) => {
        switch (field) {
            case 'accommodationName':
                if (!value || value.trim().length < 3) {
                    errors.push("Le nom de l'hébergement doit contenir au moins 3 caractères");
                }
                break;
            case 'accommodationDescription':
                if (!value || value.trim().length < 10) {
                    errors.push("La description de l'hébergement doit contenir au moins 10 caractères");
                }
                break;
            case 'mealType':
                if (!value || value.trim().length < 3) {
                    errors.push("Le type de repas doit contenir au moins 3 caractères");
                }
                break;
            case 'mealDescription':
                if (!value || value.trim().length < 10) {
                    errors.push("La description des repas doit contenir au moins 10 caractères");
                }
                break;
        }
    });

    return errors;
};