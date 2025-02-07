import React, { useEffect, useState } from 'react';
import { getToPrepareByStayId } from '../api/toPrepare'; // L'API pour récupérer les éléments à prévoir

const ToPrepare = ({ stayId }) => {
    const [toPrepare, setToPrepare] = useState({}); // Initialiser en tant qu'objet vide pour correspondre à la structure de l'API
    const [loading, setLoading] = useState(true); // Ajouter un état de chargement
    const [error, setError] = useState(null); // Ajouter un état d'erreur

    useEffect(() => {
        // Si stayId est disponible, on effectue l'appel API pour récupérer les équipements à prévoir
        if (stayId) {
            setLoading(true);
            setError(null);
            getToPrepareByStayId(stayId)
                .then((res) => {
                    if (res.status === 200) {
                        setToPrepare(res.toPrepare || {});
                    } else {
                        setError("Erreur lors de la récupération des éléments à prévoir.");
                    }
                })
                .catch((err) => {
                    setError("Erreur lors de l'appel API pour les éléments à prévoir.");
                    console.error(err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [stayId]);

    if (loading) {
        return <div>Chargement des éléments à prévoir...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h5>Éléments à prévoir</h5>
            <ul>
                {Object.keys(toPrepare).length > 0 ? (
                    Object.keys(toPrepare).map((category) => (
                        <li key={category}>
                            <h5>{category}</h5>
                            <ul>
                                {toPrepare[category].map((item) => (
                                    <li key={item.id}>
                                        <span style={{ fontWeight: 'bold' }}>{item.category.name}</span> : 
                                        <span> {item.category.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))
                ) : (
                    <p>Aucun élément trouvé à prévoir.</p>
                )}
            </ul>
        </div>
    );
};

export default ToPrepare;