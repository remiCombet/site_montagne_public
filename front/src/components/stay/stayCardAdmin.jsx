import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { format, parse } from 'date-fns';
import StayEditPopup from './stayEditPopup';
import { updateStay, deleteStay } from '../../api/stay';
import { updateStayStore, deleteStayStore } from '../../slices/staySlice';
import { getAllThemesByStayid } from '../../api/publicApi';

const StayCardAdmin = ({ stay, onSelect, selectedStay, onDeselect }) => {
    const dispatch = useDispatch();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [updatedStay, setUpdatedStay] = useState(stay);
    const [themes, setThemes] = useState([]);

    useEffect(() => {
        if (selectedStay) {
            console.log(selectedStay.id);
            getAllThemesByStayid(selectedStay.id)
                .then(data => {
                    console.log("Données reçues :", data);
                    setThemes(Array.isArray(data.themes) ? data.themes : []);
                })
                .catch(err => {
                    console.error("Erreur lors du chargement des thèmes :", err);
                    setThemes([]);
                });
        }
    }, [selectedStay]);
    

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    // Fonction pour formater la date au format YYYY-MM-DD
    const formatDate = (date) => {
        return format(new Date(date), 'yyyy-MM-dd');
    };

    // Fonction de formatage destniée à l'affichage
    const formatViewDate = (date) => {
        return format(new Date(date), 'dd-MM-yyyy');
    };

    const openPopup = (field, value) => {
        setCurrentField(field);
        setCurrentValue(value);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setCurrentField('');
        setCurrentValue('');
    };

    const handleSave = async (field, newValue) => {
        if (!stay?.id) {
            console.error("Erreur : L'ID du séjour est manquant.");
            return;
        }

        // Convertir la date au bon format si le champ est une date
        if (field === 'start_date' || field === 'end_date') {
            newValue = formatDate(newValue);  // Formater la date
        }

        const newStay = { ...updatedStay, [field]: newValue };
        console.log("Données envoyées :", newStay);

        try {
            const response = await updateStay(stay.id, newStay);

            if (response.status === 200) {
                setMessage({
                    type: "success",
                    text: response.msg || "séjour modifié avec succès!"
                });
                
                setUpdatedStay({ ...updatedStay, [field]: newValue });
                dispatch(updateStayStore(newStay));

                setTimeout(() => {
                    onDeselect();
                }, 2000);
            } else {
                console.error("Erreur lors de la mise à jour :", response);
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
        }
        closePopup();
    };

    const isSelected = selectedStay && selectedStay.id === stay.id;

    const handleSelectStay = () => {
        onSelect(stay);
        console.log(`Séjour sélectionné :`, stay);
    };

    const handleDeselectStay = () => {
        onDeselect();
        console.log(`Séjour désélectionné :`, stay);
    };

    const handleDeleteStay = () => {
        if (selectedStay) {
            console.log(selectedStay.id)
            deleteStay(selectedStay.id)
            dispatch(deleteStayStore(selectedStay.id));

            setMessage({
                type: "success",
                text: "séjour supprimé avec succès!"
            });
        }
    }

    const decodeHTML = (html) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: ""});
            }, 1500);

            return () => clearTimeout(timer);
        }
    })

    return (
        <article className="stay-card">
            <div className="stay-card-content">
                <h3 className="stay-title">{decodeHTML(updatedStay.title)}</h3>

                {updatedStay.start_date && (
                    <p className="stay-date">
                        du {formatViewDate(updatedStay.start_date)} au {updatedStay.end_date && formatViewDate(updatedStay.end_date)}
                    </p>
                )}

                {message.text && (
                    <p
                        style={{ color: message.type === "error" ? "red" : "green" }}
                        role="alert"
                        aria-live="assertive"
                    >
                        {message.text}
                    </p>
                )}

                {isSelected ? (
                    <div>
                        <div className="stay-details">
                            <h4>Détails du séjour</h4>

                            <p>
                                <strong>Titre du séjour :</strong> {updatedStay.title}
                                <button onClick={() => openPopup('title', updatedStay.title)}>✏️</button>
                            </p>

                            <p>
                                <strong>Description :</strong> {updatedStay.description}
                                <button onClick={() => openPopup('description', updatedStay.description)}>✏️</button>
                            </p>

                            <p>
                                <strong>Dates :</strong> 
                                <input
                                    type="date"
                                    value={formatDate(updatedStay.start_date)}
                                    onChange={(e) => openPopup('start_date', e.target.value)}
                                />
                                <button onClick={() => openPopup('start_date', updatedStay.start_date)}>✏️</button> 
                                - 
                                <input
                                    type="date"
                                    value={formatDate(updatedStay.end_date)}
                                    onChange={(e) => openPopup('end_date', e.target.value)}
                                />
                                <button onClick={() => openPopup('end_date', updatedStay.end_date)}>✏️</button>
                            </p>

                            <p>
                                <strong>Localisation :</strong> {updatedStay.location}
                                <button onClick={() => openPopup('location', updatedStay.location)}>✏️</button>
                            </p>

                            <p>
                                <strong>Prix :</strong> {updatedStay.price} €
                                <button onClick={() => openPopup('price', updatedStay.price)}>✏️</button>
                            </p>

                            <p>
                                <strong>Status :</strong> {updatedStay.status}
                                <button onClick={() => openPopup('status', updatedStay.status)}>✏️</button>
                            </p>

                            <p>
                                <strong>Niveau physique :</strong> {updatedStay.physical_level}
                                <button onClick={() => openPopup('physical_level', updatedStay.physical_level)}>✏️</button>
                            </p>

                            <p>
                                <strong>Niveau technique :</strong> {updatedStay.technical_level}
                                <button onClick={() => openPopup('technical_level', updatedStay.technical_level)}>✏️</button>
                            </p>

                            {/* <p>
                                <strong>nombre minimum de participants :</strong> {updatedStay.min_participant}
                                <button onClick={() => openPopup('min_participant', updatedStay.min_participant)}>✏️</button>
                            </p>

                            <p>
                                <strong>nombre maximum de participants :</strong> {updatedStay.max_participant}
                                <button onClick={() => openPopup('max_participant', updatedStay.max_participant)}>✏️</button>
                            </p> */}
                        </div>

                        {/* <div>
                            <h2>Thèmes du séjour</h2>
                            <ul>
                                {themes.length > 0 ? themes.map(theme => (
                                    <li key={theme.id}>{theme.name}</li>
                                )) : <p>Aucun thème disponible.</p>}
                            </ul>
                        </div> */}
                        
                        <button onClick={handleDeleteStay} className="stay-delete-btn">Supprimer le séjour</button>
                        <button onClick={handleDeselectStay} className="stay-deselect-btn">
                            Désélectionner
                        </button>
                    </div>
                ) : (
                    <div className="stay-actions">
                        <button onClick={handleSelectStay} className="stay-edit-btn">
                            Voir les détails
                        </button>
                    </div>
                )}
            </div>

            {/* Affichage du popup si ouvert */}
            {isPopupOpen && (
                <StayEditPopup
                    field={currentField}
                    value={currentValue}
                    onSave={handleSave}
                    onClose={closePopup}
                />
            )}
        </article>
    );
};

export default StayCardAdmin;
