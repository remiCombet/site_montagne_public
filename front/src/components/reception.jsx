import React, { useEffect, useState } from 'react';
import { getReceptionPointByStayId } from '../api/reception';  
import { parse, format } from 'date-fns';

const Reception = ({ receptionPointId }) => {
    const [receptionPoint, setReceptionPoint] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (receptionPointId) {
            // Récupération des points de réception pour un séjour spécifique
            getReceptionPointByStayId(receptionPointId)
                .then((res) => {
                    setReceptionPoint(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError("Erreur lors du chargement des points de réception");
                    setLoading(false);
                });
        }
    }, [receptionPointId]);

     // Vérification que les heures sont présentes et valides
     const parseTime = (time) => {
        return time ? parse(time, 'HH:mm:ss', new Date()) : null;
    };

    const openingTime = parseTime(receptionPoint.opening_time);
    const closingTime = parseTime(receptionPoint.closing_time);

    if (loading) return <p>Chargement des informations...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h4>Point de réception</h4>
            {receptionPoint ? (
                <div>
                    <p><strong>Location:</strong> {receptionPoint.location}</p>
                    <p><strong>Contact:</strong> {receptionPoint.contact_name}</p>
                    <p><strong>Téléphone:</strong> {receptionPoint.contact_phone}</p>
                    <p><strong>Email:</strong> {receptionPoint.contact_email}</p>
                    <p><strong>Heures d'ouverture:</strong> {format(openingTime, 'HH:mm')} - {format(closingTime, 'HH:mm')}</p>
                </div>
            ) : (
                <p>Aucun point de réception disponible pour ce séjour.</p>
            )}
        </div>
    );
};

export default Reception;
