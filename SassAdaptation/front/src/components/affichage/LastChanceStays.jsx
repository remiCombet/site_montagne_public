import React from 'react';
import { parseISO, isAfter, format, compareAsc } from 'date-fns';
import { fr } from 'date-fns/locale';
import { decodeHTML } from '../../utils/decodeHtml';

const LastChanceStays = ({ stays }) => {
    // Cas où pas de séjour
    if (!stays || stays.length === 0) {
        return null;
    }

    const today = new Date();
    
    // Filtrer les séjours à venir et où il reste peu de places
    const lastChanceStays = stays
      .filter(stay => {
        // Séjours à venir uniquement
        const startDate = parseISO(stay.startDate || stay.start_date);
        const isUpcoming = isAfter(startDate, today);
        
        // Calcul des places restantes
        const maxParticipants = stay.max_participant || 0;
        const confirmedParticipants = stay.confirmedParticipants || 0;
        const remainingSpots = maxParticipants - confirmedParticipants;
        
        // Séjours avec peu de places restantes (20% ou moins des places totales)
        const isLastChance = remainingSpots > 0 && remainingSpots <= Math.max(1, maxParticipants * 0.2);
                
        return isUpcoming && isLastChance;
      })
      .sort((a, b) => {
        // Trier par date
        return compareAsc(
          parseISO(a.startDate || a.start_date),
          parseISO(b.startDate || b.start_date)
        );
      })
      .slice(0, 2); // Limiter à 2 séjours
    
    // Ne rien afficher s'il n'y a pas de séjours avec peu de places
    if (lastChanceStays.length === 0) {
        return null;
    }
    
    return (
        <section className="last-chance-stays">
            <header className="last-chance-stays__header">
                <h2 className="last-chance-stays__title">Dernières places disponibles</h2>
                <p className="last-chance-stays__subtitle">Ne tardez pas, ces séjours sont presque complets !</p>
            </header>
            
            <ul className="last-chance-stays__grid">
                {lastChanceStays.map(stay => {
                    // Calcul des places restantes
                    const maxParticipants = stay.max_participant || 0;
                    const confirmedParticipants = stay.confirmedParticipants || 0;
                    const remainingSpots = maxParticipants - confirmedParticipants;
                    
                    return (
                        <li key={stay.id}>
                            <article className="stay-card stay-card--urgent">
                                <figure className="stay-card__figure">
                                    <img 
                                        src={stay.image?.url || "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png"} 
                                        alt={stay.image?.alt || stay.title}
                                        className="stay-card__image"
                                    />
                                    <div className="stay-card__badge">
                                        {remainingSpots === 1 ? 'Dernière place !' : `${remainingSpots} places restantes`}
                                    </div>
                                </figure>
                                
                                <header className="stay-card__header">
                                    <h3 className="stay-card__title">{decodeHTML(stay.title)}</h3>
                                </header>
                                
                                <ul className="stay-card__details">
                                    <li className="stay-card__location">📍 {decodeHTML(stay.location)}</li>
                                    <li className="stay-card__dates">
                                        🗓️ Du {format(parseISO(stay.start_date || stay.startDate), 'dd MMMM yyyy', { locale: fr })}
                                        {' '}au {format(parseISO(stay.end_date || stay.endDate), 'dd MMMM yyyy', { locale: fr })}
                                    </li>
                                    <li className="stay-card__capacity">👥 {confirmedParticipants}/{maxParticipants} participants</li>
                                    <li className="stay-card__price">💰 {stay.price}€</li>
                                </ul>
                                
                                <footer className="stay-card__footer">
                                    <a href={`/sejours/${stay.id}`} className="stay-card__button stay-card__button--urgent">
                                        Réserver maintenant
                                    </a>
                                </footer>
                            </article>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default LastChanceStays;