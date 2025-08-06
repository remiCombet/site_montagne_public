import React, { useState, useEffect } from 'react';
// import StayDetails from './stayDetails';
import StayInfoTabs from './StayInfoTabs';
import StayImageTest from './stayImageTest';
import ThemeTest from './themeTest';
import HighlightTest from './highlightTest';
import StayStepTest from './stayStepTest';
import AccessTest from './accessTest';
import EquipmentsTest from './equipmentsTest';
// @ts-ignore
import { decodeHTML } from '../../utils/decodeHTML';

const StayCardTest = ({ stay, onSelect, selectedStay, onDeselect, isSelected, onMessage }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [isExpanded, setIsExpanded] = useState(false);
     
    // Surveiller si le séjour est sélectionné et déployer si nécessaire
    useEffect(() => {
        if (isSelected && !isExpanded) {
            setIsExpanded(true);
            console.log('la: ', onSelect, stay);
        } else if (!isSelected && isExpanded) {
            setIsExpanded(false);
        }
    }, [isSelected, isExpanded]);
    
    // Fonction simplifiée pour l'expansion/réduction combinée avec la sélection/désélection
    const toggleExpandAndSelect = () => {
        if (!isExpanded) {
            // Si la carte n'est pas déployée, on la sélectionne et la déploie
            onSelect && onSelect(stay);
        } else {
            // Si la carte est déployée, on la réduit ET on désélectionne
            setIsExpanded(false);
            onDeselect && onDeselect();
        }
    };
    
    // Changer d'onglet
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };
    
    // Fonction pour mettre à jour le séjour
    const handleStayUpdate = (updatedStay) => {
        if (onSelect && updatedStay) {
            onSelect(updatedStay);
        }
    };
    
    // Définition des onglets disponibles
    const tabs = [
        { id: 'info', label: 'Informations' },
        { id: 'image', label: 'Image' },
        { id: 'themes', label: 'Thèmes' },
        { id: 'highlights', label: 'Points forts' },
        { id: 'steps', label: 'Étapes' },
        { id: 'access', label: 'Accès' },
        { id: 'equipment', label: 'Équipements' }
    ];
    
    // Rendu du contenu de l'onglet actif
    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return <StayInfoTabs stay={stay} onUpdate={handleStayUpdate} onMessage={onMessage} />;
            case 'image':
                return <StayImageTest stay={stay} onUpdate={handleStayUpdate} onMessage={onMessage} />;
            case 'themes':
                return <ThemeTest stay={stay} onUpdate={handleStayUpdate} onMessage={onMessage} />;
            case 'highlights':
                return <HighlightTest stay={stay} onUpdate={handleStayUpdate} onMessage={onMessage} />;
            case 'steps':
                return <StayStepTest stay={stay} onUpdate={handleStayUpdate} onMessage={onMessage} />;
            case 'access':
                return <AccessTest stay={stay} onUpdate={handleStayUpdate} onMessage={onMessage} />;
            case 'equipment':
                return <EquipmentsTest stay={stay} onUpdate={handleStayUpdate} onMessage={onMessage} />;
            default:
                return <p>Onglet inconnu</p>;
        }
    };
    
    return (
        <article className={`stay-card ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}>
            <header className={`stay-card__header ${isExpanded ? 'stay-card__header--expanded' : ''}`}>
                <figure className="stay-card__image-container">
                    <img 
                        src={stay.image?.url || "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png"} 
                        alt={stay.image?.alt || stay.title || "Image par défaut"}
                        className="stay-card__image"
                    />
                </figure>
                <hgroup className="stay-card__title-group">
                    <h3 className="stay-card__title">{decodeHTML(stay.title)}</h3>
                    <aside className="stay-card__meta">
                        {stay.location && (
                            <p className="stay-card__location">📍 {decodeHTML(stay.location)}</p>
                        )}
                        <p className="stay-card__duration">⏱️ {stay.duration} jours</p>
                    </aside>
                </hgroup>
            </header>
    
            {!isExpanded ? (
                <>
                    <section className="stay-card__body">
                        <p className="stay-card__description">
                            {decodeHTML(stay.description)}
                        </p>
                    </section>
                    
                    <footer className="stay-card__actions">
                        <button 
                            className="stay-card__button stay-card__button--edit"
                            onClick={toggleExpandAndSelect}
                            aria-expanded={isExpanded}
                        >
                            Gérer
                        </button>
                    </footer>
                </>
            ) : (
                <>
                    <nav className="stay-card__tabs" aria-label="Onglets du séjour">
                        {tabs.map(tab => (
                            <button 
                                key={tab.id}
                                className={`stay-card__tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => handleTabChange(tab.id)}
                                aria-selected={activeTab === tab.id}
                                role="tab"
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                    
                    <section className="stay-card__content" role="tabpanel">
                        {renderTabContent()}
                    </section>
                    
                    <footer className="stay-card__actions">
                        <button 
                            className="stay-card__button stay-card__button--close"
                            onClick={toggleExpandAndSelect}
                        >
                            Fermer
                        </button>
                    </footer>
                </>
            )}
        </article>
    );
};

export default StayCardTest;

// save return 
// return (
//     <article className={`stay-card ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}>
//         {!isExpanded ? (
//             // Vue réduite (fermée)
//             <>
//                 <header className="stay-card__header">
//                     <figure className="stay-thumbnail">
//                         <img 
//                             src={stay.image?.url || "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png"} 
//                             alt={stay.image?.alt || stay.title || "Image par défaut"}
//                         />
//                     </figure>
//                     <h3 className="stay-card__title">{decodeHTML(stay.title)}</h3>
//                 </header>
//                 <section className="stay-card__actions">
//                     <button 
//                         className="stay-card__toggle"
//                         onClick={toggleExpandAndSelect}
//                         aria-expanded={isExpanded}
//                     >
//                         Gérer
//                     </button>
//                 </section>
//             </>   
//         ) : (
//             // Vue étendue (ouverte)
//             <>
//                 <header className="stay-card__header stay-card__header--expanded">
//                     <figure className="stay-thumbnail">
//                         <img 
//                             src={stay.image?.url || "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png"} 
//                             alt={stay.image?.alt || stay.title || "Image par défaut"}
//                         />
//                     </figure>
//                     <h3 className="stay-card__title">{decodeHTML(stay.title)}</h3>
//                 </header>

//                 <section className="stay-card__expanded">
//                     <nav className="stay-card__tabs" aria-label="Onglets du séjour">
//                         {tabs.map(tab => (
//                             <button 
//                                 key={tab.id}
//                                 className={activeTab === tab.id ? 'active' : ''}
//                                 onClick={() => handleTabChange(tab.id)}
//                                 aria-selected={activeTab === tab.id}
//                                 role="tab"
//                             >
//                                 {tab.label}
//                             </button>
//                         ))}
//                     </nav>
                    
//                     <main className="stay-card__content" role="tabpanel">
//                         {renderTabContent()}
//                     </main>
                    
//                     <footer className="stay-card__footer">
//                         <button 
//                             className="stay-card__close"
//                             onClick={toggleExpandAndSelect}
//                         >
//                             Fermer
//                         </button>
//                     </footer>
//                 </section>
//             </>
//         )}
//     </article>
// );