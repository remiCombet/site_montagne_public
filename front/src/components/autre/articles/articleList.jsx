import React from 'react';
import ArticleCard from './ArticleCard';

const ArticleList = ({ articles, onUpdateList }) => {
    return (
        <section>
            <ul>
                {articles.map((article) => (
                    <li key={article.id}>
                        <ArticleCard
                            article={article}
                            onUpdateList={onUpdateList}
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default ArticleList;