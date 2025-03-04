import { useState, useEffect} from 'react';
import { getStayStepByStayId } from '../../api/publicApi';
import { createStayStep, updateStayStep, deleteStayStep } from '../../api/admin/stayStep';
import { getAccommodationByStayStepId } from '../../api/publicApi';
import { createAccommodation, updateAccommodation } from '../../api/admin/accommodation';
import { validateStayStep } from '../../utils/validateStayStep';
import { validateAccommodation } from '../../utils/validateAccommodation';


const StayStepTest = ({ stay, onClose }) => {
    const stayId = stay.id;
    const [staySteps, setStaySteps] = useState([]);
    const [editingStayStepId, setEditingStayStepId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    // États pour les champs du formulaire de l'étape
    const [stepNumber, setStepNumber] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [elevationGain, setElevationGain] = useState("");
    const [elevationLoss, setElevationLoss] = useState("");
    
    // États pour les champs du formulaire de l'hébergement
    const [accommodationId, setAccommodationId] = useState("");
    const [accommodationName, setAccommodationName] = useState("");
    const [accommodationDescription, setAccommodationDescription] = useState("");
    const [mealType, setMealType] = useState("");
    const [mealDescription, setMealDescription] = useState("");

    
    // Fonction de réinitialisation du formulaire
    const resetForm = () => {
        // Réinitialisation des champs de l'étape
        setStepNumber("");
        setTitle("");
        setDescription("");
        setDuration("");
        setElevationGain("");
        setElevationLoss("");
        
        // Réinitialisation des champs de l'hébergement
        setAccommodationId("");
        setAccommodationName("");
        setAccommodationDescription("");
        setMealType("");
        setMealDescription("");
        setShowForm(false);
    };

    // Gestion de l'ajout d'une étape
    const handleCreateStayStep = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

         // Validation de l'étape
        const stayStepFields = [
            { name: "step_number", field: "step_number", value: parseInt(stepNumber, 10) },
            { name: "title", field: "title", value: title },
            { name: "description", field: "description", value: description },
            { name: "duration", field: "duration", value: parseFloat(duration) },
            { name: "elevation_gain", field: "elevation_gain", value: parseInt(elevationGain, 10) },
            { name: "elevation_loss", field: "elevation_loss", value: parseInt(elevationLoss, 10) }
        ];

        const accommodationFields = [
            { name: "accommodationName", field: "accommodationName", value: accommodationName },
            { name: "accommodationDescription", field: "accommodationDescription", value: accommodationDescription },
            { name: "mealType", field: "mealType", value: mealType },
            { name: "mealDescription", field: "mealDescription", value: mealDescription }
        ];

        const stayStepErrors = validateStayStep(stayStepFields);
        const accommodationErrors = validateAccommodation(accommodationFields);

        const allErrors = [...stayStepErrors, ...accommodationErrors];

        if (allErrors.length > 0) {
            setMessage({ type: "error", text: allErrors.join(", ") });
            return;
        }

        try {
            // Création d'un nouvel hébergement
            const accommodationData = {
                name: accommodationName,
                description: accommodationDescription,
                meal_type: mealType,
                meal_description: mealDescription
            };

            const resAccommodation = await createAccommodation(accommodationData);
            if (resAccommodation.status === 201) {
                // Création de l'étape avec l'hébergement
                const stayStepData = {
                    step_number: parseInt(stepNumber, 10),
                    title,
                    description,
                    duration: parseFloat(duration),
                    elevation_gain: parseInt(elevationGain, 10),
                    elevation_loss: parseInt(elevationLoss, 10),
                    accommodation_id: resAccommodation.accommodation.id
                };

                const resStayStep = await createStayStep(stayId, stayStepData);
                if (resStayStep.status === 201) {
                    setStaySteps(prevSteps => [...prevSteps, resStayStep.stayStep]);
                    setMessage({ type: "success", text: "Étape et hébergement créés avec succès !" });
                    resetForm();
                } else {
                    setMessage({ type: "error", text: resStayStep.msg || "Erreur lors de la création de l'étape." });
                }
            } else {
                setMessage({ type: "error", text: "Erreur lors de la création de l'hébergement." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Erreur lors de la création." });
        }
    };

    // Gestion de la modification d'une étape
    const handleUpdateStayStep = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
    
        // Validation de l'étape
        const stayStepFields = [
            { name: "step_number", field: "step_number", value: parseInt(stepNumber, 10) },
            { name: "title", field: "title", value: title },
            { name: "description", field: "description", value: description },
            { name: "duration", field: "duration", value: parseFloat(duration) },
            { name: "elevation_gain", field: "elevation_gain", value: parseInt(elevationGain, 10) },
            { name: "elevation_loss", field: "elevation_loss", value: parseInt(elevationLoss, 10) }
        ];
    
        const accommodationFields = [
            { name: "accommodationName", field: "accommodationName", value: accommodationName },
            { name: "accommodationDescription", field: "accommodationDescription", value: accommodationDescription },
            { name: "mealType", field: "mealType", value: mealType },
            { name: "mealDescription", field: "mealDescription", value: mealDescription }
        ];
    
        const stayStepErrors = validateStayStep(stayStepFields);
        const accommodationErrors = validateAccommodation(accommodationFields);
    
        const allErrors = [...stayStepErrors, ...accommodationErrors];
    
        if (allErrors.length > 0) {
            setMessage({ type: "error", text: allErrors.join(", ") });
            return;
        }
    
        try {
            // Préparation des données de l'hébergement
            const accommodationData = {
                name: accommodationName,
                description: accommodationDescription,
                meal_type: mealType,
                meal_description: mealDescription
            };
    
            let finalAccommodationId;
    
            // Si on a un ID d'hébergement, on met à jour, sinon on crée
            if (accommodationId) {
                const resAccommodation = await updateAccommodation(accommodationId, accommodationData);
                if (resAccommodation.status === 200) {
                    finalAccommodationId = accommodationId;
                } else {
                    setMessage({ type: "error", text: "Erreur lors de la mise à jour de l'hébergement." });
                    return;
                }
            } else {
                const resAccommodation = await createAccommodation(accommodationData);
                if (resAccommodation.status === 201) {
                    finalAccommodationId = resAccommodation.accommodation.id;
                } else {
                    setMessage({ type: "error", text: "Erreur lors de la création de l'hébergement." });
                    return;
                }
            }
    
            // Mise à jour de l'étape avec l'ID d'hébergement
            const updatedStayStepData = {
                step_number: parseInt(stepNumber, 10),
                title,
                description,
                duration: parseFloat(duration),
                elevation_gain: parseInt(elevationGain, 10),
                elevation_loss: parseInt(elevationLoss, 10),
                accommodation_id: finalAccommodationId
            };
    
            const res = await updateStayStep(stayId, editingStayStepId, updatedStayStepData);
            if (res.status === 200) {
                // Mise à jour du state avec les nouvelles données
                setStaySteps(prevSteps => 
                    prevSteps.map(step => {
                        if (step.id === editingStayStepId) {
                            return {
                                ...res.stayStep,
                                accommodation: {
                                    id: finalAccommodationId,
                                    name: accommodationName,
                                    description: accommodationDescription,
                                    meal_type: mealType,
                                    meal_description: mealDescription
                                }
                            };
                        }
                        return step;
                    })
                );
                setMessage({ type: "success", text: "Étape et hébergement modifiés avec succès !" });
                resetForm();
            } else {
                setMessage({ type: "error", text: res.msg || "Erreur lors de la modification de l'étape." });
            }
        } catch (err) {
            console.error('Erreur complète:', err);
            setMessage({ type: "error", text: "Erreur lors de la modification." });
        }
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

    const handleEditStayStep = async (step) => {
        // Remplir les champs de l'étape
        setEditingStayStepId(step.id);
        setStepNumber(step.step_number ?? "");
        setTitle(step.title ?? "");
        setDescription(step.description ?? "");
        setDuration(step.duration ?? "");
        setElevationGain(step.elevation_gain ?? 0);
        setElevationLoss(step.elevation_loss ?? 0);
        setShowForm(true);

        // Si l'étape a un hébergement associé
        if (step.accommodation) {
            const accommodation = step.accommodation;
            setAccommodationId(accommodation.id);
            setAccommodationName(accommodation.name ?? "");
            setAccommodationDescription(accommodation.description ?? "");
            setMealType(accommodation.meal_type ?? "");
            setMealDescription(accommodation.meal_description ?? "");
        } else {
            // Réinitialiser les champs d'hébergement si pas d'hébergement associé
            resetAccommodationFields();
            setMessage({ 
                type: "warning", 
                text: "Aucun hébergement associé à cette étape." 
            });
        }
    };
    
    // Fonction utilitaire pour réinitialiser les champs d'hébergement
    const resetAccommodationFields = () => {
        setAccommodationId("");
        setAccommodationName("");
        setAccommodationDescription("");
        setMealType("");
        setMealDescription("");
    };

    useEffect(() => {
        getStayStepByStayId(stayId)
            .then((res) => {
                if (res.status === 200) {
                    setStaySteps(res.staySteps || []);
                } else {
                    setStaySteps([]);
                    console.log("Aucune étape trouvée pour ce séjour");
                }
            })
            .catch((err) => {
                console.error("Erreur lors de la récupération des étapes:", err);
                setMessage({ 
                    type: "error", 
                    text: "Impossible de récupérer les étapes." 
                });
                setStaySteps([]);
            });
    }, [stayId]);

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
                            className="form-control"
                            required
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
                            required
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
                            required
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
                            required
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
                            required
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
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="accommodation-section">
                        <h4>Hébergement</h4>
                        <div className="form-group">
                            <label htmlFor="accommodationName">Nom de l'hébergement *</label>
                            <input
                                type="text"
                                id="accommodationName"
                                value={accommodationName}
                                onChange={(e) => setAccommodationName(e.target.value)}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="accommodationDescription">Description de l'hébergement</label>
                            <textarea
                                id="accommodationDescription"
                                value={accommodationDescription}
                                onChange={(e) => setAccommodationDescription(e.target.value)}
                                className="form-control"
                                rows="3"
                                required
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
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mealDescription">Description des repas</label>
                            <textarea
                                id="mealDescription"
                                value={mealDescription}
                                onChange={(e) => setMealDescription(e.target.value)}
                                className="form-control"
                                rows="2"
                                required
                            />
                        </div>
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
