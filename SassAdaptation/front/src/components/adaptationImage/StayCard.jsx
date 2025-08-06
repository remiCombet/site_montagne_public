import React from 'react';
import { Link } from 'react-router-dom';
import ResponsiveImage from '../common/ResponsiveImage';

const StayCard = ({ stay }) => {
    console.log("StayCard", stay);
    return (
        <div className="stay-card">
            <Link to={`/stays/${stay.id}`} className="stay-card__link">
                <div className="stay-card__image-container">
                    <ResponsiveImage 
                        src={stay.image?.url} 
                        alt={stay.title} 
                        context="card"
                    />
                </div>
                <div className="stay-card__content">
                    <h3 className="stay-card__title">{stay.title}</h3>
                    <div className="stay-card__info">
                        <span className="stay-card__location">{stay.location}</span>
                        <span className="stay-card__price">{stay.price} €</span>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default StayCard;