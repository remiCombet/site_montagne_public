import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';  // Importer useSelector

const Sidebar = ({ onSectionChange }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const selectedStay = useSelector((state) => state.stay.selectedStay);  // Récupérer selectedStay depuis Redux

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  // Ouvrir automatiquement le sous-menu quand un séjour est sélectionné
  useEffect(() => {
    if (selectedStay) {
      setIsSubMenuOpen(true);  // Ouvre le sous-menu si un séjour est sélectionné
    } else {
      setIsSubMenuOpen(false); // Sinon, ferme le sous-menu
    }
  }, [selectedStay]);  // Re-exécute quand selectedStay change

  return (
    <nav className="sidebar">
      <button onClick={() => onSectionChange('articles')}>Articles</button>

      {/* Le bouton "Séjours" reçoit une classe 'active' si un séjour est sélectionné */}
      <div className={`stay-section ${selectedStay ? 'active' : ''}`}>
        <button 
          onClick={() => { 
            onSectionChange('stays'); 
            toggleSubMenu(); 
          }}
          className={selectedStay ? 'active' : ''}
        >
          Séjours
        </button>
        
        {/* Le sous-menu est uniquement visible si un séjour est sélectionné et que le sous-menu est ouvert */}
        <div className={`sub-menu ${isSubMenuOpen ? 'open' : ''}`}>
          {selectedStay && (
            <>
              <a href="#stay-info" onClick={() => onSectionChange('stay-info')}>
                Détails du séjour
              </a>
              <a href="#highlights" onClick={() => onSectionChange('highlights')}>
                Points forts
              </a>
              <a href="#themes" onClick={() => onSectionChange('themes')}>
                Thèmes
              </a>
            </>
          )}
        </div>
      </div>

      <button onClick={() => onSectionChange('reservations')}>Réservations</button>
    </nav>
  );
};

export default Sidebar;
