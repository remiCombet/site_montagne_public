import { useEffect, useState } from 'react';
import { getAccessByStayId } from '../api/stayAccess';
// @ts-ignore
import { decodeHTML } from '../utils/decodeHtml';

const Access = ({ stayId }) => {
    const [accesses, setAccesses] = useState([]);

    useEffect(() => {
        if (stayId) {
            getAccessByStayId(stayId)
                .then((res) => {
                    if (res.status === 200 && res.accesses) {
                        // Utilisation de la fonction avec le bon nom
                        const decodedAccesses = res.accesses.map(access => ({
                            ...access,
                            category: decodeHTML(access.category),
                            informations: decodeHTML(access.informations)
                        }));
                        setAccesses(decodedAccesses);
                    } else {
                        console.error("Erreur lors du chargement des accès");
                    }
                })
                .catch((err) => {
                    console.error("Erreur lors du chargement des accès", err);
                });
        }
    }, [stayId]);
    useEffect(() => {
        console.log('Nouvelle valeur de accesses:', accesses);
    }, [accesses]);

    if (!accesses.length) {
        return <p>Aucun accès disponible pour ce séjour.</p>;
    }

    return (
        <div>
            <h4>Accès au séjour :</h4>
            <ul>
                {accesses.map((access) => (
                    <li key={access.id}>
                        <strong>{access.category}:</strong> {access.informations}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Access;
