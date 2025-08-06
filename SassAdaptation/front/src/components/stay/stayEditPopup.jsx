import { useState } from 'react';
import { validateStayForm } from '../../utils/validateStayForm';

const StayEditPopup = ({ field, value, onSave, onClose }) => {
    const [newValue, setNewValue] = useState(value);
    const [error, setError] = useState('');

    const handleSave = async () => {
        // Appel à validateStayForm pour valider le champ
        const fields = [{ name: field, field, value: newValue }];
        const errors = await validateStayForm(fields);

        if (Object.keys(errors).length === 0) {
            onSave(field, newValue);
            onClose();
        } else {
            setError(errors[field]);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h3>Modifier {field}</h3>
                <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                />
                {error && <p className="error">{error}</p>} {/* Affichage de l'erreur */}

                <button onClick={handleSave}>Sauvegarder</button>
                <button onClick={onClose}>Annuler</button>
            </div>
        </div>
    );
};

export default StayEditPopup;