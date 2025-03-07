import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStay } from '../../api/stay';
import { updateStayStore } from '../../slices/staySlice';
import { getAllReceptionPoints } from '../../api/publicApi';
import { format } from 'date-fns';
// @ts-ignore
import { decodeHTML} from '../../utils/decodeHtml';
import ReceptionPointTest from './receptionPointTest';

const StayEditPopupTest = ({ stay, onClose }) => {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.user.infos.id);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [technical_level, setTechnical_level] = useState('');
    const [physical_level, setPhysical_level] = useState('');
    const [min_participant, setMin_participant] = useState('');
    const [max_participant, setMax_participant] = useState('');
    const [start_date, setStart_date] = useState('');
    const [end_date, setEnd_date] = useState('');
    const [status, setStatus] = useState('');
    const [receptionPoint, setReceptionPoint] = useState('');
    const [receptionPoints, setReceptionPoints] = useState([]);
    const [user_id, setUser_id] = useState('');
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isEditing, setIsEditing] = useState(false);

    // Fonction de formatage pour la date (avant soumission)
    const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd');

    // Fonction de formatage pour l'affichage en mode lecture
    const formatDateForDisplay = (date) => {
        if (!date) return '';
        return format(new Date(date), 'yyyy-MM-dd');
    };

    // Fonction de formatage pour l'input en mode édition
    const formatDateForInput = (date) => {
        if (!date) return '';
        return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
    };

    // Charger les données du séjour et les points de réception
    useEffect(() => {
        if (stay) {
            setTitle(decodeHTML(stay.title));
            setDescription(decodeHTML(stay.description));
            setLocation(decodeHTML(stay.location));
            setPrice(stay.price);
            setTechnical_level(stay.technical_level);
            setPhysical_level(stay.physical_level);
            setMin_participant(stay.min_participant);
            setMax_participant(stay.max_participant);
            setStart_date(stay.start_date);
            setEnd_date(stay.end_date);
            setStatus(stay.status);
            setReceptionPoint(stay.reception_point_id);
        }

        getAllReceptionPoints()
            .then((res) => setReceptionPoints(res.data))
            .catch((err) => console.error("Erreur lors du chargement des points de réception", err));
    }, [stay]);

    // Gestion de l'envoi du formulaire
    const onSubmitForm = async (e) => {
        e.preventDefault();

        if (!stay?.id) {
          console.error("Erreur : L'ID du séjour est manquant.");
          return;
      }
        setMessage({ type: "", text: "" });

        // Formater les dates avant l'envoi
        const formattedStartDate = formatDate(start_date);
        const formattedEndDate = formatDate(end_date);

        const updatedStay = {
            title,
            description,
            location,
            price: parseFloat(price),
            technical_level,
            physical_level,
            min_participant: parseInt(min_participant),
            max_participant: parseInt(max_participant),
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            reception_point_id: receptionPoint,
            status,
            user_id: userId,
        };
        
        try {
            const res = await updateStay(stay.id, updatedStay);
            if (res.status === 200) {
                dispatch(updateStayStore(res.stay));
                setMessage({ type: "success", text: "Séjour mis à jour avec succès !" });
                setTimeout(() => onClose(), 1600);
            }
        } catch (error) {
          console.error("Erreur détaillée lors de la mise à jour du séjour:", error);
          setMessage({ type: "error", text: "Erreur lors de la mise à jour du séjour" });        }
    };

    // // Fermer le popup
    // const handleClose = () => {
    //   onClose();
    // };

    const handlePointChange = async (newPointId) => {
        setReceptionPoint(newPointId);
        try {
            const res = await updateStay(stay.id, { 
                ...stay, 
                reception_point_id: newPointId 
            });
            if (res.status === 200) {
                dispatch(updateStayStore({ 
                    ...stay,
                    id: stay.id,
                    reception_point_id: newPointId 
                }));
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du point de réception:", error);
            setMessage({ type: "error", text: "Erreur lors de la mise à jour du point de réception" });
        }
    };

    // Gestion de la fermeture en cliquant en dehors
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            onClose();
        }
    };

    const renderViewMode = () => (
        <div className="stay-details">
            <h2>{title}</h2>
            <p><strong>Description :</strong> {description}</p>
            <p><strong>Localisation :</strong> {location}</p>
            <p><strong>Prix :</strong> {price}€</p>
            <p><strong>Niveau technique :</strong> {technical_level}</p>
            <p><strong>Niveau physique :</strong> {physical_level}</p>
            <p><strong>Participants :</strong> {min_participant} - {max_participant}</p>
            <p><strong>Dates :</strong> Du {formatDateForDisplay(start_date)} au {formatDateForDisplay(end_date)}</p>
            
            {/* Boutons de modification du séjour */}
            <div className="actions">
                <button onClick={() => setIsEditing(true)}>Modifier</button>
            </div>
            
            {/* Composant de gestion du point de réception */}
            <ReceptionPointTest 
                stayId={stay.id}
                currentReceptionPointId={receptionPoint}
                onPointChange={handlePointChange}
            />

            {/* Bouton de fermeture */}
            <div className="actions center">
                <button 
                    className="close-btn" 
                    onClick={onClose}
                    type="button"
                >
                    Fermer
                </button>
            </div>
        </div>
    );

    const renderEditMode = () => (
        <form onSubmit={onSubmitForm}>
            <label>
                Titre
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </label>
            <label>
                Description
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </label>
            <label>
                Localisation
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                />
            </label>
            <label>
                Prix
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </label>
            <label>
                Niveau technique
                <select
                    value={technical_level}
                    onChange={(e) => setTechnical_level(e.target.value)}
                    required
                >
                    <option value="facile">Facile</option>
                    <option value="modéré">Modéré</option>
                    <option value="sportif">Sportif</option>
                    <option value="difficile">Difficile</option>
                    <option value="extreme">Extrême</option>
                </select>
            </label>
            <label>
                Niveau physique
                <select
                    value={physical_level}
                    onChange={(e) => setPhysical_level(e.target.value)}
                    required
                >
                    <option value="facile">Facile</option>
                    <option value="modéré">Modéré</option>
                    <option value="sportif">Sportif</option>
                    <option value="difficile">Difficile</option>
                    <option value="extreme">Extrême</option>
                </select>
            </label>
            <label>
                Participants min.
                <input
                    type="number"
                    value={min_participant}
                    onChange={(e) => setMin_participant(e.target.value)}
                    required
                />
            </label>
            <label>
                Participants max.
                <input
                    type="number"
                    value={max_participant}
                    onChange={(e) => setMax_participant(e.target.value)}
                    required
                />
            </label>
            <label>
                Date de début
                <input
                  type="datetime-local"
                  value={formatDateForInput(start_date)} 
                  onChange={(e) => setStart_date(e.target.value)}
                  required
              />
            </label>
            <label>
                Date de fin
                <input
                    type="datetime-local"
                    value={formatDateForInput(end_date)}
                    onChange={(e) => setEnd_date(e.target.value)}
                    required
                />
            </label>
            <div className="actions">
                <button type="submit">Sauvegarder</button>
                <button type="button" onClick={() => setIsEditing(false)}>Annuler</button>
            </div>
        </form>
    );

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content">
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                {isEditing ? renderEditMode() : renderViewMode()}
            </div>
        </div>
    );
};

export default StayEditPopupTest;
