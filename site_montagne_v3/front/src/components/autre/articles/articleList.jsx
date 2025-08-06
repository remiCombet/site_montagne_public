import React from 'react';

const ArticleList = ({ articles, onUpdateList }) => {
    return (
        <div className="article-list">
            {articles.map(article => (
                <div key={article.id} className="article-item">
                    <h4 className="article-title">{article.title}</h4>
                    <p className="article-content">{article.content}</p>
                    <button 
                        className="btn-edit" 
                        onClick={() => onUpdateList(article.id)}
                    >
                        Modifier
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ArticleList;