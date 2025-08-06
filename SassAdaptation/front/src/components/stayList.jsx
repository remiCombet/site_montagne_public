import React from "react";
import { useSelector } from "react-redux";
import StayCard from "../containers/stay/stayCard";

const StayList = () => {
    const stays = useSelector((state) => state.stay.stays);

    return (
        <section className="stay-list-section">
            <h2 className="stay-list-section__title">Liste des Séjours</h2>
            
            {stays.length > 0 ? (
                <ul className="stay-list-grid">
                    {stays.map((stay) => (
                        <li key={stay.id} className="stay-list-grid__item">
                            <StayCard stay={stay} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="stay-list-section__empty-message">
                    Aucun séjour disponible pour le moment.
                </p>
            )}
        </section>
    );
};

export default StayList;