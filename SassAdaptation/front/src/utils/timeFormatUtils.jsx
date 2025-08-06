import React from 'react';

/**
 * Normalise un format de temps au format HH:MM
 * @param {string} timeString - Chaîne représentant l'heure
 * @returns {string} Format normalisé HH:MM
 */
export const normalizeTimeFormat = (timeString) => {
    if (!timeString) return '';
    
    // Si déjà au format HH:MM, retourner tel quel
    if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
    
    try {
        // Essayer d'extraire les heures et minutes
        const timeParts = timeString.split(':');
        const hours = timeParts[0] ? timeParts[0].padStart(2, '0') : '00';
        const minutes = timeParts[1] ? timeParts[1].padStart(2, '0') : '00';
        
        return `${hours}:${minutes}`;
    } catch (error) {
        console.error("Erreur de formatage de l'heure:", error);
        return '00:00';
    }
};

/**
 * Initialise les sélecteurs d'heure à partir d'une chaîne de temps
 * @param {string} timeString - Chaîne représentant l'heure au format HH:MM
 * @param {string} prefix - Préfixe pour les clés (opening ou closing)
 * @returns {Object} Objet avec les heures et minutes initialisées
 */
export const initTimeSelectorsFromString = (timeString, prefix) => {
    if (!timeString) {
        return {
            [`${prefix}_hours`]: '09',
            [`${prefix}_minutes`]: '00'
        };
    }
    
    try {
        const normalizedTime = normalizeTimeFormat(timeString);
        const [hours, minutes] = normalizedTime.split(':');
        
        return {
            [`${prefix}_hours`]: hours,
            [`${prefix}_minutes`]: minutes
        };
    } catch (error) {
        console.error("Erreur d'initialisation des sélecteurs d'heure:", error);
        return {
            [`${prefix}_hours`]: '09',
            [`${prefix}_minutes`]: '00'
        };
    }
};

/**
 * Génère les options d'heures pour un sélecteur
 * @returns {Array} Options JSX pour les heures (00-23)
 */
export const generateHourOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        options.push(
            <option key={`hour-${hour}`} value={hour}>{hour}</option>
        );
    }
    return options;
};

/**
 * Génère les options de minutes pour un sélecteur
 * @returns {Array} Options JSX pour les minutes (00-55 par 5)
 */
export const generateMinuteOptions = () => {
    const options = [];
    for (let i = 0; i < 60; i += 5) {
        const minute = i.toString().padStart(2, '0');
        options.push(
            <option key={`minute-${minute}`} value={minute}>{minute}</option>
        );
    }
    // Ajouter aussi l'option pour 1 minute
    options.push(<option key="minute-01" value="01">01</option>);
    
    return options;
};
