import { useState, useEffect, useRef, useCallback } from 'react';
import { getReceptionPointByStayId, getStayToPrepareByStayId, getStayEquipmentsByStayId } from '../../api/publicApi';

const StayAdditionalInfo = ({ stayId }) => {
    const [activeTab, setActiveTab] = useState('reception');
    const [receptionInfo, setReceptionInfo] = useState(null);
    const [includedEquipment, setIncludedEquipment] = useState([]);
    const [requiredEquipment, setRequiredEquipment] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const loadedTabsRef = useRef([]);
    const isFirstRenderRef = useRef(true); // Pour suivre le montage initial

    // Memoize fetchTabData avec useCallback pour éviter les recréations inutiles
    const fetchTabData = useCallback((tabId) => {
        if (!stayId) return;
        
        setIsLoading(true);
        
        switch(tabId) {
            case 'reception':
                getReceptionPointByStayId(stayId)
                    .then(response => {
                        if (response && response.status === 200 && response.data) {
                            setReceptionInfo(response.data);
                            if (!loadedTabsRef.current.includes('reception')) {
                                loadedTabsRef.current = [...loadedTabsRef.current, 'reception'];
                            }
                        } else {
                            setReceptionInfo(null);
                        }
                    })
                    .catch(err => {
                        console.error("Erreur lors de la récupération du point de réception:", err);
                        setReceptionInfo(null);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
                break;
                
            case 'equipment-included':
                getStayEquipmentsByStayId(stayId)
                    .then(response => {
                        if (response && response.status === 200 && Array.isArray(response.equipments)) {
                            setIncludedEquipment(response.equipments);
                            if (!loadedTabsRef.current.includes('equipment-included')) {
                                loadedTabsRef.current = [...loadedTabsRef.current, 'equipment-included'];
                            }
                        } else {
                            setIncludedEquipment([]);
                        }
                    })
                    .catch(err => {
                        console.error("Erreur lors de la récupération des équipements fournis:", err);
                        setIncludedEquipment([]);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
                break;
                
            case 'equipment-required':
                getStayToPrepareByStayId(stayId)
                    .then(response => {
                        if (response && response.status === 200 && Array.isArray(response.equipments)) {
                            setRequiredEquipment(response.equipments);
                            if (!loadedTabsRef.current.includes('equipment-required')) {
                                loadedTabsRef.current = [...loadedTabsRef.current, 'equipment-required'];
                            }
                        } else {
                            setRequiredEquipment([]);
                        }
                    })
                    .catch(err => {
                        console.error("Erreur lors de la récupération des équipements à prévoir:", err);
                        setRequiredEquipment([]);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
                break;
                
            default:
                setIsLoading(false);
                break;
        }
    }, [stayId]);

    // Effet pour initialiser le composant et réagir au changement de stayId
    useEffect(() => {
        if (!stayId) return;
        
        // Si stayId change, réinitialiser tout
        if (!isFirstRenderRef.current) {
            setReceptionInfo(null);
            setIncludedEquipment([]);
            setRequiredEquipment([]);
            loadedTabsRef.current = [];
        }
        
        // Charger les données initiales pour l'onglet actif
        fetchTabData(activeTab);
        
        // Marquer le premier rendu comme terminé
        isFirstRenderRef.current = false;
    }, [stayId, fetchTabData]);

    // Effet qui s'active lorsque l'onglet change
    useEffect(() => {
        if (loadedTabsRef.current.includes(activeTab) || !stayId) return;
        
        // Charger les données uniquement si elles n'ont pas encore été chargées
        fetchTabData(activeTab);
    }, [activeTab, fetchTabData]);

    // Gérer le changement d'onglet
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    // Vérifier si les données sont prêtes pour l'onglet actif
    const isTabDataReady = () => {
        switch(activeTab) {
            case 'reception':
                return receptionInfo !== null || loadedTabsRef.current.includes('reception');
            case 'equipment-included':
                return includedEquipment.length > 0 || loadedTabsRef.current.includes('equipment-included');
            case 'equipment-required':
                return requiredEquipment.length > 0 || loadedTabsRef.current.includes('equipment-required');
            default:
                return true;
        }
    };

    // Optimiser le rendu avec des indicateurs visuels de chargement
    return (
        <section className="stay-content__additional-info">
            <h2 className="stay-content__title">Informations complémentaires</h2>
            
            <div className="stay-content__tabs">
                <button 
                    className={`stay-content__tab-btn ${activeTab === 'reception' ? 'stay-content__tab-btn--active' : ''}`} 
                    onClick={() => handleTabChange('reception')}
                >
                    Point de réception
                    {isLoading && activeTab === 'reception' && !isTabDataReady() && (
                        <span className="loading-indicator"> ⌛</span>
                    )}
                </button>
                <button 
                    className={`stay-content__tab-btn ${activeTab === 'equipment-included' ? 'stay-content__tab-btn--active' : ''}`}
                    onClick={() => handleTabChange('equipment-included')}
                >
                    Équipements fournis
                    {isLoading && activeTab === 'equipment-included' && !isTabDataReady() && (
                        <span className="loading-indicator"> ⌛</span>
                    )}
                </button>
                <button 
                    className={`stay-content__tab-btn ${activeTab === 'equipment-required' ? 'stay-content__tab-btn--active' : ''}`}
                    onClick={() => handleTabChange('equipment-required')}
                >
                    À prévoir
                    {isLoading && activeTab === 'equipment-required' && !isTabDataReady() && (
                        <span className="loading-indicator"> ⌛</span>
                    )}
                </button>
            </div>
            
            <div className="stay-content__tab-content stay-content__tab-content--active">
                {isLoading && !isTabDataReady() ? (
                    <p className="stay-content__loading">Chargement des informations...</p>
                ) : (
                    renderTabContent()
                )}
            </div>
        </section>
    );

    function renderTabContent() {
        switch(activeTab) {
            case 'reception':
                return receptionInfo ? (
                    <div className="stay-content__reception">
                        <div className="stay-content__reception-item">
                            <span className="icon">📍</span>
                            <div>
                                <h4>Lieu</h4>
                                <p>{receptionInfo.location || 'Non spécifié'}</p>
                            </div>
                        </div>
                        <div className="stay-content__reception-item">
                            <span className="icon">🕒</span>
                            <div>
                                <h4>Horaires</h4>
                                <p>Ouverture : {receptionInfo.opening_time || 'Non spécifié'}</p>
                                <p>Fermeture : {receptionInfo.closing_time || 'Non spécifié'}</p>
                            </div>
                        </div>
                        <div className="stay-content__reception-item">
                            <span className="icon">👤</span>
                            <div>
                                <h4>Contact</h4>
                                <p>{receptionInfo.contact_name || 'Non spécifié'}</p>
                                <p>{receptionInfo.contact_phone || 'Non spécifié'}</p>
                                <p>{receptionInfo.contact_email || 'Non spécifié'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="stay-content__no-data">Aucune information sur le point de réception disponible.</p>
                );
                
            case 'equipment-included':
                return includedEquipment.length > 0 ? (
                    <div className="stay-content__equipment">
                        {includedEquipment.map((categoryGroup, index) => (
                            <div key={index} className="stay-content__equipment-category">
                                <h3 className="stay-content__equipment-category-title">
                                    {categoryGroup.category.charAt(0).toUpperCase() + categoryGroup.category.slice(1)}
                                </h3>
                                <ul className="stay-content__equipment-list">
                                    {categoryGroup.items && categoryGroup.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="stay-content__equipment-item">
                                            <span className="icon">✅</span>
                                            <div>
                                                <strong>{item.category?.name || 'Équipement'}</strong>
                                                {item.category?.description && <p>{item.category.description}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="stay-content__no-data">Aucun équipement fourni pour ce séjour.</p>
                );
                
            case 'equipment-required':
                return requiredEquipment.length > 0 ? (
                    <div className="stay-content__equipment">
                        {requiredEquipment.map((categoryGroup, index) => (
                            <div key={index} className="stay-content__equipment-category">
                                <h3 className="stay-content__equipment-category-title">
                                    {categoryGroup.category.charAt(0).toUpperCase() + categoryGroup.category.slice(1)}
                                </h3>
                                <ul className="stay-content__equipment-list">
                                    {categoryGroup.items && categoryGroup.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="stay-content__equipment-item">
                                            <span className="icon">📝</span>
                                            <div>
                                                <strong>{item.category?.name || 'Équipement'}</strong>
                                                {item.category?.description && <p>{item.category.description}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="stay-content__no-data">Aucun équipement requis pour ce séjour.</p>
                );
                
            default:
                return <p className="stay-content__no-data">Sélectionnez un onglet pour voir plus d'informations.</p>;
        }
    }
};

export default StayAdditionalInfo;