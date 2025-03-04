import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import StayDetails from './stayDetails';
import StayEditPopupTest from './stayEditPopupTest';
import ThemeTest from './themeTest';
import HighlightTest from './highlightTest';
import StayStepTest from './stayStepTest';
import AccessTest from './accessTest';
import EquipmentsTest from './equipmentsTest';
import { decodeHTML } from '../../utils/decodeHtml';

const StayCardTest = ({ stay, onSelect, selectedStay, onDeselect }) => {
    // popup pour la modification d'un séjour
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // popup pour la gestion des themes d'un séjour
    const [isPopupThemeOpen, setIsPopupThemeOpen] = useState(false);

    // popup pour la gestion des points fors d'un séjour
    const [isPopupHighlightOpen, setIsPopupHighlightOpen] = useState(false);

    // popup pour la gestion des étapes d'un séjour
    const [isPopupStayStepOpen, setIsPopupStayStepOpen] = useState(false);

    // popup pour la gestion des acces d'un séjour
    const [isPopupAccessOpen, setIsPopupAccessOpen] = useState(false);

    // popup pour la gestion des equipements fournis d'un séjour
    const [isPopupEquipmentOpen, setIsPopupEquipmentOpen] = useState(false);

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    // Fonction de formatage destinée à l'affichage des dates
    const formatViewDate = (date) => {
        return format(new Date(date), 'dd-MM-yyyy');
    };

    // gestion de la sélection du séjour
    const handleSelectStay = () => {
        onSelect(stay);
        setIsPopupOpen(true);
    };

    // gestion de la désélection du séjour
    const handleDeselectStay = () => {
        onDeselect();
        setIsPopupOpen(false);
    };

    const isSelected = selectedStay && selectedStay.id === stay.id;

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: ""});
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <article className={isSelected ? 'selected' : ''}>
            <section>
                <p>ta</p>
                {decodeHTML(stay.title)}
                <br />
                {/* Bouton pour ouvrir/fermer le popup */}
                <button onClick={handleSelectStay}>
                    {isSelected ? 'Désélectionner' : 'Voir les infos du séjour'}
                </button>
            </section>

            {/* affichage du popup */}
            {isPopupOpen && (
                <StayEditPopupTest 
                    stay={stay}
                    onClose={handleDeselectStay}
                />
            )}

            {/* Gestion des thèmes */}
            <section>
                <button onClick={() => setIsPopupThemeOpen(true)}>
                    Gérer les thèmes
                </button>
            </section>

            {/* Affichage du popup des thèmes */}
            {isPopupThemeOpen && (
                <ThemeTest 
                    stay={stay}
                    onClose={() => setIsPopupThemeOpen(false)}
                />
            )}

            {/* Gestion des highlights */}
            <section>
                <button onClick={() => setIsPopupHighlightOpen(true)}>
                    Gérer les points positifs
                </button>
            </section>

            {/* Affichage du popup des points positifs */}
            {isPopupHighlightOpen && (
                <HighlightTest
                    stay={stay}
                    onClose={() => setIsPopupHighlightOpen(false)}
                />
            )}

            {/* Gestion des étapes */}
            <section>
                <button onClick={() => setIsPopupStayStepOpen(true)}>
                    Gérer les étapes
                </button>
            </section>

            {/* Affichage du popup des étapes */}
            {isPopupStayStepOpen && (
                <StayStepTest
                    stay={stay}
                    onClose={() => setIsPopupStayStepOpen(false)}
                />
            )}

            {/* Gestion des acces */}
            <section>
                <button onClick={() => setIsPopupAccessOpen(true)}>
                    Gérer les acces
                </button>
            </section>

            {/* affichage du popup */}
            {isPopupAccessOpen && (
                <AccessTest 
                    stay={stay}
                    onClose={() => setIsPopupAccessOpen(false)}
                />
            )}

            {/* Gestion des acces */}
            <section>
                <button onClick={() => setIsPopupEquipmentOpen(true)}>
                    Gérer les équipement fournis
                </button>
            </section>

            {/* affichage du popup */}
            {isPopupEquipmentOpen && (
                <EquipmentsTest 
                    stay={stay}
                    onClose={() => setIsPopupEquipmentOpen(false)}
                />
            )}

        </article>
    );
};

export default StayCardTest;