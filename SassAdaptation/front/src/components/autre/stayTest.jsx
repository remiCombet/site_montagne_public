import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedStay } from '../../slices/staySlice';
import StayListTest from '../autre/stayListTest';
import StayFormTest from '../autre/StayFormTest';
import MessagePopup from '../admin/messagePopup';
import ThemeManagement from '../autre/themeManagement';
import HighlightManagement from '../autre/highlightManagment'; 

// test a supprimer apres
import CreateTest from './test/createTest';

const StayTest = () => {
  const dispatch = useDispatch();
  const stays = useSelector((state) => state.stay.stays);
  const selectedStay = useSelector((state) => state.stay.selectedStay);
  console.log("selectedStay", selectedStay);
  console.log("stays", stays);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleStaySelect = (stay) => {
    dispatch(setSelectedStay(stay));
  };

  const handleDeselectStay = () => {
    dispatch(setSelectedStay(null));
  };

  return (
    <section>
      <MessagePopup 
          message={message.text}
          type={message.type}
          onClose={() => setMessage({ type: '', text: '' })}
      />

      {/* Gestion des séjours */}
      <h2>Gestion des séjours</h2>

      <article>
        <h3>Ajouter un séjour</h3>

        {showForm && (
          <StayFormTest 
            onClose={() => setShowForm(false)} 
            onMessage={setMessage}
          />
        )}

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
            onMessage={setMessage}
          />
        ) : (
          <p>Aucun séjour disponible pour le moment.</p>
        )}
      </article>

    </section>
  );
};

export default StayTest;
