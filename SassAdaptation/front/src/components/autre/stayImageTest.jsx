import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateStayStore } from '../../slices/staySlice';
import * as stayImageAPI from '../../api/admin/stayImage';

const StayImageTest = ({ stay, onUpdate }) => {
    const dispatch = useDispatch();
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Image par défaut
    const defaultImageUrl = 'https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png';
    
    // Initialiser avec l'image existante si disponible
    useEffect(() => {
        if (stay.image) {
            setPreviewUrl(stay.image.url || defaultImageUrl);
            setImageAlt(stay.image.alt || '');
        } else {
            setPreviewUrl(defaultImageUrl);
            setImageAlt('');
        }
    }, [stay, defaultImageUrl]);

    // Nettoyer l'URL de prévisualisation lors du démontage
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Effacer le message après 3 secondes
    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [message]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            // Nettoyer l'ancienne URL blob si elle existe
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            
            setImage(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        
        const formData = new FormData();
        
        if (image) {
            formData.append('fichierImage', image);
        }
        
        formData.append('descriptionImage', imageAlt);
        
        // Si l'image n'a pas d'ID (image par défaut), ajouter une nouvelle image
        if (!stay.image?.id) {
            console.log("Ajout d'une nouvelle image au séjour", stay.id);
            
            stayImageAPI.addImages(stay.id, formData)
                .then((response) => {
                    if (response.status === 201) {
                        setMessage({ type: 'success', text: 'Image ajoutée avec succès' });
                        
                        // On détermine la structure de l'objet image selon la réponse
                        const newImageData = response.images?.[0] || response.image || {};
                        
                        const updatedStay = { 
                            ...stay,
                            image: {
                                id: newImageData.id,
                                url: newImageData.url || response.image_url,
                                alt: newImageData.alt || response.image_alt || imageAlt
                            }
                        };
                        
                        dispatch(updateStayStore(updatedStay));
                        if (onUpdate) onUpdate(updatedStay);
                        setImage(null);
                    } else {
                        setMessage({ type: 'error', text: response.msg || response.message || 'Erreur lors de l\'ajout de l\'image' });
                    }
                })
                .catch((error) => {
                    console.error('Erreur lors du traitement de l\'image:', error);
                    setMessage({ type: 'error', text: 'Une erreur est survenue lors du traitement de l\'image' });
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        } 
        // Si l'image a un ID, mettre à jour l'image existante
        else {
            console.log("Mise à jour de l'image", stay.image.id, "du séjour", stay.id);
            
            stayImageAPI.updateImage(stay.id, stay.image.id, formData)
                .then((response) => {
                    if (response.status === 200) {
                        setMessage({ type: 'success', text: 'Image mise à jour avec succès' });
                        
                        // On utilise directement l'objet image de la réponse
                        const updatedStay = { 
                            ...stay,
                            image: {
                                id: response.image.id,
                                url: response.image.url,
                                alt: response.image.alt || imageAlt
                            }
                        };
                        
                        dispatch(updateStayStore(updatedStay));
                        if (onUpdate) onUpdate(updatedStay);
                        setImage(null);
                    } else {
                        setMessage({ type: 'error', text: response.msg || response.message || 'Erreur lors de la mise à jour de l\'image' });
                    }
                })
                .catch((error) => {
                    console.error('Erreur lors du traitement de l\'image:', error);
                    setMessage({ type: 'error', text: 'Une erreur est survenue lors de la mise à jour de l\'image' });
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    };

    // Supprimer l'image personnalisée et revenir à l'image par défaut
    const handleDeleteImage = () => {
        // Vérifier si l'image existe et si ce n'est pas déjà l'image par défaut
        if (!stay.image?.id || stay.image.url === defaultImageUrl) {
            setMessage({ type: 'info', text: 'Vous utilisez déjà l\'image par défaut' });
            setShowDeleteConfirm(false);
            return;
        }
        
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        setShowDeleteConfirm(false);
        
        stayImageAPI.deleteImage(stay.id, stay.image.id)
            .then((response) => {
                if (response.status === 200) {
                    setMessage({ type: 'success', text: 'Image supprimée, image par défaut utilisée' });
                    
                    // Mise à jour du séjour avec l'image par défaut
                    const updatedStay = { 
                        ...stay,
                        image: {
                            id: null,
                            url: defaultImageUrl,
                            alt: 'Image par défaut'
                        }
                    };
                    
                    dispatch(updateStayStore(updatedStay));
                    if (onUpdate) onUpdate(updatedStay);
                    
                    // Réinitialiser le formulaire
                    setImage(null);
                    setPreviewUrl(defaultImageUrl);
                    setImageAlt('Image par défaut');
                } else {
                    setMessage({ type: 'error', text: response.msg || 'Erreur lors de la suppression' });
                }
            })
            .catch((error) => {
                console.error('Erreur:', error);
                setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Vérifier si l'image actuelle est l'image par défaut (de façon sécurisée)
    const isDefaultImage = !stay.image?.id || stay.image.url === defaultImageUrl;

    // Mode lecture simple
    const renderViewMode = () => (
        <section className="image-view-mode">
            <header className="image-header">
                <h3>Image du séjour</h3>
                
                <figure className="image-preview-container">
                    <img 
                        src={stay.image?.url || defaultImageUrl} 
                        alt={stay.image?.alt || "Image du séjour"} 
                        className="preview-image"
                    />
                    <figcaption>
                        {stay.image?.alt ? <span className="image-alt">{stay.image?.alt}</span> : "Image du séjour"}
                        {isDefaultImage && <span className="image-status">(Image par défaut)</span>}
                    </figcaption>
                </figure>
            </header>
    
            <aside className="image-action">
                <button 
                    className="btn-primary action-button"
                    onClick={() => setIsEditing(true)}
                    aria-label="Modifier l'image"
                >
                    Modifier
                </button>
            </aside>
        </section>
    );

    // Mode édition
    const renderEditMode = () => (
        <section className="image-edit-mode">
            <header className="section-header">
                <h3>Modifier l'image du séjour</h3>
            </header>
            
            {message.text && (
                <div className={`alert alert-${message.type === 'error' ? 'danger' : message.type}`} 
                     role="alert">
                    {message.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <figure className="image-preview-container">
                    <img 
                        src={previewUrl || defaultImageUrl} 
                        alt={imageAlt || "Aperçu de l'image"} 
                        className="preview-image"
                    />
                    {isDefaultImage && (
                        <figcaption className="image-status">Image par défaut</figcaption>
                    )}
                </figure>
                
                <section className="form-section">
                    <h4>Changer l'image</h4>
                    <div className="form-group">
                        <label htmlFor="image">Sélectionner une image:</label>
                        <input 
                            type="file" 
                            id="image" 
                            onChange={handleFileChange}
                            accept="image/*"
                            disabled={isSubmitting}
                            className="file-input"
                        />
                        <small className="form-help">Formats acceptés: JPG, PNG, GIF (max 2MB)</small>
                    </div>
                </section>
                
                <section className="form-section">
                    <h4>Description de l'image</h4>
                    <div className="form-group">
                        <label htmlFor="imageAlt">Texte alternatif:</label>
                        <input 
                            type="text" 
                            id="imageAlt" 
                            value={imageAlt} 
                            onChange={(e) => setImageAlt(e.target.value)}
                            placeholder="Description de l'image"
                            disabled={isSubmitting}
                            className="text-input"
                        />
                        <small className="form-help">Cette description aide les personnes utilisant des lecteurs d'écran. Elle est importante pour le référencement.</small>
                    </div>
                </section>
                
                {/* Section pour la suppression de l'image */}
                {!isDefaultImage && !showDeleteConfirm && (
                    <section className="form-section danger-zone">
                        <h4>Utiliser l'image par défaut</h4>
                        <p>
                            Vous pouvez revenir à l'image par défaut du séjour. 
                            Attention, cette action supprimera définitivement l'image actuelle.
                        </p>
                        <button 
                            type="button" 
                            className="btn-outline-danger"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSubmitting}
                        >
                            Utiliser l'image par défaut
                        </button>
                    </section>
                )}
                
                {/* Confirmation de suppression */}
                {showDeleteConfirm && (
                    <section className="delete-confirmation">
                        <h4>Confirmation</h4>
                        <p>Êtes-vous sûr de vouloir revenir à l'image par défaut ?</p>
                        <p>L'image actuelle sera définitivement supprimée.</p>
                        <div className="action-buttons">
                            <button 
                                type="button"
                                className="btn-danger action-button"
                                onClick={handleDeleteImage}
                                disabled={isSubmitting}
                            >
                                Oui, utiliser l'image par défaut
                            </button>
                            <button 
                                type="button"
                                className="btn-outline action-button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </button>
                        </div>
                    </section>
                )}
                
                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn-success action-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'En cours...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
            
            <footer className="image-edit-footer">
                <button 
                    className="btn-primary action-button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                >
                    Terminer
                </button>
            </footer>
        </section>
    );

    return (
        <article className="image-management">
            {isEditing ? renderEditMode() : renderViewMode()}
        </article>
    );
};

export default StayImageTest;