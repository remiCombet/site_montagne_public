import { useEffect } from 'react';
import { parseISO, isAfter, format, compareAsc } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';  // Ajoutez cet import
import { useDispatch } from 'react-redux';  // Ajoutez cet import
import { setSelectedStay } from '../../slices/staySlice';  // Ajoutez cet import
import { decodeHTML } from '../../utils/decodeHtml';

const FeaturedStays = ({ stays }) => {
    // Ajouter dispatch pour pouvoir mettre à jour selectedStay
    const dispatch = useDispatch();
    
    // Cas ou pas de séjour
    if (!stays || stays.length === 0) {
        return null;
    }

    const today = new Date();
    
    // Filtrer et trier les séjours à venir (3 maximum)
    const upcomingStays = stays
      .filter(stay => {
        // Convertir la chaîne de date en objet Date avec parseISO
        const startDate = parseISO(stay.startDate || stay.start_date);
        return isAfter(startDate, today);
      })
      .sort((a, b) => {
        // Trier par date avec compareAsc de date-fns
        return compareAsc(
          parseISO(a.startDate || a.start_date),
          parseISO(b.startDate || b.start_date)
        );
      })
      .slice(0, 3);
    
    // Fonction pour mettre à jour selectedStay lors du clic sur un séjour
    const handleStayClick = (stay) => {
        dispatch(setSelectedStay(stay));
    };
    
    return (
        <section className="featured-stays">
            <header className="featured-stays__header">
                <h2 className="featured-stays__title">Nos prochains départs</h2>
                <p className="featured-stays__subtitle">Découvrez nos séjours à venir et préparez-vous pour votre prochaine aventure !</p>
            </header>
            
            <ul className="featured-stays__grid">
                {upcomingStays.map(stay => (
                    <li key={stay.id}>
                        <article className="stay-card stay-card--grass-test">
                            <figure className="stay-card__figure">
                                <img 
                                    src={stay.image?.url || "https://placeholder.com/300"} 
                                    alt={stay.image?.alt || stay.title}
                                    className="stay-card__image"
                                />
                                <div className="grass-border"></div> 
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
                                <li className="stay-card__price">💰 {stay.price}€</li>
                            </ul>
                                                        
                            <footer className="stay-card__footer">
                                {/* Remplacer a href par Link to et ajouter onClick */}
                                <Link 
                                    to={`/stays/${stay.id}`} 
                                    className="stay-card__button"
                                    onClick={() => handleStayClick(stay)}
                                >
                                    Voir les détails
                                </Link>
                            </footer>
                        </article>
                    </li>
                ))}
            </ul>
            
            <footer className="featured-stays__footer">
                {/* Remplacer a href par Link to */}
                <Link to="/stays" className="featured-stays__link">
                    Voir tous nos séjours
                </Link>
            </footer>
        </section>
    )
};

export default FeaturedStays;

