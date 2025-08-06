import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectStays, selectSelectedStay, setSelectedStay } from '../../slices/staySlice';
// @ts-ignore
import { decodeHTML } from '../../utils/decodeHTML';

// Composants
import StaySteps from './StaySteps';
import StayAdditionalInfo from './StayAdditionalInfo';
import StayBooking from './StayBooking';

// appels api
import { getHighlightsByStayId, getAllThemesByStayid, getStayStepByStayId, getAccommodationByStayStepId, getAllStayAccess } from '../../api/publicApi';

const Test = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // États pour les données liées
    const [highlights, setHighlights] = useState([]);
    const [themes, setThemes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stayDuration, setStayDuration] = useState(null);
    const [staySteps, setStaySteps] = useState([]);
    const [accommodations, setAccommodations] = useState({});
    const [accessInfo, setAccessInfo] = useState(null);

    const selectedStay = useSelector(selectSelectedStay);
    const stays = useSelector(selectStays);

    const stayId = parseInt(id);

    const currentStay = selectedStay && selectedStay.id === stayId
        ? selectedStay
        : stays.find(stay => stay.id === stayId);

    // Calculer la durée du séjour à partir des dates
    useEffect(() => {
        if (currentStay && currentStay.start_date && currentStay.end_date) {
            const startDate = new Date(currentStay.start_date);
            const endDate = new Date(currentStay.end_date);
            
            // Calculer la différence en millisecondes
            const diffTime = Math.abs(endDate - startDate);
            
            // Convertir en jours (ajouter 1 pour inclure le jour de départ)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            setStayDuration(diffDays);
        } else {
            setStayDuration(null);
        }
    }, [currentStay]);

    // Récupération des informations annexes au séjour   
    useEffect(() => {
        // Vérifier si le séjour existe
        if (!currentStay || !stayId) return;

        // Réinitialiser l'état
        setIsLoading(true);
        setError(null);
        
        // Récupérer les points forts
        getHighlightsByStayId(stayId)
        .then(highlightsData => {
            if (highlightsData && Array.isArray(highlightsData.highlights)) {
                const safeHighlights = highlightsData.highlights.map(highlight => ({
                    ...highlight,
                    title: highlight.title ? decodeHTML(highlight.title) : '',
                    description: highlight.description ? decodeHTML(highlight.description) : ''
                }));
                setHighlights(safeHighlights);
            } else {
                console.warn(`Format de réponse inattendu pour les points forts du séjour ${stayId}:`, highlightsData);
                setHighlights([]);
            }
        })
        .catch(err => {
            console.error('Erreur lors de la récupération des points forts:', err);
            setHighlights([]);
        });

        // Récupérer les thèmes
        getAllThemesByStayid(stayId)
        .then(themesData => {            
            if (themesData && Array.isArray(themesData.themes)) {
                const safeThemes = themesData.themes.map(theme => ({
                    ...theme,
                    name: theme.name ? decodeHTML(theme.name) : ''
                }));
                setThemes(safeThemes);
            } else {
                console.warn(`Format de réponse inattendu pour les thèmes du séjour ${stayId}:`, themesData);
                setThemes([]);
            }
        })
        .catch(err => {
            console.error('Erreur lors de la récupération des thèmes:', err);
            setThemes([]);
        });

        // NOUVEL APPEL API: Récupérer les informations d'accès
        getAllStayAccess(stayId)
.then(accessData => {
    console.log("Réponse API pour les accès:", accessData);
    if (accessData && accessData.status === 200 && Array.isArray(accessData.accesses)) {
        // Traiter les accès pour décoder les entités HTML - remarquez le changement de "access" à "accesses"
        const safeAccesses = accessData.accesses.map(access => ({
            ...access,
            category: access.category ? decodeHTML(access.category) : '',
            informations: access.informations ? decodeHTML(access.informations) : ''
        }));
        setAccessInfo(safeAccesses);
    } else {
        console.warn(`Format de réponse inattendu pour les accès du séjour ${stayId}:`, accessData);
        setAccessInfo([]);
    }
})
.catch(err => {
    console.error('Erreur lors de la récupération des informations d\'accès:', err);
    setAccessInfo([]);
});
        
        // Récupérer les étapes du séjour
        getStayStepByStayId(stayId)
        .then(stepsData => {
            if (stepsData && Array.isArray(stepsData.staySteps)) {
                const safeSteps = stepsData.staySteps.map(step => ({
                    ...step,
                    title: step.title ? decodeHTML(step.title) : '',
                    description: step.description ? decodeHTML(step.description) : ''
                }));
                
                // Trier les étapes par step_number
                safeSteps.sort((a, b) => (a.step_number || 0) - (b.step_number || 0));
                
                setStaySteps(safeSteps);
                
                // Récupérer les hébergements pour chaque étape
                const accommodationPromises = safeSteps.map(step => 
                    getAccommodationByStayStepId(step.id)
                        .then(accomData => {
                            if (accomData && accomData.accommodation) {
                                return { 
                                    stayStepId: step.id, 
                                    data: {
                                        ...accomData.accommodation,
                                        name: accomData.accommodation.name ? decodeHTML(accomData.accommodation.name) : '',
                                        description: accomData.accommodation.description ? decodeHTML(accomData.accommodation.description) : ''
                                    }
                                };
                            }
                            return { stayStepId: step.id, data: null };
                        })
                        .catch(err => {
                            console.error(`Erreur lors de la récupération de l'hébergement pour l'étape ${step.id}:`, err);
                            return { stayStepId: step.id, data: null };
                        })
                );
                
                // Attendre que tous les hébergements soient récupérés
                Promise.all(accommodationPromises)
                    .then(results => {
                        // Transformer le tableau de résultats en objet avec stayStepId comme clé
                        const accommodationsMap = {};
                        results.forEach(result => {
                            accommodationsMap[result.stayStepId] = result.data;
                        });
                        setAccommodations(accommodationsMap);
                    })
                    .catch(err => {
                        console.error('Erreur lors de la récupération des hébergements:', err);
                    });
            } else {
                console.warn(`Format de réponse inattendu pour les étapes du séjour ${stayId}:`, stepsData);
                setStaySteps([]);
            }
        })
        .catch(err => {
            console.error('Erreur lors de la récupération des étapes du séjour:', err);
            setStaySteps([]);
        })
        .finally(() => {
            setIsLoading(false);
        });      
    }, [currentStay, stayId]);

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
        <>
            <div className="stay-banner" 
            role="img"
            alt=""
            aria-label={`Image du séjour: ${currentStay.title}`}
            style={{ 
                backgroundImage: `url(${currentStay.image?.url || "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png"})` 
            }}>
            </div>
            
            <section className="stay-details-section">
                <header className="stay-details-header">
                    <h2 className="stay-details-header__title">{decodeHTML(currentStay.title)}</h2>
                    
                    <div className="stay-details-header__meta">
                        <span className="stay-details-header__location">📍 {currentStay.location || "Lieu non spécifié"}</span>
                        <span class="stay-details-header__duration">
                            ⏱️ {stayDuration ? `${stayDuration} jours` : "Durée non spécifiée"}
                        </span>
                        <span className="stay-details-header__price">💰 {currentStay.price || "?"} €</span>
                    </div>
                </header>

                {/* Afficher un indicateur de chargement si nécessaire */}
                {isLoading ? (
                    <p className="stay-content__loading">Chargement des informations...</p>
                ) : (
                    <article className="stay-content">
                        {/* Description complète - en haut sur toute la largeur */}
                        <section className="stay-content__full-description">
                            <h2 className="stay-content__title">Description</h2>
                            <p className="stay-content__text">
                                {decodeHTML(currentStay.description || "Aucune description disponible.")}
                            </p>
                        </section>

                        {/* 
                            SECTION POUR LES INFORMATIONS D'ACCÈS
                            À compléter une fois la structure de la réponse connue
                            Voici un exemple de structure qui pourra être ajustée :
                            
                            {accessInfo && (
                                <section className="stay-content__access">
                                    <h2 className="stay-content__title">Comment s'y rendre</h2>
                                    <div className="stay-content__access-info">
                                        La structure exacte dépendra de la réponse API.
                                        Par exemple :
                                        - Lieu de rendez-vous (accessInfo.location_name)
                                        - Adresse (accessInfo.address)
                                        - Heure de départ (accessInfo.departure_time)
                                        - Instructions (accessInfo.access_instructions)
                                        - Coordonnées GPS (accessInfo.coordinates)
                                    </div>
                                </section>
                            )}
                        */}

                        {/* Conteneur pour thèmes et points forts en 2 colonnes */}
                        <div className="stay-content__features">
                            {/* Thèmes associés */}
                            <section className="stay-themes">
                                <h2 className="stay-themes__title">Thématiques</h2>
                                <ul className="stay-themes__list">
                                    {themes.length > 0 ? 
                                        themes.map(theme => (
                                            <li key={theme.id} className="stay-themes__item">
                                                {theme.name}
                                            </li>
                                        )) : 
                                        <li className="stay-themes__no-data">Aucune thématique associée</li>
                                    }
                                </ul>
                            </section>

                            {/* Points forts */}
                            <section className="stay-content__highlights">
                                <h2 className="stay-content__highlights-title">Points forts</h2>
                                <ul className="stay-content__highlights-list">
                                    {highlights.length > 0 ? 
                                        highlights.map(highlight => (
                                            <li key={highlight.id} className="stay-content__highlights-item">
                                                {highlight.description}
                                            </li>
                                        )) : 
                                        <li className="stay-content__highlights-no-data">Aucun point fort spécifié</li>
                                    }
                                </ul>
                            </section>
                        </div>

                        {/* Utiliser le composant StaySteps */}
                        <StaySteps steps={staySteps} accommodations={accommodations} />

                        {/* Section d'accès après StaySteps et avant StayAdditionalInfo */}
                        {Array.isArray(accessInfo) && accessInfo.length > 0 && (
                            <section className="stay-content__access-section">
                                <h2 className="stay-content__title">Comment s'y rendre</h2>
                                <div className="stay-content__access-list">
                                    {accessInfo.map((access, index) => (
                                        <div key={access.id || index} className="stay-content__access-item">
                                            <div className="stay-content__access-category">
                                                <h3>{access.category}</h3>
                                            </div>
                                            <p className="stay-content__access-info">
                                                {access.informations}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Utiliser le composant StayAdditionalInfo */}
                        <StayAdditionalInfo stayId={stayId} />

                        <StayBooking stayId={stayId} />
                    </article>
                )}
            </section>
            
            <footer className="stay-details-footer">
                <Link to="/stays" className="stay-details__back-link">
                    Retour à la liste des séjours
                </Link>
            </footer>
        </>
    );
};

export default Test;