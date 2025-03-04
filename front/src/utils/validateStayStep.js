export const validateStayStep = (fields) => {
    const errors = [];
    
    fields.forEach(({ name, field, value }) => {
        switch (field) {
            case 'step_number':
                if (!value || value < 1) {
                    errors.push("Le numéro d'étape doit être supérieur à 0");
                }
                break;
            case 'title':
                if (!value || value.trim().length < 3) {
                    errors.push("Le titre doit contenir au moins 3 caractères");
                }
                break;
            case 'description':
                if (!value || value.trim().length < 10) {
                    errors.push("La description doit contenir au moins 10 caractères");
                }
                break;
            case 'duration':
                if (!value || value <= 0) {
                    errors.push("La durée doit être supérieure à 0");
                }
                break;
            case 'elevation_gain':
                if (value < 0) {
                    errors.push("Le dénivelé positif ne peut pas être négatif");
                }
                break;
            case 'elevation_loss':
                if (value < 0) {
                    errors.push("Le dénivelé négatif ne peut pas être négatif");
                }
                break;
        }
    });

    return errors;
};