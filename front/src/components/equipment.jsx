import React, { useEffect, useState } from 'react';
import { getEquipmentsByStayId } from '../api/equipment';

const Equipment = ({ stayId }) => {
    const [equipments, setEquipments] = useState({});

    useEffect(() => {
        if (stayId) {
            getEquipmentsByStayId(stayId)
                .then((res) => {
                    if (res.status === 200) {
                        setEquipments(res.equipments || {});
                    } else {
                        console.error("Erreur lors de la récupération des équipements");
                    }
                })
                .catch((err) => {
                    console.error("Erreur lors de l'appel API pour les équipements", err);
                });
        }
    }, [stayId]);

    return (
        <div>
            <h5>Équipements nécessaires</h5>
            <ul>
                {Object.keys(equipments).length > 0 ? (
                    Object.keys(equipments).map((category) => (
                        <li key={category}>
                            <h5>{category}</h5>
                            <ul>
                                {equipments[category].map((item) => (
                                    <li key={item.id}>
                                        <span style={{ fontWeight: 'bold' }}>{item.category.name}</span> : 
                                        <span> {item.category.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))
                ) : (
                    <p>Aucun équipement trouvé.</p>
                )}
            </ul>
        </div>
    );
};

export default Equipment;
