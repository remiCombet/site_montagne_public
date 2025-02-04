import React from "react";
import { useSelector } from "react-redux";
import { selectStay } from "../slices/staySlice";

import StayCard from "../containers/stay/stayCard";

const StayList = () => {
    const { stays } = useSelector(selectStay);

    return (
        <div className="stay-list">
            <h1>Liste des Séjours</h1>
            {stays.length > 0 ? (
                <div className="stay-cards">
                    {stays.map((stay) => (
                        <StayCard key={stay.id} stay={stay} />
                    ))}
                </div>
            ) : (
                <p>Aucun séjour disponible pour le moment.</p>
            )}
        </div>
    );
};

export default StayList;
