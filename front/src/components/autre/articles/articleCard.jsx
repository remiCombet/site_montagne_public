import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { deleteArticle } from '../../../api/admin/article';
import ArticleForm from './articleForm';
import { deepDecodeHTML } from '../../../utils/decodeHtml';
import ArticleImageManager from './articleImageManager';

const ArticleCard = ({ article, onUpdateList }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showImageManager, setShowImageManager] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Trouver l'image principale (thumbnail)
    const thumbnailImage = article.images?.find(img => img.thumbnail) || article.images?.[0];

    // Compteur d'images total
    const imagesCount = article.images?.length || 0;

    // Debug pour voir les données
    console.log('Article data:', {
        thumbnail: article.thumbnail,
        images: article.images,
        totalImages: article.images?.length
    });

    // Gestions des mises à jour
    const handleUpdateSuccess = () => {
        if (typeof onUpdateList === 'function') {
            onUpdateList();
        }
        setShowDetails(false);
    };

    // Gestion de la suppression
    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            setIsDeleting(true);
            deleteArticle(article.id)
                .then(response => {
                    if (response.status === 200) {
                        onUpdateList && onUpdateList();
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la suppression:', error);
                    alert('Erreur lors de la suppression de l\'article');
                })
                .then(() => setIsDeleting(false));
        }
    };

    return (
        <article className="article-card border p-4 mb-4 rounded shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image principale */}
                <div className="article-card__image-container md:col-span-1">
                    {thumbnailImage ? (
                        <img
                            src={thumbnailImage.url}
                            alt={thumbnailImage.alt}
                            className="article-card__image"
                        />
                    ) : (
                        <div className="article-card__image-placeholder">
                            <span className="text-gray-500">Aucune image</span>
                        </div>
                    )}
                </div>

                {/* Informations de l'article */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-start">
                        <h4 className="text-lg font-semibold">{deepDecodeHTML(article.title)}</h4>
                    </div>

                    <p className="text-gray-600">{deepDecodeHTML(article.shortDescription)}</p>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                        {article.location && (
                            <p>📍 {deepDecodeHTML(article.location)}</p>
                        )}
                        <p>📅 {format(new Date(article.startDate), 'dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowDetails(true)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                        Voir/Modifier
                    </button>
                    <button 
                        onClick={() => setShowImageManager(true)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                        Gérer les images ({imagesCount})
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                    >
                        {isDeleting ? 'Suppression...' : 'Supprimer'}
                    </button>
                </div>
            </div>

            {/* Popups */}
            {showDetails && (
                <ArticleForm
                    article={article}
                    onClose={() => setShowDetails(false)}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {showImageManager && (
                <ArticleImageManager
                    article={article}
                    onClose={() => setShowImageManager(false)}
                    onUpdate={onUpdateList}
                />
            )}
        </article>
    );
};

export default ArticleCard;