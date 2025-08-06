import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedStay } from '../../slices/staySlice';
import StayList from '../stay/stayList';
import StayForm from './stayForm';
import Theme from './theme';

const Stays = () => {
  const dispatch = useDispatch();
  const stays = useSelector((state) => state.stay.stays);
  const selectedStay = useSelector((state) => state.stay.selectedStay);

  const [showForm, setShowForm] = useState(false);

  const handleStaySelect = (stay) => {
    dispatch(setSelectedStay(stay));
  };

  const handleDeselectStay = () => {
    dispatch(setSelectedStay(null));
  };

  return (
    <section className="stays-container">
        <h2>Gestion des Séjours</h2>
        <p>Ici vous pouvez ajouter, modifier ou supprimer des séjours.</p>
        <button className="add-stay-btn" onClick={() => setShowForm(true)}>
          Ajouter un séjour
        </button>

        {showForm && <StayForm onClose={() => setShowForm(false)} />}

        <article className="stays-list">
          {stays.length > 0 ? (
            <StayList 
              stays={stays} 
              onStaySelect={handleStaySelect}
              selectedStay={selectedStay}
              onStayDeselect={handleDeselectStay}
            />
          ) : (
            <p>Aucun séjour disponible pour le moment.</p>
          )}
        </article>
        
        {/* gestion des thems */}
        {/* <article className="themes">
          <Theme />
        </article> */}

        {/* gestion des point forts */}
        <article></article>

        {/* gestion des étapes */}
        <article></article>
        <article></article>
        <article></article>
    </section>
  );
};

export default Stays;
