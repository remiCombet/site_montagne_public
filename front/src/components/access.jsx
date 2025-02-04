import { useEffect, useState } from 'react';
import { getAccessByStayId } from '../api/stayAccess';

const Access = ({ stayId }) => {
    const [accesses, setAccesses] = useState([]);

    useEffect(() => {
        if (stayId) {
            // Chargement des accès via l'API
            getAccessByStayId(stayId)
                .then((res) => {
                    if (res.status === 200 && res.access) {
                        setAccesses(res.access);
                    } else {
                        console.error("Erreur lors du chargement des accès");
                    }
                })
                .catch((err) => {
                    console.error("Erreur lors du chargement des accès", err);
                });
        }
    }, [stayId]);

    if (!accesses.length) {
        return <p>Aucun accès disponible pour ce séjour.</p>;
    }

    return (
        <div>
            <h4>Accès au séjour :</h4>
            <ul>
                {accesses.map((access) => (
                    <li key={access.id}>
                        <strong>{access.access.category}:</strong> {access.access.informations}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Access;
