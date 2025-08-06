import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createStay } from '../../api/stay';
import  { addStay } from '../../slices/staySlice'
import { validateStayForm } from '../../utils/validateStayForm';
import { getAllReceptionPoints } from '../../api/reception';
import { parse, isValid, format } from 'date-fns';

const StayForm = ({ onClose }) => {
    const dispatch = useDispatch();

    // Récupération de l'identifiant de l'utilisateur via le store Redux
    const userId = useSelector((state) => state.user.infos.id);

    // Champs de la table stay
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

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    // pour ce qui est de la gestion du point de reception
    const [receptionPoint, setReceptionPoint] = useState('');
    const [receptionPoints, setReceptionPoints] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    // Fonction pour valider et formater les dates
    const formatDate = (date) => {
        const parsedDate = parse(date, "yyyy-MM-dd'T'HH:mm", new Date()); // "yyyy-MM-dd'T'HH:mm" est le format de date venant de <input type="datetime-local" />
        return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : null;
    };

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: ""});
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [message])

    // chargement des points de reception
    useEffect(() => {
        getAllReceptionPoints()
        .then((res) => {
            console.log(res.data)
            setReceptionPoints(res.data);
        })
        .catch((err) => {
            console.error('Erreur lors du chargement des points de réception:', err);
        })
    }, []);

    // Validation de formulaire
    const onSubmitForm = async (e) => {
        e.preventDefault();

        setMessage({ type: "", text: "" });
 
        if (!technical_level || !physical_level) {
            setMessage({ type: "error", text: "Les niveaux physique et technique sont requis." });
            return;
        }

        // Récupération des champs à envoyer
        const fieldsToValidate = [
            { name: "title", field: "title", value: title },
            { name: "description", field: "description", value: description },
            { name: "location", field: "location", value: location },
            { name: "price", field: "price", value: price },
            { name: "technical_level", field: "technical_level", value: technical_level },
            { name: "physical_level", field: "physical_level", value: physical_level },
            { name: "min_participant", field: "min_participant", value: min_participant },
            { name: "max_participant", field: "max_participant", value: max_participant },
            { name: "start_date", field: "start_date", value: formatDate(start_date) },
            { name: "end_date", field: "end_date", value: formatDate(end_date) },
            { name: "user_id", field: "user_id", value: userId }
        ];
        
        // validation des champs
        const validationErrors = validateStayForm(fieldsToValidate);
        
        // cas où il y a des erreurs
        if (validationErrors.length > 0) {
            setMessage({ type: "error", text: validationErrors.join(', ') });
            return;
        }
    
        // Si validation réussie, créer le séjour
        const newStay = {
            title,
            description,
            location,
            price: parseFloat(price),
            physical_level,
            technical_level,
            min_participant: parseInt(min_participant),
            max_participant: parseInt(max_participant),
            start_date,
            end_date,
            reception_point_id: 1,
            status: "participants_insuffisants",
            user_id: userId
        };

        createStay(newStay)
        .then((res) => {
            if (res.status === 200) {
                dispatch(addStay(res.stay));

                setMessage({
                    type: "success",
                    text: res.msg || "Séjour créé avec succès"
                });

                setTimeout(() => {
                    onClose();
                }, 1600)
            }
        })        
        .catch(err => {
            // réponse négative
            setMessage({
                type: "error",
                text: "Erreur lors de la création du séjour"
            });
        });
    };

    return (
        <div>

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
                        <option value="">Sélectionner un niveau</option>
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
                        <option value="">Sélectionner un niveau</option>
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
                        value={start_date}
                        onChange={(e) => setStart_date(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Date de fin
                    <input
                        type="datetime-local"
                        value={end_date}
                        onChange={(e) => setEnd_date(e.target.value)}
                        required
                    />
                </label>
                
                <button type="submit">Créer le séjour</button>
            </form>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                </div>
            )}
        </div>
    );
};

export default StayForm;
