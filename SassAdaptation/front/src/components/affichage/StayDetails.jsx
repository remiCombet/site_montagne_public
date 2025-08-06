import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedStay } from '../../slices/staySlice';
// @ts-ignore
import { decodeHTML } from '../../utils/decodeHTML';


const StayDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // États
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isLoading, setIsLoading] = useState(false);
    
    // Récupération depuis le store Redux
    const selectedStay = useSelector((state) => state.stay.selectedStay);
    const staysInStore = useSelector((state) => state.stay.stays);
    
    // Utiliser selectedStay si l'ID correspond, sinon chercher dans staysInStore
    const stayId = parseInt(id);
    const stay = (selectedStay && selectedStay.id === stayId)
        ? selectedStay
        : staysInStore.find(s => s.id === stayId);
    
    // Calculer la durée du séjour en jours
    const calculateDuration = () => {
        if (!stay || !stay.start_date || !stay.end_date) {
            return "Non spécifiée";
        }
        
        const startDate = new Date(stay.start_date);
        const endDate = new Date(stay.end_date);
        
        // Différence en millisecondes
        const diffTime = Math.abs(endDate - startDate);
        
        // Convertir en jours (+ 1 car on compte le jour de départ et le jour d'arrivée)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        return diffDays;
    };
    
    // Calculer la durée
    const duration = calculateDuration();
    
    // Détecter le changement de taille d'écran
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Vérifier si le séjour existe
    if (!stay) {
        return (
            <div className="stay-details__error">
                <h2>Séjour non trouvé</h2>
                <button onClick={() => navigate('/stays')} className="button">
                    Retour à la liste des séjours
                </button>
            </div>
        );
    }

    return (
        <div className="stay-details">
            {/* Header commun pour mobile et desktop */}
            <header className="stay-details__header">
                <div className="stay-details__image-container">
                    <img 
                        src={stay.image?.url || "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png"}
                        alt={stay.image?.alt || stay.title}
                        className="stay-details__main-image"
                    />
                </div>
                
                <div className="stay-details__header-content">
                    <h1 className="stay-details__title">{decodeHTML(stay.title)}</h1>
                    
                    <div className="stay-details__meta">
                        <div className="stay-details__meta-item">
                            <span className="icon">📍</span> {decodeHTML(stay.location)}
                        </div>
                        <div className="stay-details__meta-item">
                            <span className="icon">⏱️</span> {duration} jours
                        </div>
                        <div className="stay-details__meta-item">
                            <span className="icon">👥</span> {stay.min_participant}-{stay.max_participant} personnes
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Bloc de réservation */}
            <div className="stay-details__booking">
                <div className="stay-details__price">
                    <span className="stay-details__price-value">{stay.price}€</span>
                    <span className="stay-details__price-person">par personne</span>
                </div>
                <Link to={`/booking/${stay.id}`} className="stay-details__book-button">
                    Réserver ce séjour
                </Link>
            </div>
            
            {/* Contenu différent selon le device */}
            {isMobile ? (
                // Mobile : Affichage simple
                <div className="stay-details__mobile-content">
                    <div className="stay-details__tab-content">
                        <div className="stay-details__description">
                            <div className="stay-details__text">
                                <h3>À propos de ce séjour</h3>
                                <p>{decodeHTML(stay.description)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Desktop : Affichage simple
                <div className="stay-details__desktop-content">
                    <div className="stay-details__main-column">
                        {/* Description */}
                        <section className="stay-details__section">
                            <h2 className="stay-details__section-title">À propos de ce séjour</h2>
                            <div className="stay-details__text">
                                <p>{decodeHTML(stay.description)}</p>
                            </div>
                        </section>
                    </div>
                    
                    <div className="stay-details__sidebar">
                        {/* Informations pratiques */}
                        <div className="stay-details__sidebar-section">
                            <h3>Informations pratiques</h3>
                            
                            <ul className="stay-details__info-list">
                                <li><strong>Durée:</strong> {duration} jours</li>
                                <li><strong>Dates:</strong> {new Date(stay.start_date).toLocaleDateString('fr-FR')} au {new Date(stay.end_date).toLocaleDateString('fr-FR')}</li>
                                <li><strong>Difficulté:</strong> {stay.physical_level}</li>
                                <li><strong>Technique:</strong> {stay.technical_level}</li>
                                <li><strong>Groupe:</strong> {stay.min_participant}-{stay.max_participant} personnes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Footer commun */}
            <div className="stay-details__footer">
                <h3>Vous avez des questions sur ce séjour ?</h3>
                <p>N'hésitez pas à nous contacter pour plus d'informations.</p>
                <Link to="/contact" className="stay-details__contact-button">
                    Nous contacter
                </Link>
            </div>
        </div>
    );
};

export default StayDetails;