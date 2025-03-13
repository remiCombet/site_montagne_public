import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateStayStore } from '../../slices/staySlice';
import * as stayImageAPI from '../../api/admin/stayImage';

const StayImageTest = ({ stay, onClose, onUpdate }) => {

    const dispatch = useDispatch();
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Image par défaut
    const defaultImageUrl = 'https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png';
    
    // debogage 
    useEffect(() => {
        console.log('chargement stay:', stay);
    }, [stay]);

    // Initialiser avec l'image existante si disponible
    useEffect(() => {
        if (stay.image) {
            setPreviewUrl(stay.image.url);
            setImageAlt(stay.image.alt || '');
        }
    }, [stay]);

    // Nettoyer l'URL de prévisualisation lors du démontage
    useEffect(() => {
        return () => {
            if (previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            // Nettoyer l'ancienne URL blob si elle existe
            if (previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            
            setImage(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        
        try {
            const formData = new FormData();
            
            if (image) {
                formData.append('fichierImage', image);
            }
            
            formData.append('descriptionImage', imageAlt);
            
            // Toujours utiliser updateImage car nous savons qu'il y a déjà une image (défaut ou personnalisée)
            const response = await stayImageAPI.updateImage(stay.id, stay.image.id, formData);
            console.log(response)
            if (response.status === 200) {
                setMessage({ type: 'success', text: 'Image mise à jour avec succès' });
                
                // Mise à jour directe du stay dans Redux
                const updatedStay = { 
                    ...stay,
                    image: {
                        id: response.image?.id || stay.image?.id,
                        url: response.image?.url || response.image_url,
                        alt: response.image?.alt || response.image_alt || imageAlt
                    }
                    
                };
                
                dispatch(updateStayStore(updatedStay));
                if (onUpdate) onUpdate(updatedStay);
                
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setMessage({ type: 'error', text: response.msg || 'Erreur lors de la mise à jour' });
            }
        } catch (error) {
            console.error('Erreur:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Supprimer l'image personnalisée et revenir à l'image par défaut
    const handleDeleteImage = async () => {
        // Ne pas permettre la suppression si c'est déjà l'image par défaut
        if (stay.image.url === defaultImageUrl) {
            setMessage({ type: 'info', text: 'Vous utilisez déjà l\'image par défaut' });
            setShowDeleteConfirm(false);
            return;
        }
        
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        setShowDeleteConfirm(false);
        
        try {
            const response = await stayImageAPI.deleteImage(stay.id, stay.image.id);
            
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
                
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setMessage({ type: 'error', text: response.msg || 'Erreur lors de la suppression' });
            }
        } catch (error) {
            console.error('Erreur:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Vérifier si l'image actuelle est l'image par défaut
    const isDefaultImage = stay.image.url === defaultImageUrl;

    return (
        <div className="popup-overlay" onClick={(e) => {
            if (e.target.classList.contains("popup-overlay")) onClose();
        }}>
            <div className="popup-content">
                <h2>Gestion de l'image du séjour</h2>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="image-preview-container">
                        {previewUrl && (
                            <div className="image-preview">
                                <img 
                                    src={previewUrl} 
                                    alt={imageAlt || 'Aperçu'} 
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '200px',
                                        display: 'block',
                                        margin: '0 auto 1rem auto',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }} 
                                />
                                {isDefaultImage && (
                                    <div className="image-status" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                        <small>Image par défaut</small>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="image">Changer l'image:</label>
                        <input 
                            type="file" 
                            id="image" 
                            onChange={handleFileChange}
                            accept="image/*"
                            disabled={isSubmitting}
                        />
                        <small style={{ display: 'block', margin: '0.5rem 0' }}>
                            Formats acceptés: JPG, PNG, GIF (max 2MB)
                        </small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="imageAlt">Description de l'image:</label>
                        <input 
                            type="text" 
                            id="imageAlt" 
                            value={imageAlt} 
                            onChange={(e) => setImageAlt(e.target.value)}
                            placeholder="Description de l'image"
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="form-actions" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginTop: '1rem' 
                    }}>
                        <button 
                            type="submit" 
                            className="btn-submit" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'En cours...' : 'Enregistrer'}
                        </button>
                        
                        {/* Bouton de suppression - visible uniquement si ce n'est pas l'image par défaut */}
                        {!isDefaultImage && !showDeleteConfirm && (
                            <button 
                                type="button" 
                                className="btn-delete"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isSubmitting}
                                style={{ backgroundColor: '#ff6b6b' }}
                            >
                                Utiliser l'image par défaut
                            </button>
                        )}
                        
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            {message.type === 'success' ? 'Fermer' : 'Annuler'}
                        </button>
                    </div>
                    
                    {/* Confirmation de suppression */}
                    {showDeleteConfirm && (
                        <div className="delete-confirmation" style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            border: '1px solid #ff6b6b',
                            borderRadius: '4px',
                            backgroundColor: '#fff5f5'
                        }}>
                            <p>Êtes-vous sûr de vouloir revenir à l'image par défaut ?</p>
                            <p>L'image actuelle sera définitivement supprimée.</p>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginTop: '1rem'
                            }}>
                                <button 
                                    type="button"
                                    onClick={handleDeleteImage}
                                    disabled={isSubmitting}
                                    style={{ backgroundColor: '#ff6b6b' }}
                                >
                                    Oui, utiliser l'image par défaut
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </form>
                
                <button 
                    className="close-btn" 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default StayImageTest;