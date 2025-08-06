import { useState, useEffect } from 'react';
import { addImages, deleteImage, updateImage } from '../../../api/admin/articleImage';
import { extractFileNameFromCloudinaryUrl } from '../../../utils/extractImageName';

const ArticleImageManager = ({ article, onClose, onUpdate }) => {
    // États existants
    const [images, setImages] = useState(article?.images || []);
    const [newImages, setNewImages] = useState([]);
    const [newImageAlts, setNewImageAlts] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    
    // Nouveaux états pour l'édition d'image
    const [editMode, setEditMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingImageFile, setEditingImageFile] = useState(null);
    const [editingAlt, setEditingAlt] = useState('');

    // Gestion de l'ajout de nouvelles images
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(files);
        setNewImageAlts(new Array(files.length).fill(''));
    };

    // Gestion des descriptions des nouvelles images
    const handleNewAltChange = (index, value) => {
        setNewImageAlts(prev => {
            const newAlts = [...prev];
            newAlts[index] = value;
            return newAlts;
        });
    };

    // Suppression d'une image
    const handleDeleteImage = (imageId) => {
        console.log("ID de l'image à supprimer:", imageId);
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

        // Vérifier si l'image à supprimer était une miniature
        const isImageThumbnail = images.find(img => img.id === imageId)?.thumbnail === 1;

        setLoading(true);
        deleteImage(article.id, imageId)
            .then(response => {
                if (response.status === 200) {
                    // Filtrer l'image supprimée
                    const updatedImages = images.filter(img => img.id !== imageId);
                    
                    // Si c'était une miniature et qu'il reste des images, définir la première comme nouvelle miniature
                    if (isImageThumbnail && updatedImages.length > 0) {
                        updatedImages[0].thumbnail = 1;
                    }
                    
                    setImages(updatedImages);
                    setMessage({ type: 'success', text: 'Image supprimée avec succès' });
                    onUpdate && onUpdate();
                }
            })
            .catch(err => {
                setMessage({ type: 'error', text: 'Erreur lors de la suppression de l\'image' });
                console.error('Erreur suppression:', err);
            })
            .finally(() => setLoading(false));
    };

    // Ajout de nouvelles images
    const handleAddImages = (e) => {
        e.preventDefault();
        if (newImages.length === 0) return;

        // Vérification des doublons avant l'envoi
        const duplicateImages = newImages.filter(newImage => {
            const newFileName = newImage.name
                .split('.')[0]
                .replace(/[-_]/g, '')
                .toLowerCase();
            
            return images.some(existingImage => {
                const existingFileName = extractFileNameFromCloudinaryUrl(existingImage.url)
                    .replace(/[-_]/g, '')
                    .toLowerCase();
                
                const isDuplicate = existingFileName.includes(newFileName) || 
                                  newFileName.includes(existingFileName);
                
                return isDuplicate;
            });
        });

        if (duplicateImages.length > 0) {
            setMessage({
                type: 'error',
                text: `Les images suivantes sont déjà présentes dans l'article : ${duplicateImages.map(img => img.name).join(', ')}`
            });
            return;
        }

        // Validation des descriptions
        const emptyDescriptions = newImageAlts.some(alt => !alt || alt.trim().length < 3);
        if (emptyDescriptions) {
            setMessage({ 
                type: 'error', 
                text: 'Chaque image doit avoir une description d\'au moins 3 caractères' 
            });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        
        newImages.forEach((image, index) => {
            formData.append('fichierImage', image);
            formData.append('descriptionImage', newImageAlts[index].trim());
        });

        addImages(article.id, formData)
            .then(response => {
                if (response.status === 201) {
                    // Mise à jour des images en évitant les doublons
                    const newImagesList = response.images.filter(newImg => 
                        !images.some(existingImg => existingImg.url === newImg.url)
                    );
                    
                    setImages(prev => [...prev, ...newImagesList]);
                    setNewImages([]);
                    setNewImageAlts([]);
                    setMessage({ 
                        type: 'success', 
                        text: 'Images ajoutées avec succès'
                    });
                    
                    // Reset du champ file input
                    const fileInput = document.querySelector('input[type="file"]');
                    if (fileInput) {
                        fileInput.value = '';
                    }
                    
                    onUpdate && onUpdate();
                } else if (response.status === 400) {
                    setMessage({ 
                        type: 'error', 
                        text: response.msg || 'Image déjà présente dans l\'article'
                    });
                }
            })
            .catch(err => {
                console.error('Erreur:', err);
                setMessage({ 
                    type: 'error', 
                    text: err.msg || 'Erreur lors de l\'ajout des images'
                });
            })
            .finally(() => setLoading(false));
    };

    // Nouvelle fonction : définir une image comme miniature principale
    const handleSetAsThumbnail = (imageId) => {
        setLoading(true);
        
        updateImage(article.id, imageId, { estPrincipale: true })
            .then(response => {
                if (response.status === 200) {
                    // Mettre à jour les images (une seule peut être miniature)
                    setImages(prev => prev.map(img => ({
                        ...img,
                        thumbnail: img.id === imageId ? 1 : 0
                    })));
                    
                    setMessage({ type: 'success', text: 'Image définie comme principale' });
                    onUpdate && onUpdate();
                }
            })
            .catch(err => {
                console.error('Erreur définition miniature:', err);
                setMessage({ 
                    type: 'error', 
                    text: 'Erreur lors de la définition de l\'image principale'
                });
            })
            .finally(() => setLoading(false));
    };

    // Nouvelle fonction : sélectionner une image pour modification
    const handleSelectImageForEdit = (image) => {
        setSelectedImage(image);
        setEditingAlt(image.alt);
        setEditingImageFile(null);
        setEditMode(true);
    };

    // Nouvelle fonction : annuler l'édition
    const handleCancelEdit = () => {
        setEditMode(false);
        setSelectedImage(null);
        setEditingAlt('');
        setEditingImageFile(null);
    };

    // Nouvelle fonction : gérer le changement de fichier image pendant l'édition
    const handleEditImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEditingImageFile(e.target.files[0]);
        }
    };

    // Nouvelle fonction : soumettre les modifications de l'image
    const handleSubmitImageEdit = (e) => {
        e.preventDefault();
        
        if (!selectedImage) return;
        
        // Vérifier que le texte alt a au moins 3 caractères
        if (editingAlt.trim().length < 3) {
            setMessage({ type: 'error', text: 'La description doit contenir au moins 3 caractères' });
            return;
        }

        if (editingImageFile) {
            // Vérifier les doublons (sauf avec l'image actuelle)
            const newFileName = editingImageFile.name
                .split('.')[0]
                .replace(/[-_]/g, '')
                .toLowerCase();
            
            const duplicateImage = images.find(existingImage => {
                // Ne pas comparer avec l'image en cours d'édition
                if (existingImage.id === selectedImage.id) return false;
                
                const existingFileName = extractFileNameFromCloudinaryUrl(existingImage.url)
                    .replace(/[-_]/g, '')
                    .toLowerCase();
                
                return existingFileName.includes(newFileName) || newFileName.includes(existingFileName);
            });
            
            if (duplicateImage) {
                setMessage({
                    type: 'error',
                    text: `Cette image semble déjà présente dans l'article`
                });
                return;
            }
        }

        setLoading(true);
        
        // Préparation des données
        const updates = {};
        if (editingImageFile) {
            updates.fichierImage = editingImageFile;
        }
        updates.descriptionImage = editingAlt.trim();

        updateImage(article.id, selectedImage.id, updates)
            .then(response => {
                if (response.status === 200) {
                    // Mettre à jour l'image dans l'état local
                    setImages(prevImages => 
                        prevImages.map(img => 
                            img.id === selectedImage.id 
                                ? { 
                                    ...img, 
                                    url: response.image?.url || img.url,
                                    alt: response.image?.alt || editingAlt
                                } 
                                : img
                        )
                    );
                    
                    setMessage({ type: 'success', text: 'Image mise à jour avec succès' });
                    handleCancelEdit();
                    onUpdate && onUpdate();
                } else {
                    setMessage({ type: 'error', text: response.message || 'Erreur lors de la mise à jour' });
                }
            })
            .catch(error => {
                console.error("Erreur lors de la mise à jour de l'image:", error);
                setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de l\'image' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Effet pour gérer l'affichage temporaire des messages
    useEffect(() => {
        let timeoutId;
        if (message.text) {
            timeoutId = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 2000);
        }
        return () => clearTimeout(timeoutId);
    }, [message.text]);

    return (
        <div className="article-image-manager">
            <div className="article-image-manager__content">
                <h3 className="article-image-manager__title">Gestion des images</h3>

                {message.text && (
                    <div className={`article-image-manager__message ${
                        message.type === 'error' ? 'article-image-manager__message--error' : 'article-image-manager__message--success'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Mode édition */}
                {editMode && selectedImage && (
                    <div className="article-image-manager__edit-panel">
                        <h4 className="article-image-manager__subtitle">Modifier l'image</h4>
                        <form onSubmit={handleSubmitImageEdit} className="article-image-manager__edit-form">
                            <div className="article-image-manager__edit-layout">
                                <div className="article-image-manager__edit-image-container">
                                    <img 
                                        src={editingImageFile ? URL.createObjectURL(editingImageFile) : selectedImage.url} 
                                        alt={editingAlt} 
                                        className="article-image-manager__edit-image"
                                    />
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleEditImageChange}
                                        className="article-image-manager__file-input"
                                    />
                                </div>
                                
                                <div className="article-image-manager__edit-details">
                                    <div className="article-image-manager__form-group">
                                        <label className="article-image-manager__label">Description de l'image : </label>
                                        <input
                                            type="text"
                                            value={editingAlt}
                                            onChange={(e) => setEditingAlt(e.target.value)}
                                            className={`article-image-manager__input ${
                                                editingAlt.trim().length < 3 ? 'article-image-manager__input--error' : ''
                                            }`}
                                            placeholder="Description de l'image (minimum 3 caractères)"
                                            minLength={3}
                                        />
                                        {editingAlt.trim().length < 3 && (
                                            <p className="article-image-manager__error-text">
                                                La description doit contenir au moins 3 caractères
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="article-image-manager__actions">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="article-image-manager__button article-image-manager__button--cancel"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || (editingAlt.trim().length < 3)}
                                    className="article-image-manager__button article-image-manager__button--save"
                                >
                                    {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Images existantes (visibles uniquement hors mode édition) */}
                {!editMode && (
                    <div className="article-image-manager__section">
                        <h4 className="article-image-manager__subtitle">
                            Images actuelles ({images.length})
                            {images.find(img => img.thumbnail === 1) && " (✓ miniature définie)"}
                        </h4>
                        <div className="article-image-manager__grid">
                            {images.map((image, index) => (
                                <div 
                                    key={`${image.id}-${index}`}
                                    className="article-image-manager__preview"
                                >
                                    <div className="article-image-manager__image-container">
                                        <img 
                                            src={image.url} 
                                            alt={image.alt} 
                                            className={`article-image-manager__image ${
                                                image.thumbnail === 1 ? 'article-image-manager__image--thumbnail' : ''
                                            }`}
                                        />
                                        
                                        {image.thumbnail === 1 && (
                                            <div className="article-image-manager__badge">
                                                Image principale
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="article-image-manager__details">
                                        <p className="article-image-manager__alt-text">description de l'image : {image.alt}</p>
                                        <div className="article-image-manager__buttons">
                                            <button
                                                onClick={() => handleSelectImageForEdit(image)}
                                                disabled={loading}
                                                className="article-image-manager__button article-image-manager__button--edit"
                                            >
                                                Modifier
                                            </button>

                                            {image.thumbnail !== 1 && (
                                                <button
                                                    onClick={() => handleSetAsThumbnail(image.id)}
                                                    disabled={loading}
                                                    className="article-image-manager__button article-image-manager__button--thumbnail"
                                                >
                                                    Définir comme principale
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteImage(image.id)}
                                                disabled={loading}
                                                className="article-image-manager__button article-image-manager__button--delete"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ajout de nouvelles images (visible uniquement hors mode édition) */}
                {!editMode && (
                    <div className="article-image-manager__section">
                        <h4 className="article-image-manager__subtitle">Ajouter des images</h4>
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="article-image-manager__file-input"
                        />
                        
                        {newImages.length > 0 && (
                            <div className="article-image-manager__grid">
                                {newImages.map((image, index) => (
                                    <div key={index} className="article-image-manager__preview">
                                        <div className="article-image-manager__image-container">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt=""
                                                className="article-image-manager__image"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={newImageAlts[index]}
                                            onChange={(e) => handleNewAltChange(index, e.target.value)}
                                            className={`article-image-manager__input ${
                                                newImageAlts[index]?.length < 3 ? 'article-image-manager__input--error' : ''
                                            }`}
                                            placeholder="Description de l'image (minimum 3 caractères)"
                                            minLength={3}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {newImages.length > 0 && (
                            <button
                                onClick={handleAddImages}
                                disabled={loading}
                                className="article-image-manager__button article-image-manager__button--add"
                            >
                                {loading ? 'Ajout en cours...' : 'Ajouter les images'}
                            </button>
                        )}
                    </div>
                )}

                <div className="article-image-manager__footer">
                    <button
                        onClick={onClose}
                        className="article-image-manager__button article-image-manager__button--close"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArticleImageManager;