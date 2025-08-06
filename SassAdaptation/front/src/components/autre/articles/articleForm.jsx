import React from 'react'
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createArticle, updateArticle } from '../../../api/admin/article';
import { format, isValid, parseISO } from 'date-fns';
import { selectUser } from '../../../slices/userSlice';
import { validateArticle } from '../../../utils/validateArticle';

const ArticleForm = ({ article, onClose, onSuccess }) => {
    // Initialiser formData avec l'article existant ou des valeurs vides
    const [formData, setFormData] = useState(article ? {
        title: article.title,
        shortDescription: article.shortDescription,
        content: article.content,
        location: article.location,
        startDate: article.startDate,
        endDate: article.endDate
    } : {
        title: '',
        shortDescription: '',
        content: '',
        location: '',
        startDate: '',
        endDate: ''
    });
    const [images, setImages] = useState([]);
    const [imageAlts, setImageAlts] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });
    const { infos: user } = useSelector(selectUser);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'startDate' || name === 'endDate') {
            const date = parseISO(value);
            if (isValid(date)) {
                const formattedDate = format(date, 'yyyy-MM-dd');
                setFormData(prev => ({
                    ...prev,
                    [name]: formattedDate
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        setImageAlts(new Array(files.length).fill(''));
    };

    const handleAltChange = (index, value) => {
        setImageAlts(prev => {
            const newAlts = [...prev];
            newAlts[index] = value;
            return newAlts;
        });
    };

    // Modifier la fonction handleSubmit pour ne pas envoyer d'images lors d'une mise à jour
    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
    
        // Validation des champs
        const articleFields = [
            { name: "title", value: formData.title },
            { name: "shortDescription", value: formData.shortDescription },
            { name: "content", value: formData.content },
            { name: "location", value: formData.location },
            { name: "startDate", value: formData.startDate },
            { name: "endDate", value: formData.endDate }
        ];
    
        // Si c'est une création, valider les images
        if (!article) {
            const errors = validateArticle(articleFields, images, imageAlts);
            if (errors.length > 0) {
                setMessage({ type: "error", text: errors.join(", ") });
                return;
            }
        } else {
            // En mode modification, valider uniquement les champs obligatoires
            const errors = validateArticle(articleFields, [], []);
            if (errors.length > 0) {
                setMessage({ type: "error", text: errors.join(", ") });
                return;
            }
        }
    
        // Préparation des données pour l'API
        const articleData = {
            ...formData,
            userId: user.id
        };
    
        // N'ajouter les images que pour un nouvel article
        if (!article) {
            articleData.images = images;
            articleData.imageAlts = imageAlts;
        }
    
        // Appel API avec then/catch
        const apiCall = article
            ? updateArticle(article.id, articleData)
            : createArticle(articleData);
    
        apiCall
            .then(response => {
                if (response.status === 200) {
                    setMessage({
                        type: "success",
                        text: article ? "Article modifié avec succès" : "Article créé avec succès"
                    });
                } else {
                    throw new Error(response.message || `Erreur lors de la ${article ? 'modification' : 'création'}`);
                }
            })
            .catch(err => {
                console.error('Erreur:', err);
                setMessage({
                    type: "error",
                    text: err.message || `Erreur lors de la ${article ? 'modification' : 'création'} de l'article`
                });
            });
    };

    // Gestion de la fermeture en cliquant en dehors
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            onClose();
        }
    };

    useEffect(() => {
        if (message.text && message.type === "success") {
            const timer = setTimeout(() => {
                onSuccess && onSuccess();
                onClose && onClose();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [message, onSuccess, onClose]);

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content">
                <article>
                    <h2>{article ? 'Modifier' : 'Créer'} un article</h2>

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <label>
                            Titre
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Description courte
                            <textarea
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Contenu
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Lieu
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <div className="date-inputs">
                            <label>
                                Date de début
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Date de fin
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                        </div>

                        {/* Section d'ajout d'images uniquement visible lors de la création */}
                        {!article && (
                            <div className="image-inputs">
                                <label>
                                    Images
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                                
                                {/* Champs pour les descriptions d'images */}
                                {images.length > 0 && (
                                    <div className="image-alts">
                                        <h4>Descriptions des images</h4>
                                        {images.map((file, index) => (
                                            <div key={index} className="image-alt-input">
                                                <label>
                                                    Description pour : {file.name}
                                                    <br />
                                                    <input
                                                        type="text"
                                                        value={imageAlts[index]}
                                                        onChange={(e) => handleAltChange(index, e.target.value)}
                                                        placeholder="Description de l'image pour l'accessibilité"
                                                    />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Vous pourriez aussi ajouter ici un message informatif en mode mise à jour */}
                        {article && (
                            <div className="info-message">
                                <p>Pour gérer les images de cet article, utilisez l'option "Gérer les images" après la sauvegarde.</p>
                            </div>
                        )}

                        <div className="actions center">
                            <button 
                                type="button"
                                className="cancel-btn" 
                                onClick={onClose}
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="submit-btn"
                            >
                                {article ? 'Modifier' : 'Créer'} l'article
                            </button>
                        </div>
                    </form>
                </article>
                <button className="close-btn center" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default ArticleForm;
