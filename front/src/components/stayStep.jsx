import { useState } from 'react';
import AccommodationPopup from './accommodationPopup';

const StayStep = ({ staySteps }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [selectedAccommodation, setSelectedAccommodation] = useState(null);

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    const openAccommodationPopup = (accommodation) => {
        setSelectedAccommodation(accommodation);
    };

    const closeAccommodationPopup = () => {
        setSelectedAccommodation(null);
    };

    return (
        <div>
            <h3>Étapes du séjour</h3>

            {staySteps.length > 0 ? (
                <ul>
                    {staySteps.map((step, index) => (
                        <li key={step.id || index}>
                            <h4>Étape {index + 1}: {step.title}</h4>
                            {showDetails && (
                                <div>
                                    <p><strong>Description :</strong> {step.description}</p>
                                    <p><strong>Durée :</strong> {step.duration} heures</p>
                                    <p><strong>Dénivelé positif:</strong> {step.elevation_gain} mètres</p>
                                    <p><strong>Dénivelé négatif:</strong> {step.elevation_loss} mètres</p>

                                    {/* Lien cliquable pour ouvrir le popup */}
                                    {step.accommodation && (
                                        <p>
                                            <strong>
                                                <span 
                                                    style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                                                    onClick={() => openAccommodationPopup(step.accommodation)}
                                                >
                                                    {step.accommodation.name}
                                                </span>
                                            </strong>
                                        </p>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Aucune étape disponible pour ce séjour.</p>
            )}

            <button onClick={toggleDetails}>
                {showDetails ? 'Masquer les détails' : 'Voir les détails'}
            </button>

            {/* Affichage du popup avec le composant réutilisable */}
            <AccommodationPopup accommodation={selectedAccommodation} onClose={closeAccommodationPopup} />
        </div>
    );
};

export default StayStep;