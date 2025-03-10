export const validateArticle = (fields, images = [], imageAlts = []) => {
    const errors = [];
    
    // Validation des champs existants
    fields.forEach(({ name, field, value }) => {
        switch (name) {
            case 'title':
                if (!value || value.trim().length < 3) {
                    errors.push("Le titre doit contenir au moins 3 caractères");
                }
                if (value && value.trim().length > 100) {
                    errors.push("Le titre ne peut pas dépasser 100 caractères");
                }
                break;

            case 'shortDescription':
                if (!value || value.trim().length < 10) {
                    errors.push("La description courte doit contenir au moins 10 caractères");
                }
                if (value && value.trim().length > 200) {
                    errors.push("La description courte ne peut pas dépasser 200 caractères");
                }
                break;

            case 'content':
                if (!value || value.trim().length < 20) {
                    errors.push("Le contenu doit contenir au moins 20 caractères");
                }
                if (value && value.trim().length > 5000) {
                    errors.push("Le contenu ne peut pas dépasser 5000 caractères");
                }
                break;

            case 'location':
                if (!value || value.trim().length < 3) {
                    errors.push("Le lieu doit contenir au moins 3 caractères");
                }
                if (value && value.trim().length > 100) {
                    errors.push("Le lieu ne peut pas dépasser 100 caractères");
                }
                break;

            case 'startDate':
                if (!value) {
                    errors.push("La date de début est requise");
                }
                const startDate = new Date(value);
                if (isNaN(startDate.getTime())) {
                    errors.push("La date de début doit être valide");
                }
                break;

            case 'endDate':
                if (!value) {
                    errors.push("La date de fin est requise");
                }
                const endDate = new Date(value);
                if (isNaN(endDate.getTime())) {
                    errors.push("La date de fin doit être valide");
                }
                if (value && new Date(value) <= new Date()) {
                    errors.push("La date de fin doit être dans le futur");
                }
                break;
        }
    });

    // Validation spécifique pour comparer les dates
    const startDate = fields.find(f => f.name === 'startDate')?.value;
    const endDate = fields.find(f => f.name === 'endDate')?.value;
    
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        errors.push("La date de fin doit être après la date de début");
    }

    // Validation des images si présentes
    if (images.length > 0) {
        // Vérifier le nombre maximum d'images
        if (images.length > 5) {
            errors.push("Vous ne pouvez pas uploader plus de 5 images");
        }

        // Vérifier chaque image
        images.forEach((image, index) => {
            // Vérifier la taille (5MB max)
            if (image.size > 5 * 1024 * 1024) {
                errors.push(`L'image ${image.name} dépasse la taille maximale autorisée (5MB)`);
            }

            // Vérifier le type de fichier
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
                errors.push(`Le type de fichier de ${image.name} n'est pas autorisé (JPG, PNG ou WEBP uniquement)`);
            }

            // Vérifier la description de l'image
            if (!imageAlts[index] || imageAlts[index].trim().length < 3) {
                errors.push(`Veuillez fournir une description d'au moins 3 caractères pour l'image ${image.name}`);
            }
        });
    }

    return errors;
};