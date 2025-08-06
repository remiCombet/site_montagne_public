// import { useState, useEffect } from 'react';
// import { format } from 'date-fns';
// import StayDetails from './stayDetails';
// import StayEditPopupTest from './stayEditPopupTest';
// import ThemeTest from './themeTest';
// import HighlightTest from './highlightTest';
// import StayStepTest from './stayStepTest';
// import AccessTest from './accessTest';
// import EquipmentsTest from './equipmentsTest';
// import StayImageTest from './stayImageTest';
// import { decodeHTML } from '../../utils/decodeHtml';

// const StayCardTest = ({ stay, onSelect, selectedStay, onDeselect }) => {

//     // popup pour la modification d'un séjour
//     const [isPopupOpen, setIsPopupOpen] = useState(false);

//     // popup pour la gestion des themes d'un séjour
//     const [isPopupThemeOpen, setIsPopupThemeOpen] = useState(false);

//     // popup pour la gestion des points fors d'un séjour
//     const [isPopupHighlightOpen, setIsPopupHighlightOpen] = useState(false);

//     // popup pour la gestion des étapes d'un séjour
//     const [isPopupStayStepOpen, setIsPopupStayStepOpen] = useState(false);

//     // popup pour la gestion des acces d'un séjour
//     const [isPopupAccessOpen, setIsPopupAccessOpen] = useState(false);

//     // popup pour la gestion des equipements fournis d'un séjour
//     const [isPopupEquipmentOpen, setIsPopupEquipmentOpen] = useState(false);

//     // popup pour la gestion de l'image d'un séjour
//     const [isPopupImageOpen, setIsPopupImageOpen] = useState(false);

//     // Gestion des erreurs/validation
//     const [message, setMessage] = useState({ type: "", text: "" });

//     // Fonction de formatage destinée à l'affichage des dates
//     const formatViewDate = (date) => {
//         return format(new Date(date), 'dd-MM-yyyy');
//     };

//     // gestion de la sélection du séjour
//     const handleSelectStay = () => {
//         onSelect(stay);
//         setIsPopupOpen(true);
//     };

//     // gestion de la désélection du séjour
//     const handleDeselectStay = () => {
//         onDeselect();
//         setIsPopupOpen(false);
//     };

//     const isSelected = selectedStay && selectedStay.id === stay.id;

//     useEffect(() => {
//         if (message.text) {
//             const timer = setTimeout(() => {
//                 setMessage({ type: "", text: ""});
//             }, 1500);

//             return () => clearTimeout(timer);
//         }
//     }, [message]);

//     return (
//         <article className={isSelected ? 'selected' : ''}>
//             <section>
//                 {/* Afficher l'image miniature si elle existe */}
//                 {stay.image && (Object.keys(stay.image).length > 0 ? (
//                     <div className="stay-thumbnail">
//                         <img 
//                             src={stay.image.url} 
//                             alt={stay.image.alt || stay.title} 
//                             style={{ maxWidth: '100px', height: 'auto' }}
//                         />
//                     </div>
//                 ) : (
//                     <div className="stay-thumbnail">
//                         <img 
//                             src="https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png" 
//                             alt="Image par défaut"
//                             style={{ maxWidth: '100px', height: 'auto' }}
//                         />
//                     </div>
//                 ))}

//                 {decodeHTML(stay.title)}
//                 <br />
//                 {/* Bouton pour ouvrir/fermer le popup */}
//                 <button onClick={handleSelectStay}>
//                     {isSelected ? 'Désélectionner' : 'Voir les infos du séjour'}
//                 </button>
//             </section>

//             {/* affichage du popup */}
//             {isPopupOpen && (
//                 <StayEditPopupTest 
//                     stay={stay}
//                     onClose={handleDeselectStay}
//                 />
//             )}

//             {/* Gestion de l'image du séjour */}
//             <section>
//                 <button onClick={() => {
//                     onSelect(stay);
//                     setIsPopupImageOpen(true);
//                 }}>
//                     Gérer l'image
//                 </button>
//             </section>

//             {/* Affichage du popup de gestion d'image */}
//             {isPopupImageOpen && (
//                 <StayImageTest 
//                     stay={selectedStay || stay}
//                     onClose={() => {
//                         setIsPopupImageOpen(false);
//                         onDeselect();
//                     }}
//                     onUpdate={onSelect}
//                 />
//             )}

//             {/* Gestion des thèmes */}
//             <section>
//                 <button onClick={() => setIsPopupThemeOpen(true)}>
//                     Gérer les thèmes
//                 </button>
//             </section>

//             {/* Affichage du popup des thèmes */}
//             {isPopupThemeOpen && (
//                 <ThemeTest 
//                     stay={stay}
//                     onClose={() => setIsPopupThemeOpen(false)}
//                 />
//             )}

//             {/* Gestion des highlights */}
//             <section>
//                 <button onClick={() => setIsPopupHighlightOpen(true)}>
//                     Gérer les points positifs
//                 </button>
//             </section>

//             {/* Affichage du popup des points positifs */}
//             {isPopupHighlightOpen && (
//                 <HighlightTest
//                     stay={stay}
//                     onClose={() => setIsPopupHighlightOpen(false)}
//                 />
//             )}

//             {/* Gestion des étapes */}
//             <section>
//                 <button onClick={() => setIsPopupStayStepOpen(true)}>
//                     Gérer les étapes
//                 </button>
//             </section>

//             {/* Affichage du popup des étapes */}
//             {isPopupStayStepOpen && (
//                 <StayStepTest
//                     stay={stay}
//                     onClose={() => setIsPopupStayStepOpen(false)}
//                 />
//             )}

//             {/* Gestion des acces */}
//             <section>
//                 <button onClick={() => setIsPopupAccessOpen(true)}>
//                     Gérer les acces
//                 </button>
//             </section>

//             {/* affichage du popup */}
//             {isPopupAccessOpen && (
//                 <AccessTest 
//                     stay={stay}
//                     onClose={() => setIsPopupAccessOpen(false)}
//                 />
//             )}

//             {/* Gestion des acces */}
//             <section>
//                 <button onClick={() => setIsPopupEquipmentOpen(true)}>
//                     Gérer les équipement fournis
//                 </button>
//             </section>

//             {/* affichage du popup */}
//             {isPopupEquipmentOpen && (
//                 <EquipmentsTest 
//                     stay={stay}
//                     onClose={() => setIsPopupEquipmentOpen(false)}
//                 />
//             )}

//         </article>
//     );
// };

// export default StayCardTest;

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import StayEditPopupTest from './stayEditPopupTest';
import ThemeTest from './themeTest';
import HighlightTest from './highlightTest';
import StayStepTest from './stayStepTest';
import AccessTest from './accessTest';
import EquipmentsTest from './equipmentsTest';
import StayImageTest from './stayImageTest';
import { decodeHTML, deepDecodeHTML } from '../../utils/decodeHtml';

// appel api ici ? 
import { getHighlightsByStayId } from '../../api/publicApi';
import { getAllThemesByStayid } from "../../api/publicApi";
import { getStayStepByStayId } from "../../api/publicApi";
import { getAllStayAccess } from '../../api/publicApi';
import { getStayEquipmentsByStayId, getStayToPrepareByStayId } from '../../api/publicApi';
import { getAllCategories } from '../../api/admin/category';

const StayCardTest = ({ stay, onSelect, selectedStay, onDeselect }) => {
    // État actuel de l'interface
    const [activeTab, setActiveTab] = useState('info'); // Onglet actif par défaut
    const [isExpanded, setIsExpanded] = useState(false); // État développé ou non

    // récupération du stayId
    const stayId = stay.id;

    // gestion des thèmes d'un séjour
    const [stayThemes, setStayThemes] = useState([]);

    // gestion des points forts d'un séjour
    const [stayHighlights, setStayHighlights] = useState([]);

    // gestion des étapes et des logements d'un séjour
    const [staySteps, setStaySteps] = useState([]);

    // gestion des accès d'un séjour
    const [stayAccesses, setStayAccesses] = useState([]);

    // gestion des équipements d'un séjour à prévoir
    const [equipmentsToPrepare, setEquipmentsToPrepare] = useState([]);

    // gestion des équipements d'un séjour fournis
    const [equipmentsProvided, setEquipmentsProvided] = useState([]);

    // gestion des catégories (table qui recense les équipements à prévoir et fournis)
    const [allCategories, setAllCategories] = useState([]);

    // État des étapes développées
    const [expandedStepIds, setExpandedStepIds] = useState([]);

    // État de chargement pour chaque onglet
    const [loading, setLoading] = useState({
        highlights: false,
        themes: false,
        steps: false,
        accesses: false,
        equipments: false
    });
    
    // État pour suivre les onglets dont les données ont été chargées
    const [dataLoaded, setDataLoaded] = useState({
        highlights: false,
        themes: false,
        steps: false,
        accesses: false,
        equipments: false
    });
    
    // États pour les popups
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
    const [isThemePopupOpen, setIsThemePopupOpen] = useState(false);
    const [isHighlightPopupOpen, setIsHighlightPopupOpen] = useState(false);
    const [isStepPopupOpen, setIsStepPopupOpen] = useState(false);
    const [isAccessPopupOpen, setIsAccessPopupOpen] = useState(false);
    const [isEquipmentPopupOpen, setIsEquipmentPopupOpen] = useState(false);

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    // Vérifier si ce séjour est actuellement sélectionné
    const isSelected = selectedStay && selectedStay.id === stay.id;

    // Fonction pour charger les données d'un onglet spécifique
    const loadTabData = (tabName) => {
        // Si les données sont déjà chargées ou en cours de chargement, ne rien faire
        if (dataLoaded[tabName] || loading[tabName] || !stayId) return;
        
        // Marquer l'onglet comme en cours de chargement
        setLoading(prev => ({ ...prev, [tabName]: true }));
        
        switch(tabName) {
            case 'highlights':
                getHighlightsByStayId(stayId)
                    .then((res) => {
                        if (res.status === 200) {
                            setStayHighlights(res.highlights || []);
                        } else {
                            throw new Error("Erreur lors du chargement des points positifs.");
                        }
                    })
                    .catch((err) => {
                        setMessage({ 
                            type: "error", 
                            text: "Impossible de récupérer les points forts." 
                        });
                        console.error(err);
                    })
                    .finally(() => {
                        setLoading(prev => ({ ...prev, highlights: false }));
                        setDataLoaded(prev => ({ ...prev, highlights: true }));
                    });
                break;
                
            case 'themes':
                getAllThemesByStayid(stayId)
                    .then((res) => {
                        setStayThemes(res.themes || []);
                    })
                    .catch((err) => {
                        setMessage({ 
                            type: "error", 
                            text: "Impossible de récupérer les thèmes." 
                        });
                        console.error(err);
                    })
                    .finally(() => {
                        setLoading(prev => ({ ...prev, themes: false }));
                        setDataLoaded(prev => ({ ...prev, themes: true }));
                    });
                break;
                
            case 'steps':
                getStayStepByStayId(stayId)
                    .then((res) => {
                        if (res.status === 200) {
                            setStaySteps(res.staySteps || []);
                        } else {
                            setStaySteps([]);
                            console.log("Aucune étape trouvée pour ce séjour");
                        }
                    })
                    .catch((err) => {
                        setMessage({ 
                            type: "error", 
                            text: "Impossible de récupérer les étapes." 
                        });
                        console.error("Erreur lors de la récupération des étapes:", err);
                        setStaySteps([]);
                    })
                    .finally(() => {
                        setLoading(prev => ({ ...prev, steps: false }));
                        setDataLoaded(prev => ({ ...prev, steps: true }));
                    });
                break;
                
            case 'access':
                getAllStayAccess(stayId)
                    .then((res) => {
                        setStayAccesses(res.accesses || []);
                    })
                    .catch((err) => {
                        setMessage({ 
                            type: "error", 
                            text: "Erreur lors de la récupération des accès du séjour." 
                        });
                        console.error(err);
                    })
                    .finally(() => {
                        setLoading(prev => ({ ...prev, accesses: false }));
                        setDataLoaded(prev => ({ ...prev, accesses: true }));
                    });
                break;
                
            case 'equipment':
                // Utiliser Promise.all pour optimiser les appels API
                Promise.all([
                    getStayEquipmentsByStayId(stayId),
                    getStayToPrepareByStayId(stayId),
                    getAllCategories()
                ])
                .then(([providedRes, toPrepareRes, categoriesRes]) => {
                    if (providedRes?.status === 200) {
                        console.log(providedRes);
                        setEquipmentsProvided(providedRes.equipments || []);
                    } else {
                        setEquipmentsProvided([]);
                    }
                    
                    if (toPrepareRes?.status === 200) {
                        console.log(toPrepareRes);
                        setEquipmentsToPrepare(toPrepareRes.equipments || []);
                    } else {
                        setEquipmentsToPrepare([]);
                    }
                    
                    if (categoriesRes?.status === 200) {
                        console.log(categoriesRes);
                        setAllCategories(categoriesRes.category || []);
                    } else {
                        setAllCategories([]);
                    }
                })
                .catch((err) => {
                    setMessage({ 
                        type: "error", 
                        text: "Impossible de récupérer les équipements." 
                    });
                    console.error(err);
                })
                .finally(() => {
                    setLoading(prev => ({ ...prev, equipments: false }));
                    setDataLoaded(prev => ({ ...prev, equipments: true }));
                });
                break;
                
            default:
                break;
        }
    };

    // Basculer l'expansion de la carte
    const toggleExpand = () => {
        if (!isExpanded) {
            onSelect(stay);
        } else {
            onDeselect();
        }
        setIsExpanded(!isExpanded);
    };

    // basculer l'expansion des informations d'étapes
    const toggleStepExpansion = (stepId) => {
        setExpandedStepIds(prevIds => 
            prevIds.includes(stepId)
                ? prevIds.filter(id => id !== stepId)
                : [...prevIds, stepId]
        );
    };

    // Changer d'onglet
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (!isExpanded) {
            setIsExpanded(true);
            onSelect(stay);
        }
        loadTabData(tab);
    };

    // Fermer tous les panneaux
    const handleClose = () => {
        setIsExpanded(false);
        setActiveTab('info');
        onDeselect();
    };

    // Gestion du message d'erreur ou de succès
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: ""});
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [message]);

    // Réinitialiser le statut des données chargées quand le séjour change
    useEffect(() => {
        setDataLoaded({
            highlights: false,
            themes: false,
            steps: false,
            accesses: false,
            equipments: false
        });
    }, [stayId]);

    // Chargement des données quand la carte est développée
    useEffect(() => {
        if (isExpanded && activeTab !== 'info' && activeTab !== 'image') {
            loadTabData(activeTab);
        }
    }, [isExpanded, activeTab]);

    // Ajoutez cet effet pour recharger automatiquement les données quand l'état dataLoaded.equipments change
    useEffect(() => {
        // Si on est sur l'onglet equipments et que les données doivent être rechargées
        if (activeTab === 'equipment' && !dataLoaded.equipments && !loading.equipments) {
            console.log("Déclenchement du rechargement via useEffect");
            // Appeler l'API pour recharger les données
            Promise.all([
                getStayEquipmentsByStayId(stayId),
                getStayToPrepareByStayId(stayId),
                getAllCategories()
            ])
            .then(([providedRes, toPrepareRes, categoriesRes]) => {
                console.log("Rechargement automatique réussi");
                
                if (providedRes?.status === 200) {
                    setEquipmentsProvided(providedRes.equipments || []);
                } else {
                    setEquipmentsProvided([]);
                }
                
                if (toPrepareRes?.status === 200) {
                    setEquipmentsToPrepare(toPrepareRes.equipments || []);
                } else {
                    setEquipmentsToPrepare([]);
                }
                
                if (categoriesRes?.status === 200) {
                    setAllCategories(categoriesRes.category || []);
                } else {
                    setAllCategories([]);
                }
                
                // Marquer comme chargé
                setDataLoaded(prev => ({ ...prev, equipments: true }));
            })
            .catch(err => {
                console.error("Erreur rechargement automatique:", err);
                setMessage({ 
                    type: "error", 
                    text: "Erreur lors du rechargement des équipements" 
                });
            })
            .finally(() => {
                setLoading(prev => ({ ...prev, equipments: false }));
            });
        }
    }, [dataLoaded.equipments, activeTab, stayId]);

    // Rendu du contenu en fonction de l'onglet actif
    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <div className="stay-info-tab">
                        <h3>{deepDecodeHTML(stay.title)}</h3>
                        
                        <div className="stay-details">
                            <p><strong>Localisation:</strong> {stay.location}</p>
                            <p><strong>Prix:</strong> {stay.price}€</p>
                            <p><strong>Niveau technique:</strong> {stay.technical_level}</p>
                            <p><strong>Niveau physique:</strong> {stay.physical_level}</p>
                            <p><strong>Dates:</strong> {format(new Date(stay.start_date), 'dd/MM/yyyy')} - {format(new Date(stay.end_date), 'dd/MM/yyyy')}</p>
                            <p><strong>Participants:</strong> {stay.min_participant} - {stay.max_participant}</p>
                        </div>
                        
                        <div className="stay-description">
                            <h4>Description</h4>
                            <p>{deepDecodeHTML(stay.description)}</p>
                        </div>
                        
                        <button 
                            className="edit-button" 
                            onClick={() => setIsEditPopupOpen(true)}
                        >
                            Modifier les informations
                        </button>
                    </div>
                );
                
            case 'image':
                return (
                    <div className="stay-image-tab">
                        <h3>Image du séjour</h3>
                        
                        <div className="stay-image-preview">
                            <img 
                                src={stay.image?.url || "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png"} 
                                alt={stay.image?.alt || "Image par défaut"}
                                className="preview-image"
                            />
                        </div>
                        
                        <button 
                            className="edit-button" 
                            onClick={() => setIsImagePopupOpen(true)}
                        >
                            Gérer l'image
                        </button>
                    </div>
                );
                
            case 'themes':
                return (
                    <div className="stay-theme-tab">
                        <h3>Thèmes du séjour</h3>
                        
                        {loading.themes ? (
                            <div className="loading">Chargement des thèmes...</div>
                        ) : (
                            <ul className="theme-list">
                                {stayThemes && stayThemes.length > 0 ? (
                                    stayThemes.map(theme => (
                                        <li key={theme.id} className="theme-item">
                                            {theme.name}
                                        </li>
                                    ))
                                ) : (
                                    <li className="no-items">Aucun thème défini</li>
                                )}
                            </ul>
                        )}
                        
                        <button 
                            className="edit-button" 
                            onClick={() => setIsThemePopupOpen(true)}
                            disabled={loading.themes}
                        >
                            Gérer les thèmes
                        </button>
                    </div>
                );
                
            case 'highlights':
                return (
                    <div className="stay-highlight-tab">
                        <h3>Points forts du séjour</h3>
                        
                        {loading.highlights ? (
                            <div className="loading">Chargement des points forts...</div>
                        ) : (
                            <ul className="highlight-list">
                                {stayHighlights && stayHighlights.length > 0 ? (
                                    stayHighlights.map(highlight => (
                                        <li key={highlight.id} className="highlight-item">
                                            {highlight.title}
                                        </li>
                                    ))
                                ) : (
                                    <li className="no-items">Aucun point fort défini</li>
                                )}
                            </ul>
                        )}
                        
                        <button 
                            className="edit-button" 
                            onClick={() => setIsHighlightPopupOpen(true)}
                            disabled={loading.highlights}
                        >
                            Gérer les points forts
                        </button>
                    </div>
                );
                
            case 'steps':
                return (
                    <div className="stay-steps-tab">
                        <h3>Étapes du séjour</h3>
                        
                        {loading.steps ? (
                            <div className="loading">Chargement des étapes...</div>
                        ) : (
                            <ul className="step-list">
                                {staySteps && staySteps.length > 0 ? (
                                    staySteps.map(step => (
                                        <li key={step.id} className={`step-item ${expandedStepIds.includes(step.id) ? 'expanded' : ''}`}>
                                            <div 
                                                className="step-header"
                                                onClick={() => toggleStepExpansion(step.id)}
                                            >
                                                <span className="step-day">Jour {step.step_number}</span>
                                                <span className="step-title">{step.title}</span>
                                                <button 
                                                    className="expansion-button"
                                                    aria-label={expandedStepIds.includes(step.id) ? "Réduire l'étape" : "Développer l'étape"}
                                                >
                                                    {expandedStepIds.includes(step.id) ? '▼' : '▶'}
                                                </button>
                                            </div>
                                            
                                            {expandedStepIds.includes(step.id) && (
                                                <div className="step-expanded-content">
                                                    <div className="step-details">
                                                        <p className="step-description">{step.description}</p>
                                                        <div className="step-metrics">
                                                            <span><strong>Durée :</strong> {step.duration}h</span>
                                                            <span><strong>Dénivelé + :</strong> {step.elevation_gain}m</span>
                                                            <span><strong>Dénivelé - :</strong> {step.elevation_loss}m</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {step.accommodation && (
                                                        <div className="step-accommodation">
                                                            <h4>Hébergement</h4>
                                                            <p><strong>Nom :</strong> {step.accommodation.name}</p>
                                                            <p><strong>Description :</strong> {step.accommodation.description}</p>
                                                            <p><strong>Repas :</strong> {step.accommodation.meal_type}</p>
                                                            <p><strong>Détails repas :</strong> {step.accommodation.meal_description}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li className="no-items">Aucune étape définie</li>
                                )}
                            </ul>
                        )}
                        
                        <button 
                            className="edit-button" 
                            onClick={() => setIsStepPopupOpen(true)}
                            disabled={loading.steps}
                        >
                            Gérer les étapes
                        </button>
                    </div>
                );
                
            case 'access':
                return (
                    <div className="stay-access-tab">
                        <h3>Accès au séjour</h3>
                        
                        {loading.accesses ? (
                            <div className="loading">Chargement des accès...</div>
                        ) : (
                            <ul className="access-list">
                                {stayAccesses && stayAccesses.length > 0 ? (
                                   stayAccesses.map(access => (
                                        <li key={access.id} className="access-item">
                                            {access.category}: {access.informations}
                                        </li>
                                    ))
                                ) : (
                                    <li className="no-items">Aucun accès défini</li>
                                )}
                            </ul>
                        )}
                        
                        <button 
                            className="edit-button" 
                            onClick={() => setIsAccessPopupOpen(true)}
                            disabled={loading.accesses}
                        >
                            Gérer les accès
                        </button>
                    </div>
                );
                
                case 'equipment':
                    // Fonction pour normaliser les noms de catégories (ignorer les accents, casse, etc.)
                    const normalizeCategory = (category) => {
                        return category.toLowerCase()
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Supprime les accents
                    };

                    // Fonction pour regrouper les équipements par catégorie normalisée
                    const regroupEquipmentsByCategory = (equipments) => {
                        const groupedEquipments = {};
                        
                        equipments.forEach(categoryGroup => {
                            const normalizedCategory = normalizeCategory(categoryGroup.category);
                            const displayCategory = categoryGroup.category; // Garder l'affichage d'origine
                            
                            if (!groupedEquipments[normalizedCategory]) {
                                groupedEquipments[normalizedCategory] = {
                                    category: displayCategory, // Utiliser la première occurrence pour l'affichage
                                    items: []
                                };
                            }
                            
                            // Ajouter tous les items de cette catégorie au groupe existant
                            categoryGroup.items.forEach(item => {
                                groupedEquipments[normalizedCategory].items.push(item);
                            });
                        });
                        
                        // Convertir l'objet en tableau pour le rendu
                        return Object.values(groupedEquipments);
                    };
                    
                    // Regrouper les équipements
                    const groupedProvidedEquipments = regroupEquipmentsByCategory(equipmentsProvided);
                    const groupedToPrepareEquipments = regroupEquipmentsByCategory(equipmentsToPrepare);
                    
                    return (
                        <div className="stay-equipment-tab">
                            <h3>Équipements</h3>
                            
                            {loading.equipments ? (
                                <div className="loading">Chargement des équipements...</div>
                            ) : (
                                <div className="equipment-sections">
                                    {/* ÉQUIPEMENTS FOURNIS */}
                                    <div key="provided" className="equipment-section">
                                        <h4>Équipements fournis</h4>
                                        {groupedProvidedEquipments.length > 0 ? (
                                            groupedProvidedEquipments.map((categoryGroup, index) => (
                                                <div key={`provided-cat-${index}`} className="equipment-category">
                                                    <h5>{categoryGroup.category}</h5>
                                                    <ul className="equipment-list">
                                                        {categoryGroup.items.map((item, itemIndex) => (
                                                            <li key={`provided-item-${index}-${itemIndex}`} className="equipment-item">
                                                                <span className="equipment-name">{item.category.name}</span>
                                                                {item.category.description && (
                                                                    <span className="equipment-description"> - {item.category.description}</span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-items">Aucun équipement fourni</p>
                                        )}
                                    </div>
                                    
                                    {/* ÉQUIPEMENTS À PRÉVOIR */}
                                    <div key="to-prepare" className="equipment-section">
                                        <h4>Équipements à prévoir</h4>
                                        {groupedToPrepareEquipments.length > 0 ? (
                                            groupedToPrepareEquipments.map((categoryGroup, index) => (
                                                <div key={`prepare-cat-${index}`} className="equipment-category">
                                                    <h5>{categoryGroup.category}</h5>
                                                    <ul className="equipment-list">
                                                        {categoryGroup.items.map((item, itemIndex) => (
                                                            <li key={`prepare-item-${index}-${itemIndex}`} className="equipment-item">
                                                                <span className="equipment-name">{item.category.name}</span>
                                                                {item.category.description && (
                                                                    <span className="equipment-description"> - {item.category.description}</span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-items">Aucun équipement à prévoir</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <button 
                                className="edit-button" 
                                onClick={() => setIsEquipmentPopupOpen(true)}
                                disabled={loading.equipments}
                            >
                                Gérer les équipements
                            </button>
                        </div>
                    );
                
            default:
                return null;
        }
    };

    return (
        <article className={`stay-card ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}>
            {/* En-tête de la carte - toujours visible */}
            <header className="stay-card__header">
                <div className="stay-thumbnail">
                    <img 
                        src={stay.image?.url || "https://res.cloudinary.com/dpa2kakxx/image/upload/v1741274688/site_montagne_v3/montagneDessin_vcxgkc.png"} 
                        alt={stay.image?.alt || stay.title || "Image par défaut"}
                    />
                </div>
                <div className="stay-card__title">
                    <h3>{decodeHTML(stay.title)}</h3>
                </div>
                <button 
                    className="stay-card__toggle"
                    onClick={toggleExpand}
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? 'Réduire' : 'Gérer'}
                </button>
            </header>

            {/* Panneau développé - visible uniquement si développé */}
            {isExpanded && (
                <div className="stay-card__expanded">
                    {/* Onglets de navigation */}
                    <nav className="stay-card__tabs">
                        <button 
                            className={activeTab === 'info' ? 'active' : ''} 
                            onClick={() => handleTabChange('info')}
                        >
                            Informations
                        </button>
                        <button 
                            className={activeTab === 'image' ? 'active' : ''} 
                            onClick={() => handleTabChange('image')}
                        >
                            Image
                        </button>
                        <button 
                            className={activeTab === 'themes' ? 'active' : ''} 
                            onClick={() => handleTabChange('themes')}
                        >
                            Thèmes
                        </button>
                        <button 
                            className={activeTab === 'highlights' ? 'active' : ''} 
                            onClick={() => handleTabChange('highlights')}
                        >
                            Points forts
                        </button>
                        <button 
                            className={activeTab === 'steps' ? 'active' : ''} 
                            onClick={() => handleTabChange('steps')}
                        >
                            Étapes
                        </button>
                        <button 
                            className={activeTab === 'access' ? 'active' : ''} 
                            onClick={() => handleTabChange('access')}
                        >
                            Accès
                        </button>
                        <button 
                            className={activeTab === 'equipment' ? 'active' : ''} 
                            onClick={() => handleTabChange('equipment')}
                        >
                            Équipements
                        </button>
                    </nav>
                    
                    {/* Contenu du panneau - dépend de l'onglet actif */}
                    <div className="stay-card__content">
                        {renderTabContent()}
                    </div>
                </div>
            )}

            {/* POPUPS MODALES */}
            {isEditPopupOpen && (
                <StayEditPopupTest 
                    stay={stay}
                    onClose={() => setIsEditPopupOpen(false)}
                />
            )}
            
            {isImagePopupOpen && (
                <StayImageTest 
                    stay={stay}
                    onClose={() => setIsImagePopupOpen(false)}
                    onUpdate={onSelect}
                />
            )}
            
            {isThemePopupOpen && (
                <ThemeTest 
                    stay={stay}
                    onClose={() => setIsThemePopupOpen(false)}
                />
            )}
            
            {isHighlightPopupOpen && (
                <HighlightTest
                    stay={stay}
                    onClose={() => setIsHighlightPopupOpen(false)}
                />
            )}
            
            {isStepPopupOpen && (
                <StayStepTest
                    stay={stay}
                    onClose={() => setIsStepPopupOpen(false)}
                />
            )}
            
            {isAccessPopupOpen && (
                <AccessTest 
                    stay={stay}
                    onClose={() => setIsAccessPopupOpen(false)}
                />
            )}
            
            {/* {isEquipmentPopupOpen && (
                <EquipmentsTest 
                    stay={stay}
                    onClose={() => setIsEquipmentPopupOpen(false)}
                />
            )} */}
            {isEquipmentPopupOpen && (
                <EquipmentsTest 
                    stay={stay}
                    onClose={() => {
                        console.log("1. Fermeture du popup d'équipements");
                        setIsEquipmentPopupOpen(false);
                        console.log("2. État isEquipmentPopupOpen mis à false");
                        
                        // Forcer le rechargement des données des équipements
                        setDataLoaded(prev => {
                            console.log("3. Ancien état dataLoaded.equipments:", prev.equipments);
                            const newState = { ...prev, equipments: false };
                            console.log("4. Nouvel état dataLoaded.equipments:", newState.equipments);
                            return newState;
                        });
                        
                        console.log("5. Programmation du rechargement après délai");
                        setTimeout(() => {
                            console.log("6. Exécution de loadTabData('equipment')");
                            loadTabData('equipment');
                        }, 100); // Augmentons légèrement le délai
                    }}
                />
            )}

            {/* Affichage des messages d'état */}
            {message.text && (
                <div className={`message message--${message.type}`}>
                    {message.text}
                </div>
            )}
        </article>
    );
};

export default StayCardTest;