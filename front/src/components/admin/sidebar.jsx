import { useSelector } from 'react-redux';
import { selectSelectedStay } from '../../slices/staySlice';

const Sidebar = ({ onSectionChange, currentSection }) => {
  const selectedStay = useSelector(selectSelectedStay);

  return (
    <nav className="sidebar">
      <button 
        onClick={() => onSectionChange('articles')}
        className={currentSection === 'articles' ? 'active' : ''}
      >
        Articles
      </button>

      <button 
        onClick={() => onSectionChange('stays')}
        className={currentSection === 'stays' ? 'active' : ''}
      >
        Séjours
      </button>

      <button 
        onClick={() => onSectionChange('reservations')}
        className={currentSection === 'reservations' ? 'active' : ''}
      >
        Réservations
      </button>
    </nav>
  );
};

export default Sidebar;