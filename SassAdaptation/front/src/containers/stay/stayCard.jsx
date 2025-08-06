import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedStay } from '../../slices/staySlice';
// @ts-ignore
import { decodeHTML } from '../../utils/decodeHTML';

const StayCard = ({ stay }) => {
    const dispatch = useDispatch();

    const handleStayClick = () => {
        dispatch(setSelectedStay(stay));
    };
    
    // Fonction pour tronquer le texte avec des points de suspension
    const truncateText = (text, maxLength) => {
        if (!text) return "";
        return text.length > maxLength 
            ? text.substring(0, maxLength) + '...' 
            : text;
    };

    return (
        <article className="stay-card">
            {/* Ajoutez un badge si nécessaire */}
            {stay.isNew && <span className="stay-card__badge stay-card__badge--new">Nouveau</span>}
            
            <Link to={`/stays/${stay.id}`} className="stay-card__link" onClick={handleStayClick}>
                <div className="stay-card__image-container">
                    <img 
                        src={stay.image?.url || "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png"} 
                        alt={stay.image?.alt || stay.title || "Image par défaut"}
                        className="stay-card__image"
                    />
                </div>
                
                <div className="stay-card__content">
                    <h3 className="stay-card__title">{decodeHTML(stay.title)}</h3>
                    <p className="stay-card__description">
                        {decodeHTML(truncateText(stay.description, 100))}
                    </p>
                    <div className="stay-card__footer">
                        <span className="stay-card__price">{stay.price}€</span>
                        <span className="stay-card__cta">Voir plus</span>
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default StayCard;