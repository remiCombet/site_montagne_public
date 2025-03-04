import { useState } from 'react';
import { createAccommodation } from '../../api/admin/accommodation';

const AccommodationForm = ({ onAccommodationCreated, onClose }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [mealType, setMealType] = useState("");
    const [mealDescription, setMealDescription] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const accommodationData = {
            name,
            description,
            meal_type: mealType,
            meal_description: mealDescription
        };

        createAccommodation(accommodationData)
            .then((res) => {
                if (res.status === 201) {
                    setMessage({ type: "success", text: "Hébergement créé avec succès!" });
                    onAccommodationCreated(res.accommodation);
                    // Réinitialisation du formulaire
                    setName("");
                    setDescription("");
                    setMealType("");
                    setMealDescription("");
                } else {
                    setMessage({ type: "error", text: res.msg || "Erreur lors de la création" });
                }
            })
            .catch(err => {
                console.error(err);
                setMessage({ type: "error", text: "Erreur lors de la création de l'hébergement" });
            });
    };

    return (
        <div className="accommodation-form">
            <h4>Ajouter un hébergement</h4>
            
            {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Nom de l'hébergement *</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-control"
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="mealType">Type de repas</label>
                    <input
                        type="text"
                        id="mealType"
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="mealDescription">Description du repas</label>
                    <textarea
                        id="mealDescription"
                        value={mealDescription}
                        onChange={(e) => setMealDescription(e.target.value)}
                        className="form-control"
                        rows="2"
                    />
                </div>

                <div className="button-group">
                    <button type="submit" className="btn btn-primary">
                        Créer l'hébergement
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccommodationForm;