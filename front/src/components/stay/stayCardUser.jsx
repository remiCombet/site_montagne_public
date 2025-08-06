import { NavLink } from 'react-router-dom';
import { setSelectedStay } from '../../slices/staySlice';

const StayCardUser = ({ stay }) => {
    const decodeHTML = (html) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    const handleViewDetails = () => {
        dispatch(setSelectedStay(stay));
    };

    return (
        <article className="stay-card">
            <div className="stay-card-content">
                <h3 className="stay-title">{decodeHTML(stay.title)}</h3>
                {stay.start_date && (
                    <p className="stay-date">
                        du {new Date(stay.start_date).toLocaleDateString()} au {stay.end_date && new Date(stay.end_date).toLocaleDateString()}
                    </p>
                )}
                <NavLink 
                    to={`/stays/${stay.id}`} 
                    className="stay-card__link"
                    onClick={handleViewDetails}
                >
                    Lire la suite
                </NavLink>
            </div>
        </article>
    );
};

export default StayCardUser;
