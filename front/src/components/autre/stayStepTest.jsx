import { useState, useEffect} from 'react';
import { getStayStepByStayId } from '../../api/publicApi';
import { createStayStep, updateStayStep, deleteStayStep } from '../../api/admin/stayStep';
import { validateStayStepForm } from '../../utils/validateStayStep';

const StayStepTest = ({ stay, onClose }) => {
    const stayId = stay.id;
    const [staySteps, setStaySteps] = useState([]);
    const [editingStayStepId, setEditingStayStepId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState(false);

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    // États pour les champs du formulaire
    const [stepNumber, setStepNumber] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [elevationGain, setElevationGain] = useState("");
    const [elevationLoss, setElevationLoss] = useState("");
    const [accommodationId, setAccommodationId] = useState("");

    // Gestion de l'ajout d'une étape
    const handleCreateStayStep = async (e) => {
        e.preventDefault();

        setMessage({type: "", text: ""});

        const fielsToValidate = [
            { name: "numéro d'étape", field: "stepNumber", value: stepNumber },
            { name: "title", field: "title", value: title },
            { name: "description", field: "description", value: description },
            { name: "duration", field: "duration", value: duration },
            { name: "elevationGain", field: "elevationGain", value: elevationGain },
            { name: "elevationLoss", field: "elevationLoss", value: elevationLoss },
            { name: "stayId", field: "stayId", value: parseInt(stayId, 10) },
            { name: "accommodationId", field: "accommodationId", value: accommodationId },
        ];

        console.log(fielsToValidate)

        // Validation du formulaire
        const validationErrors = validateStayStepForm(fielsToValidate);

        // cas ou il y a des erreurs
        if (validationErrors.length > 0) {
            setMessage({ type: "error", text: validationErrors.join(', ') });
            console.log('error')
            return;
        };

        // préparation des données
        const newStayStepData = {
            step_number: stepNumber,
            title,
            description,
            duration,
            elevation_gain: elevationGain,
            elevation_loss: elevationLoss,
            // a changer apres avoir fait la selection de l'accommodation
            accommodation_id: 1,
        };

        console.log(newStayStepData)

        // création des données
        createStayStep(stayId, newStayStepData)
        .then((res) => {
            console.log(res)
            if (res.status === 201) {
                console.log(res)
                // Mise à jour de l'état avec la nouvelle étape
                setStaySteps((prevSteps) => [...prevSteps, res.stayStep]);

                setMessage({ type: "success", text: "Étape ajoutée avec succès !" });

                setShowForm(false)
                // Réinitialisation des champs du formulaire
                setStepNumber("");
                setTitle("");
                setDescription("");
                setDuration("");
                setElevationGain("");
                setElevationLoss("");
                setAccommodationId("");
            } else {
                setMessage({ type: "error", text: "Erreur lors de la création de l'étape." });
            }
        })
        .catch((err) => {
            setMessage({ type: "error", text: "Erreur lors de la création de l'étape." });
            console.error(err);
        });
    };

    // Gestion de la modification d'une étape
    const handleUpdateStayStep = (e) => {
        e.preventDefault();

        setMessage({ type: "", text: "" });

        const fieldsToValidate = [
            { name: "numéro d'étape", field: "stepNumber", value: stepNumber },
            { name: "title", field: "title", value: title },
            { name: "description", field: "description", value: description },
            { name: "duration", field: "duration", value: duration },
            { name: "elevationGain", field: "elevationGain", value: elevationGain },
            { name: "elevationLoss", field: "elevationLoss", value: elevationLoss },
            { name: "accommodationId", field: "accommodationId", value: accommodationId },
        ];

        // Validation du formulaire
        const validationErrors = validateStayStepForm(fieldsToValidate);

        // cas ou il y a des erreurs
        if (validationErrors.length > 0) {
            setMessage({ type: "error", text: validationErrors.join(', ') });
            console.log('error')
            return;
        };

        // préparation des données
        const updatedStayStepData = {
            step_number: stepNumber,
            title,
            description,
            duration,
            elevation_gain: elevationGain,
            elevation_loss: elevationLoss,
            // stay_id: parseInt(stayId, 10),
            // a changer apres avoir fait la selection de l'accommodation
            accommodation_id: 1,
        };

        console.log(updatedStayStepData)

        updateStayStep(stayId, editingStayStepId, updatedStayStepData)
            .then((res) => {
                if (res.status === 200) {
                    setStaySteps(prevSteps => 
                        prevSteps.map(step => 
                            step.id === editingStayStepId ? res.stayStep : step
                        )
                    );
                    setMessage({ type: "success", text: "Étape modifiée avec succès !" });
                    setShowForm(false);
                    setEditingStayStepId(null);

                    // Réinitialisation des champs
                    setStepNumber("");
                    setTitle("");
                    setDescription("");
                    setDuration("");
                    setElevationGain("");
                    setElevationLoss("");
                    setAccommodationId("");
                } else {
                    setMessage({ type: "error", text: "Erreur lors de la modification de l'étape." });
                }
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de la modification de l'étape." });
                console.error(err);
            });
    };

    // gestion de la suppression d'une étape
    const handleDeleteStayStep = (stepId) => {
        // Suppression de l'étape
        deleteStayStep(stayId, stepId)
            .then((res) => {
                if (res.status === 200) {
                    setStaySteps((prevSteps) => prevSteps.filter((step) => step.id !== stepId));
                    setMessage({ type: "success", text: "Étape supprimée avec succès !" });
                } else {
                    setMessage({ type: "error", text: res.msg || "Erreur lors de la suppression de l'étape" });
                }
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de la suppression de l'étape." });
                console.error("Erreur lors de la suppression de l'étape :", err);
            });
        };

    const handleEditStayStep = (step) => {
        setEditingStayStepId(step.id);
        setStepNumber(step.step_number);
        setTitle(step.title);
        setDescription(step.description);
        setDuration(step.duration);
        setElevationGain(step.elevation_gain);
        setElevationLoss(step.elevation_loss);
        setAccommodationId(step.accommodation_id || "");
        setShowForm(true);
    };

    useEffect(() => {
        getStayStepByStayId(stayId)
            .then((res) => {
                if (res.status === 200) {
                    console.log(res.staySteps)
                    setStaySteps(res.staySteps)
                } else {
                    throw new Error("Erreur lors du chargement des étapes.");
                }
            })
            .catch((err) => {
                setError("Impossible de récupérer les étapes.");
                console.error(err);
            })
    }, [stayId])

    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [message]);

    // Gestion de la fermeture en cliquant en dehors
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            onClose();
        }
    };

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content">
                <h3>Étapes du séjour</h3>

                {/* Affichage des messages d'erreur */}
                {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                        {message.text}
                    </div>
                )}

                {/* Liste des étapes du séjour */}
                <ul>
                    {staySteps.length > 0 ? (
                        staySteps.map((step) => (
                            <li key={step.id}>
                                <strong>{step.title}</strong> : {step.description}
                                <button onClick={() => handleEditStayStep(step)}>Modifier</button>
                                <button onClick={() => handleDeleteStayStep(step.id)}>Supprimer</button>
                            </li>
                        ))
                    ) : (
                        <li>Aucune étape disponible pour ce séjour.</li>
                    )}
                </ul>

                <h3>Ajouter une étape à un séjour</h3>
                <form onSubmit={editingStayStepId ? handleUpdateStayStep : handleCreateStayStep}>
                    <div className="form-group">
                        <label htmlFor="stepNumber" aria-label="Numéro de l'étape">
                            Numéro de l'étape *
                        </label>
                        <input
                            type="number"
                            id="stepNumber"
                            name="stepNumber"
                            value={stepNumber}
                            onChange={(e) => setStepNumber(e.target.value)}
                            aria-required="true"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="title" aria-label="Titre de l'étape">
                            Titre *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            aria-required="true"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" aria-label="Description de l'étape">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            aria-required="true"
                            className="form-control"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="duration" aria-label="Durée de l'étape en heures">
                            Durée (heures) *
                        </label>
                        <input
                            type="number"
                            id="duration"
                            name="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            aria-required="true"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="elevationGain" aria-label="Dénivelé positif en mètres">
                            Dénivelé positif (m) *
                        </label>
                        <input
                            type="number"
                            id="elevationGain"
                            name="elevationGain"
                            value={elevationGain}
                            onChange={(e) => setElevationGain(e.target.value)}
                            aria-required="true"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="elevationLoss" aria-label="Dénivelé négatif en mètres">
                            Dénivelé négatif (m) *
                        </label>
                        <input
                            type="number"
                            id="elevationLoss"
                            name="elevationLoss"
                            value={elevationLoss}
                            onChange={(e) => setElevationLoss(e.target.value)}
                            aria-required="true"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="accommodationId" aria-label="Identifiant de l'hébergement">
                            Hébergement *
                        </label>
                        <input
                            type="number"
                            id="accommodationId"
                            name="accommodationId"
                            value={accommodationId || ""}
                            onChange={(e) => setAccommodationId(e.target.value)}
                            aria-required="true"
                            className="form-control"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        aria-label={editingStayStepId ? "Modifier l'étape" : "Ajouter l'étape"}
                    >
                        {editingStayStepId ? "Modifier" : "Ajouter"}
                    </button>
                </form>

                <button className="close-btn" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </div>
    )
};

export default StayStepTest;
