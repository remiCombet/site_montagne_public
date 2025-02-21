import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedStay } from '../../slices/staySlice';
import StayListTest from '../autre/stayListTest';
import StayFormTest from '../autre/StayFormTest';
import ThemeManagement from '../autre/themeManagement';
import HighlightManagement from '../autre/highlightManagment'; 

const StayTest = () => {
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
    <section>
      {/* Gestion des séjours */}
      <h2>Gestion des séjours</h2>

      <article>
        <h3>Ajouter un séjour</h3>

        {showForm && <StayFormTest onClose={() => setShowForm(false)} />}

        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Masquer le formulaire' : 'Ajouter un séjour'}
        </button>
      </article>
      
      <article className="stay-list">
        <h3>Liste des séjours</h3>
        {stays.length > 0 ? (
          <StayListTest
            stays={stays}
            onStaySelect={handleStaySelect}
            selectedStay={selectedStay}
            onStayDeselect={handleDeselectStay}
          />
        ) : (
          <p>Aucun séjour disponible pour le moment.</p>
        )}
      </article>
      
    </section>
  );
};

export default StayTest;
