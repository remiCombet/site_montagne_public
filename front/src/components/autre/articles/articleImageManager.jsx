import { useState, useEffect } from 'react';
import { updateImage, deleteImage, addImages } from '../../../api/admin/articleImage';
import { extractFileNameFromCloudinaryUrl } from '../../../utils/extractImageName';

const ArticleImageManager = ({ article, onClose, onUpdate }) => {
    // États initiaux
    const [images, setImages] = useState(article.images || []);
    const [newImages, setNewImages] = useState([]);
    const [newImageAlts, setNewImageAlts] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

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

    // Modification d'une image existante
    const handleUpdateImage = (imageId, newAlt) => {
        setLoading(true);
        updateImage(article.id, imageId, { image_alt: newAlt })
            .then(response => {
                if (response.status === 200) {
                    setImages(prev => prev.map(img => 
                        img.id === imageId ? { ...img, alt: newAlt } : img
                    ));
                    setMessage({ type: 'success', text: 'Image mise à jour avec succès' });
                    onUpdate && onUpdate();
                }
            })
            .catch(err => {
                setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de l\'image' });
                console.error('Erreur mise à jour:', err);
            })
            .then(() => setLoading(false));
    };

    // Suppression d'une image
    const handleDeleteImage = (imageId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

        setLoading(true);
        deleteImage(article.id, imageId)
            .then(response => {
                if (response.status === 200) {
                    setImages(prev => prev.filter(img => img.id !== imageId));
                    setMessage({ type: 'success', text: 'Image supprimée avec succès' });
                    onUpdate && onUpdate();
                }
            })
            .catch(err => {
                setMessage({ type: 'error', text: 'Erreur lors de la suppression de l\'image' });
                console.error('Erreur suppression:', err);
            })
            .then(() => setLoading(false));
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
            formData.append('images', image);
            formData.append('imageAlts', newImageAlts[index].trim());
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
        <div className="article-image-manager fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Gestion des images</h3>

                {message.text && (
                    <div className={`p-3 mb-4 rounded ${
                        message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Images existantes */}
                <div className="mb-6">
                    <h4 className="font-semibold mb-2">
                        Images actuelles ({images.length})
                        {images.find(img => img.thumbnail) && " (✓ miniature)"}
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
                                            image.thumbnail ? 'border-2 border-green-500' : ''
                                        }`}
                                    />
                                    {image.thumbnail && (
                                        <span className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs rounded">
                                            Miniature
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={image.alt}
                                    onChange={(e) => handleUpdateImage(image.id, e.target.value)}
                                    className="w-full p-2 border rounded mb-2"
                                    placeholder="Description de l'image"
                                />
                                <button
                                    onClick={() => handleDeleteImage(image.id)}
                                    disabled={loading}
                                    className="bg-red-500 text-white px-3 py-1 rounded w-full disabled:opacity-50"
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ajout de nouvelles images */}
                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Ajouter des images</h4>
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="mb-4"
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
                                        className={`w-full p-2 border rounded ${
                                            newImageAlts[index]?.length < 3 ? 'border-red-500' : 'border-gray-300'
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
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            Ajouter les images
                        </button>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArticleImageManager;