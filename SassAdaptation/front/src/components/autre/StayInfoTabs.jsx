import { useState } from 'react';
import StayDetails from './stayDetails';
import ReceptionPointTest from './receptionPointTest';

const StayInfoTabs = ({ stay, onUpdate, onMessage }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [slideDirection, setSlideDirection] = useState('right');
    
    const handleTabChange = (tab) => {
        setSlideDirection(activeTab === 'details' ? 'right' : 'left');
        setActiveTab(tab);
    };

    // useEffect(() => {
    //     // Précharger les données du ReceptionPoint même si l'onglet n'est pas actif
    //     if (stay.id) {
    //       getAllReceptionPoints();
    //       if (stay.reception_point_id) {
    //         getReceptionPointById(stay.reception_point_id);
    //       }
    //     }
    //   }, [stay.id]);
      
    return (
        <section className="stay-info-tabs">
            <nav className="tabs-navigation" role="tablist">
                <button 
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'details'}
                    className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => handleTabChange('details')}
                >
                    Détails généraux
                </button>
                <button 
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'reception'}
                    className={`tab-button ${activeTab === 'reception' ? 'active' : ''}`}
                    onClick={() => handleTabChange('reception')}
                >
                    Point de réception
                </button>
            </nav>

            {activeTab === 'details' ? (
                <StayDetails 
                    stay={stay} 
                    onUpdate={onUpdate}
                    onMessage={onMessage}
                    className={`tab-content slide-${slideDirection}`}
                />
            ) : (
                <ReceptionPointTest 
                    stayId={stay.id}
                    currentReceptionPointId={stay.reception_point_id}
                    onPointChange={onUpdate}
                    onMessage={onMessage}
                    className={`tab-content slide-${slideDirection}`}
                />
            )}
        </section>
    );
};

export default StayInfoTabs;