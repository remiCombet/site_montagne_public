import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedStay } from "../../slices/staySlice";

const StayCard = ({ stay }) => {
    const dispatch = useDispatch();

    const handleStayClick = () => {
        dispatch(setSelectedStay(stay));
    };

    return (
        <div className="stay-card">
            {/* Affichage de l'image si disponible */}
            {/* <img src={stay.imageUrl} alt={stay.title} className="stay-card-image" /> */}
            <Link to={`/stays/${stay.id}`} className="stay-card-title-link" onClick={handleStayClick}>
                <h3 className="stay-card-title">{stay.title}</h3>
            </Link>
            <p className="stay-card-description">{stay.description}</p>
            <p><strong>Prix :</strong> {stay.price}€</p>
        </div>
    );
};

export default StayCard;
