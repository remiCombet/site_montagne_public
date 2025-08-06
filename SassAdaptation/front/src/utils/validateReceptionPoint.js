export const validateReceptionPoint = (fields) => {
    const errors = [];
    
    fields.forEach(({ name, field, value }) => {
        switch (name) {
            case 'location':
                if (!value || value.trim().length < 3) {
                    errors.push("Le lieu doit contenir au moins 3 caractères");
                }
                if (value && value.trim().length > 200) {
                    errors.push("Le lieu ne peut pas dépasser 200 caractères");
                }
                break;

            case 'contact_name':
                if (!value || value.trim().length < 2) {
                    errors.push("Le nom du contact doit contenir au moins 2 caractères");
                }
                if (value && value.trim().length > 100) {
                    errors.push("Le nom du contact ne peut pas dépasser 100 caractères");
                }
                if (value && !/^[a-zA-ZÀ-ÿ\s-]+$/.test(value)) {
                    errors.push("Le nom du contact ne doit contenir que des lettres, espaces et tirets");
                }
                break;

            case 'contact_phone':
                if (value && !/^[0-9+\s-]{10,15}$/.test(value)) {
                    errors.push("Le numéro de téléphone doit être valide");
                }
                break;

            case 'contact_email':
                if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.push("L'email doit être une adresse valide");
                }
                break;

            case 'opening_time':
                if (!value || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                    errors.push("L'heure d'ouverture doit être au format HH:MM");
                }
                break;

            case 'closing_time':
                if (!value || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                    errors.push("L'heure de fermeture doit être au format HH:MM");
                }
                break;
        }
    });

    return errors;
};