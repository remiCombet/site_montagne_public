import { useSelector } from 'react-redux';
import { selectSelectedStay } from '../../slices/staySlice';

const Sidebar = ({ onSectionChange, currentSection }) => {
  const selectedStay = useSelector(selectSelectedStay);

  const handleClick = (e, section) => {
    e.preventDefault();
    onSectionChange(section);
  };

  return (
    <nav className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <a 
            href="#"
            onClick={(e) => handleClick(e, 'articles')}
            className={currentSection === 'articles' ? 'active' : ''}
          >
            Articles
          </a>
        </li>

        <li>
          <a 
            href="#"
            onClick={(e) => handleClick(e, 'stays')}
            className={currentSection === 'stays' ? 'active' : ''}
          >
            Séjours
          </a>
        </li>

        <li>
          <a 
            href="#"
            onClick={(e) => handleClick(e, 'reservations')}
            className={currentSection === 'reservations' ? 'active' : ''}
          >
            Réservations
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;