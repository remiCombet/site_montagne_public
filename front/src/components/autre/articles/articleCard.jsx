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
        <article className="article-card">
            <div className="article-card__content">
                {/* Informations de l'article */}
                <div className="article-card__info">
                    <div className="article-card__header">
                        <h4 className="article-card__title">{deepDecodeHTML(article.title)}</h4>
                    </div>

                    <p className="article-card__description">Description : {deepDecodeHTML(article.shortDescription)}</p>

                    <div className="article-card__meta">
                        {article.location && (
                            <p className="article-card__location">📍 Lieu : {deepDecodeHTML(article.location)}</p>
                        )}
                        <p className="article-card__date">📅 Date : {format(new Date(article.startDate), 'dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                </div>

                {/* Image principale */}
                <div className="article-card__image-container">
                    {thumbnailImage ? (
                        <img
                            src={thumbnailImage.url}
                            alt={thumbnailImage.alt}
                            className="article-card__image"
                        />
                    ) : (
                        <div className="article-card__image-placeholder">
                            <span>Aucune image</span>
                        </div>
                    )}
                </div>

                <div className="article-card__actions">
                    <button 
                        onClick={() => setShowDetails(true)}
                        className="article-card__button article-card__button--edit"
                    >
                        Voir/Modifier
                    </button>
                    <button 
                        onClick={() => setShowImageManager(true)}
                        className="article-card__button article-card__button--images"
                    >
                        Gérer les images ({imagesCount})
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="article-card__button article-card__button--delete"
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