import React from 'react';

const Highlights = ({ highlights }) => {
    return (
        <div>
            <h3>Points Positifs</h3>
            {highlights.length > 0 ? (
                <ul>
                    {highlights.map((highlight) => (
                        <li key={highlight.id}>
                            <strong>{highlight.title}:</strong> {highlight.description}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Aucun point positif trouvé pour ce séjour.</p>
            )}
        </div>
    );
};

export default Highlights;
