const AccommodationPopup = ({ accommodation, onClose }) => {
    if (!accommodation) return null;

    return (
        <div style={popupStyle}>
            <div style={popupContentStyle}>
                <h3>{accommodation.name}</h3>
                <p><strong>Description :</strong> {accommodation.description}</p>
                <p><strong>Type de repas :</strong> {accommodation.meal_type}</p>
                <p><strong>Repas inclus :</strong> {accommodation.meal_description}</p>

                <button onClick={onClose}>Fermer</button>
            </div>
        </div>
    );
};

// Styles pour la popup
const popupStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const popupContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
};

export default AccommodationPopup;
