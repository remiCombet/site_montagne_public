import { useState, useEffect } from 'react';
import { getAllArticles } from '../../../api/publicApi';
import ArticleList from './articleList';
import ArticleForm from './articleForm';
import MessagePopup from '../../admin/messagePopup';

const Article = () => {
    const [articles, setArticles] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const loadArticles = () => {
        getAllArticles()
            .then(res => {
                if (res && res.status === 200) {
                    setArticles(res.articles || []);
                    setMessage({ type: "", text: "" });
                } else if (res && res.status === 404) {
                    setArticles([]);
                    setMessage({ type: "info", text: "Aucun article disponible" });
                } else {
                    setArticles([]);
                    setMessage({ type: "error", text: "Erreur lors du chargement des articles" });
                }
            })
            .catch(error => {
                setArticles([]);
                setMessage({ type: "error", text: "Erreur lors du chargement des articles" });
                console.error('Erreur:', error);
            });
    };

    useEffect(() => {
        loadArticles();
    }, []);

    const handleUpdateList = () => {
        loadArticles();
        setIsPopupOpen(false);
    };

    return (
        <section className="admin-articles">
            <MessagePopup 
                message={message.text}
                type={message.type}
                onClose={() => setMessage({ type: '', text: '' })}
            />

            <header className="articles-header">
                <h2>Gestion des articles</h2>
            </header>

            <article className="add-article-section">
                <h3>Ajouter un article</h3>
                {isPopupOpen && (
                    <ArticleForm 
                        onClose={() => setIsPopupOpen(false)}
                        onSuccess={handleUpdateList}
                    />
                )}
                <button 
                    onClick={() => setIsPopupOpen(!isPopupOpen)}
                    className="form-toggle-button"
                >
                    {isPopupOpen ? 'Masquer le formulaire' : 'Ajouter un article'}
                </button>
            </article>

            <article className="articles-list">
                <h3>Liste des articles</h3>
                {articles.length > 0 ? (
                    <ArticleList
                        articles={articles}
                        onUpdateList={handleUpdateList}
                    />
                ) : (
                    <p className="no-articles">Vous pouvez commencer par créer un article.</p>
                )}
            </article>
        </section>
    );
};

export default Article;