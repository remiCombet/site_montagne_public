import axios from 'axios';

const API_URL = 'https://your-api-url.com/api'; // Remplacez par l'URL de votre API

export const getAllArticles = async () => {
    try {
        const response = await axios.get(`${API_URL}/articles`);
        return response;
    } catch (error) {
        console.error('Erreur lors de la récupération des articles:', error);
        throw error;
    }
};

// Ajoutez d'autres fonctions pour interagir avec l'API si nécessaire
// Exemple : export const createArticle = async (articleData) => { ... };