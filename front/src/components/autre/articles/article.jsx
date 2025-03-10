import { useState, useEffect } from 'react';
import { getAllArticles } from '../../../api/publicApi';
import ArticleList from './articleList';
import ArticleForm from './articleForm';

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
        <section className="p-4">
            <h2 className="text-2xl font-bold mb-4">Gestion des articles</h2>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <article className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Ajouter un article</h3>
                {isPopupOpen && (
                    <ArticleForm 
                        onClose={() => setIsPopupOpen(false)}
                        onSuccess={handleUpdateList}
                    />
                )}
                <button 
                    onClick={() => setIsPopupOpen(!isPopupOpen)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {isPopupOpen ? 'Masquer le formulaire' : 'Ajouter un article'}
                </button>
            </article>

            <article>
                <h3 className="text-xl font-semibold mb-4">Liste des articles</h3>
                {articles.length > 0 ? (
                    <ArticleList
                        articles={articles}
                        onUpdateList={handleUpdateList}
                    />
                ) : (
                    <p>Vous pouvez commencer par créer un article.</p>
                )}
            </article>
        </section>
    );
};

export default Article;