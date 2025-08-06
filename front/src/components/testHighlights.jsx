// TestHighlights.jsx
import React from 'react';
import { useSelector } from 'react-redux';

const TestHighlights = () => {
    // Utilisation de useSelector pour récupérer les points forts du séjour d'ID 3
    const highlights = useSelector((state) => state.entity.highlights[3] || []);

    return (
        <div>
            <h3>Points forts pour le séjour avec l'ID 3</h3>
            {highlights.length > 0 ? (
                <ul>
                    {highlights.map((highlight) => (
                        <li key={highlight.id}>
                            <strong>{highlight.title}:</strong> {highlight.description}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Aucun point fort disponible pour ce séjour.</p>
            )}
        </div>
    );
};

export default TestHighlights;
