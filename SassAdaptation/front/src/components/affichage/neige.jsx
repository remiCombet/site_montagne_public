import { useEffect, useRef } from 'react';
import { createSnowEffect, isWinterSeason } from '../../js/effects/snowEffect';
import { parseISO, isAfter, format, compareAsc } from 'date-fns';
import { fr } from 'date-fns/locale';
import { decodeHTML } from '../../utils/decodeHtml';

const FeaturedStays = ({ stays }) => {

     // Créer une référence pour votre section
     const featuredRef = useRef(null);

     useEffect(() => {
         // Ne rien faire si pas de séjours
         if (!stays || stays.length === 0) return;
         
         // Vérifier si nous sommes en hiver et sur un appareil non mobile
         const isMobile = window.innerWidth < 768 || 
                         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
         
         // Ne pas afficher l'effet si on est sur mobile ou si ce n'est pas l'hiver
         if (isMobile || !isWinterSeason()) return;
         
         // Utiliser la référence au lieu du sélecteur document.querySelector
         const featuredSection = featuredRef.current;
         if (!featuredSection) return;
         
         // Définir position relative pour le conteneur parent (important pour positionnement absolu)
         featuredSection.style.position = 'relative';
         
         // Créer l'effet de neige pour la section de séjours en montagne
         const snowContainer = document.createElement('div');
         snowContainer.className = 'snow-container';
         featuredSection.prepend(snowContainer);
         
         createSnowEffect(`.snow-container`, 30); // Moins de flocons pour plus de légèreté
         
         // Nettoyer l'effet quand le composant se démonte
         return () => {
             if (snowContainer.parentNode) {
                 snowContainer.remove();
             }
         };
     }, [stays]); // Dépendance à stays pour réexécuter si les séjours changent
 

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

    console.log("Séjours à venir :", upcomingStays);
    
    return (
        <section className="featured-stays" ref={featuredRef}>
            <header className="featured-stays__header">
                <h2 className="featured-stays__title">Nos prochains départs</h2>
                <p className="featured-stays__subtitle">Découvrez nos séjours à venir et préparez-vous pour votre prochaine aventure !</p>
            </header>
            
            <ul className="featured-stays__grid">
                {upcomingStays.map(stay => (
                    <li key={stay.id}>
                        <article className="stay-card">
                            <figure className="stay-card__figure">
                                <img 
                                    src={stay.image?.url || "https://placeholder.com/300"} 
                                    alt={stay.image?.alt || stay.title}
                                    className="stay-card__image"
                                />
                            </figure>
                            
                            <header className="stay-card__header">
                                <h3 className="stay-card__title">{decodeHTML(stay.title)}</h3>
                            </header>
                            
                            {/* <dl className="stay-card__details">
                                <dt>Localisation :</dt>
                                <dd className="stay-card__location">{decodeHTML(stay.location)}</dd>
                                
                                <dt>Description:</dt>
                                <dd className="stay-card_description">
                                    {decodeHTML(stay.description)}
                                </dd>

                                <dt>Dates :</dt>
                                <dd className="stay-card__dates">
                                    du {format(parseISO(stay.start_date || stay.startDate), 'dd MMMM yyyy', { locale: fr })}{' '}
                                    au {format(parseISO(stay.end_date || stay.endDate), 'dd MMMM yyyy', { locale: fr })}
                                </dd>
                                
                                <dt>Prix :</dt>
                                <dd className="stay-card__price">{stay.price}€</dd>
                            </dl> */}
                            <ul className="stay-card__details">
                                <li className="stay-card__location">📍 {decodeHTML(stay.location)}</li>
                                <li className="stay-card__dates">
                                    🗓️ Du {format(parseISO(stay.start_date || stay.startDate), 'dd MMMM yyyy', { locale: fr })}
                                    {' '}au {format(parseISO(stay.end_date || stay.endDate), 'dd MMMM yyyy', { locale: fr })}
                                </li>
                                <li className="stay-card__price">💰 {stay.price}€</li>
                            </ul>
                                                        
                            <footer className="stay-card__footer">
                                <a href={`/sejours/${stay.id}`} className="stay-card__button">
                                    Voir les détails
                                </a>
                            </footer>
                        </article>
                    </li>
                ))}
            </ul>
            
            <footer className="featured-stays__footer">
                <a href="/sejours" className="featured-stays__link">Voir tous nos séjours</a>
            </footer>
        </section>
    )
};

export default FeaturedStays;

