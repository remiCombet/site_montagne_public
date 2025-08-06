import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectStays, setSelectedStay } from '../../slices/staySlice';
// @ts-ignore
import { decodeHTML } from '../../utils/decodeHTML';
import { selectSelectedStay } from '../../slices/staySlice';

const Test = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch= useDispatch();

    const selectedStay = useSelector(selectSelectedStay);
    const stays = useSelector(selectStays);

    const stayId = parseInt(id);

    const currentStay = selectedStay && selectedStay.id === stayId
        ? selectedStay
        : stays.find(stay => stay.id === stayId);
    
    // Trouver l'index du séjour actuel dans la liste
    const currentIndex = stays.findIndex(stay => stay.id === stayId);

    // Calculer les indices des séjours précédent et suivant
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : stays.length - 1;
    const nextIndex = currentIndex < stays.length - 1 ? currentIndex + 1 : 0;

    // Récupérer les séjours précédent et suivant
    const prevStay = stays[prevIndex];
    const nextStay = stays[nextIndex];
    
    // Fonction pour naviguer vers un autre séjour
    const navigateToStay = (stay) => {
        dispatch(setSelectedStay(stay));
        navigate(`/stays/${stay.id}`);
    };

    // Si aucun séjour n'est trouvé
    if (!currentStay) {
        return (
            <section className="stay-details-section stay-details-section--not-found">
                <h1>Séjour non trouvé</h1>
                <p>Le séjour que vous recherchez n'existe pas.</p>
                <Link to="/stays" className="stay-details-section__back-button">
                    Retour aux séjours
                </Link>
            </section>
        );
    }

    return (
        <section className="stay-details-section">
            {/* Navigation entre séjours */}
            <nav className="stay-navigation">
                <button 
                    onClick={() => navigateToStay(prevStay)} 
                    className="stay-navigation__button stay-navigation__button--prev"
                    aria-label="Séjour précédent"
                >
                    ← {prevStay.title ? decodeHTML(prevStay.title).substring(0, 15) + '...' : 'Précédent'}
                </button>
                
                <h2 className="stay-details-section__title">
                    {decodeHTML(currentStay.title)}
                </h2>
                
                <button 
                    onClick={() => navigateToStay(nextStay)} 
                    className="stay-navigation__button stay-navigation__button--next"
                    aria-label="Séjour suivant"
                >
                    {nextStay.title ? decodeHTML(nextStay.title).substring(0, 15) + '...' : 'Suivant'} →
                </button>
            </nav>
            
            {/* Contenu principal du séjour */}
            <article className="stay-content">
                {/* Ici vous pouvez ajouter le reste du contenu du séjour */}
            </article>
        </section>
    );
};

export default Test;