import { useState, useEffect, useRef } from 'react';
import { getStayStepByStayId } from '../../api/publicApi';
import { createStayStep, updateStayStep, deleteStayStep } from '../../api/admin/stayStep';
import { createAccommodation, updateAccommodation } from '../../api/admin/accommodation';
import { validateStayStep } from '../../utils/validateStayStep';
import { validateAccommodation } from '../../utils/validateAccommodation';

const StayStepTest = ({ stay, onUpdate }) => {
    const stayId = stay.id;
    const [staySteps, setStaySteps] = useState([]);
    const [editingStayStepId, setEditingStayStepId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [visibleAccommodations, setVisibleAccommodations] = useState([]);

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

    const isInitialMount = useRef(true);

    const resetForm = () => {
        setStepNumber("");
        setTitle("");
        setDescription("");
        setDuration("");
        setElevationGain("");
        setElevationLoss("");
        
        setAccommodationId("");
        setAccommodationName("");
        setAccommodationDescription("");
        setMealType("");
        setMealDescription("");
        setEditingStayStepId(null);
    };

    useEffect(() => {
        loadSteps();
    }, [stayId]);

    const loadSteps = () => {
        getStayStepByStayId(stayId)
            .then((res) => {
                if (res.status === 200) {
                    setStaySteps(res.staySteps || []);
                } else {
                    setStaySteps([]);
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
    };

    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [message]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        
        if (isEditing) {
            const addTitle = document.querySelector('.form-title.title-add');
            const editTitle = document.querySelector('.form-title.title-edit');
            
            if (!addTitle || !editTitle) return;
            
            const animateTitleChange = () => {
                if (editingStayStepId) {
                    editTitle.classList.add('title-entering');
                } else {
                    addTitle.classList.add('title-entering');
                }
                
                setTimeout(() => {
                    if (editingStayStepId) {
                        addTitle.classList.remove('title-visible');
                        addTitle.classList.add('title-hidden');
                        editTitle.classList.remove('title-hidden');
                        editTitle.classList.remove('title-entering');
                        editTitle.classList.add('title-visible');
                    } else {
                        editTitle.classList.remove('title-visible');
                        editTitle.classList.add('title-hidden');
                        addTitle.classList.remove('title-hidden');
                        addTitle.classList.remove('title-entering');
                        addTitle.classList.add('title-visible');
                    }
                }, 50);
            };
            
            animateTitleChange();
        }
    }, [editingStayStepId, isEditing]);

    const handleCreateStayStep = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });

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
            setIsSubmitting(false);
            return;
        }

        try {
            const accommodationData = {
                name: accommodationName,
                description: accommodationDescription,
                meal_type: mealType,
                meal_description: mealDescription
            };

            const resAccommodation = await createAccommodation(accommodationData);
            if (resAccommodation.status === 201) {
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
                    if (onUpdate) onUpdate(stay);
                } else {
                    setMessage({ type: "error", text: resStayStep.msg || "Erreur lors de la création de l'étape." });
                }
            } else {
                setMessage({ type: "error", text: "Erreur lors de la création de l'hébergement." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Erreur lors de la création." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStayStep = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });
    
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
            setIsSubmitting(false);
            return;
        }
    
        try {
            const accommodationData = {
                name: accommodationName,
                description: accommodationDescription,
                meal_type: mealType,
                meal_description: mealDescription
            };
    
            let finalAccommodationId;
    
            if (accommodationId) {
                const resAccommodation = await updateAccommodation(accommodationId, accommodationData);
                if (resAccommodation.status === 200) {
                    finalAccommodationId = accommodationId;
                } else {
                    setMessage({ type: "error", text: "Erreur lors de la mise à jour de l'hébergement." });
                    setIsSubmitting(false);
                    return;
                }
            } else {
                const resAccommodation = await createAccommodation(accommodationData);
                if (resAccommodation.status === 201) {
                    finalAccommodationId = resAccommodation.accommodation.id;
                } else {
                    setMessage({ type: "error", text: "Erreur lors de la création de l'hébergement." });
                    setIsSubmitting(false);
                    return;
                }
            }
    
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
                if (onUpdate) onUpdate(stay);
            } else {
                setMessage({ type: "error", text: res.msg || "Erreur lors de la modification de l'étape." });
            }
        } catch (err) {
            console.error('Erreur complète:', err);
            setMessage({ type: "error", text: "Erreur lors de la modification." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStayStep = (stepId) => {
        setIsSubmitting(true);

        if (!window.confirm("Voulez-vous vraiment supprimer cette étape ?")) {
            setIsSubmitting(false);
            return;
        }

        deleteStayStep(stayId, stepId)
            .then((res) => {
                if (res.status === 200) {
                    setStaySteps((prevSteps) => prevSteps.filter((step) => step.id !== stepId));
                    setMessage({ type: "success", text: "Étape supprimée avec succès !" });
                    
                    if (editingStayStepId === stepId) {
                        resetForm();
                    }
                    
                    if (onUpdate) onUpdate(stay);
                } else {
                    setMessage({ type: "error", text: res.msg || "Erreur lors de la suppression de l'étape" });
                }
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de la suppression de l'étape." });
                console.error("Erreur lors de la suppression de l'étape :", err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const handleEditStayStep = async (step) => {
        setEditingStayStepId(step.id);
        setStepNumber(step.step_number ?? "");
        setTitle(step.title ?? "");
        setDescription(step.description ?? "");
        setDuration(step.duration ?? "");
        setElevationGain(step.elevation_gain ?? 0);
        setElevationLoss(step.elevation_loss ?? 0);

        if (step.accommodation) {
            const accommodation = step.accommodation;
            setAccommodationId(accommodation.id);
            setAccommodationName(accommodation.name ?? "");
            setAccommodationDescription(accommodation.description ?? "");
            setMealType(accommodation.meal_type ?? "");
            setMealDescription(accommodation.meal_description ?? "");
        } else {
            resetAccommodationFields();
            setMessage({ 
                type: "warning", 
                text: "Aucun hébergement associé à cette étape." 
            });
        }

        setTimeout(() => {
            const formElement = document.querySelector('.step-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };
    
    const resetAccommodationFields = () => {
        setAccommodationId("");
        setAccommodationName("");
        setAccommodationDescription("");
        setMealType("");
        setMealDescription("");
    };

    const toggleAccommodation = (stepId) => {
        if (visibleAccommodations.includes(stepId)) {
            setVisibleAccommodations(prev => prev.filter(id => id !== stepId));
        } else {
            setVisibleAccommodations(prev => [...prev, stepId]);
        }
    };

    const renderViewMode = () => (
        <section className="step-view-mode">
            <header className="step-header">
                <h3>Étapes du séjour</h3>
                
                {staySteps && staySteps.length > 0 ? (
                    <ol className="step-list">
                        {staySteps.map((step) => (
                            <li key={step.id} className="step-item">
                                <article>
                                    <header>
                                        <span className="step-number">Étape {step.step_number}</span>
                                        <h4 className="step-title">{step.title}</h4>
                                    </header>
                                    <p className="step-description">{step.description}</p>
                                    
                                    <ul className="step-details">
                                        <li className="step-detail">
                                            <i className="icon-clock" aria-hidden="true"></i> 
                                            <span>{step.duration}h</span>
                                        </li>
                                        <li className="step-detail">
                                            <i className="icon-arrow-up" aria-hidden="true"></i> 
                                            <span>{step.elevation_gain}m</span>
                                        </li>
                                        <li className="step-detail">
                                            <i className="icon-arrow-down" aria-hidden="true"></i> 
                                            <span>{step.elevation_loss}m</span>
                                        </li>
                                    </ul>
                                    
                                    {step.accommodation && (
                                        <>
                                            <button 
                                                type="button"
                                                className="btn-outline-primary btn-sm accommodation-toggle"
                                                onClick={() => toggleAccommodation(step.id)}
                                                aria-expanded={visibleAccommodations.includes(step.id)}
                                                aria-controls={`accommodation-${step.id}`}
                                            >
                                                {visibleAccommodations.includes(step.id) ? 'Masquer l\'hébergement' : 'Voir l\'hébergement'}
                                            </button>
                                            
                                            <aside 
                                                className={`step-accommodation ${visibleAccommodations.includes(step.id) ? 'is-visible' : 'is-hidden'}`}
                                                id={`accommodation-${step.id}`}
                                            >
                                                <h5>Hébergement: {step.accommodation.name}</h5>
                                                <p>{step.accommodation.description}</p>
                                                <p>Repas: {step.accommodation.meal_type} - {step.accommodation.meal_description}</p>
                                            </aside>
                                        </>
                                    )}
                                </article>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className="empty-message">Aucune étape définie pour ce séjour.</p>
                )}
            </header>

            <aside className="step-action">
                <button 
                    className="btn-primary"
                    onClick={() => setIsEditing(true)}
                    aria-label="Gérer les étapes"
                >
                    Modifier
                </button>
            </aside>
        </section>
    );

    const renderEditMode = () => {
        const isAddMode = !editingStayStepId;
        const isEditMode = !!editingStayStepId;
        
        return (
            <section className="step-edit-mode">
                <header className="section-header">
                    <h3>Gestion des étapes du séjour</h3>
                </header>
                
                {message.text && (
                    <aside 
                        className={`alert alert-${message.type === 'error' ? 'danger' : message.type}`}
                        role="alert"
                    >
                        {message.text}
                    </aside>
                )}
                
                <section className="step-list-section">
                    <h4>Étapes existantes</h4>
                    
                    {staySteps && staySteps.length > 0 ? (
                        <ol className="step-edit-list">
                            {staySteps.map((step) => (
                                <li key={step.id} 
                                    className={`step-edit-item ${step.id === editingStayStepId ? 'active-edit' : ''}`}
                                >
                                    <article className="step-content">
                                        <span className="step-number">Étape {step.step_number}</span>
                                        <h5 className="step-title">{step.title}</h5>
                                        <p className="step-description">{step.description}</p>
                                        <ul className="step-stats">
                                            <li>{step.duration}h</li>
                                            <li>+ {step.elevation_gain}m</li>
                                            <li>- {step.elevation_loss}m</li>
                                        </ul>
                                    </article>
                                    
                                    <menu type="toolbar" className="step-actions">
                                        <button 
                                            type="button"
                                            className={`btn-outline-primary btn-sm ${step.id === editingStayStepId ? 'active' : ''}`}
                                            onClick={() => handleEditStayStep(step)}
                                            disabled={isSubmitting}
                                        >
                                            {step.id === editingStayStepId ? 'En cours d\'édition' : 'Modifier'}
                                        </button>
                                        <button 
                                            type="button"
                                            className="btn-danger btn-sm"
                                            onClick={() => handleDeleteStayStep(step.id)}
                                            disabled={isSubmitting}
                                        >
                                            Supprimer
                                        </button>
                                    </menu>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="empty-message">Aucune étape définie pour ce séjour.</p>
                    )}
                </section>
                
                <section className="step-form-section">
                    <header className="form-title-container">
                        <h4 id="add-title" className={`form-title title-add ${isAddMode ? 'title-visible' : 'title-hidden'}`}>
                            Ajouter une nouvelle étape
                        </h4>
                        <h4 id="edit-title" className={`form-title title-edit ${isEditMode ? 'title-visible' : 'title-hidden'}`}>
                            Modifier l'étape
                        </h4>
                    </header>
                    
                    <form className={`step-form ${editingStayStepId ? 'is-editing' : ''}`} 
                          onSubmit={editingStayStepId ? handleUpdateStayStep : handleCreateStayStep}
                          aria-labelledby={isAddMode ? "add-title" : "edit-title"}>
                        
                        <span className="editing-indicator" aria-live="polite">
                            Mode modification
                        </span>
                        
                        <fieldset>
                            <legend>Informations de l'étape</legend>
                            
                            <div className="form-group">
                                <label htmlFor="stepNumber">Numéro de l'étape *</label>
                                <input
                                    type="number"
                                    id="stepNumber"
                                    className="text-input"
                                    value={stepNumber}
                                    onChange={(e) => setStepNumber(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                />
                                <small className="form-help">Ordre de l'étape dans l'itinéraire</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="title">Titre de l'étape *</label>
                                <input
                                    type="text"
                                    id="title"
                                    className="text-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    maxLength={100}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    className="text-area"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="duration">Durée (heures) *</label>
                                    <input
                                        type="number"
                                        id="duration"
                                        className="text-input"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                        step="0.5"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="elevationGain">Dénivelé positif (m) *</label>
                                    <input
                                        type="number"
                                        id="elevationGain"
                                        className="text-input"
                                        value={elevationGain}
                                        onChange={(e) => setElevationGain(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="elevationLoss">Dénivelé négatif (m) *</label>
                                    <input
                                        type="number"
                                        id="elevationLoss"
                                        className="text-input"
                                        value={elevationLoss}
                                        onChange={(e) => setElevationLoss(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="accommodation-section">
                            <legend>Hébergement</legend>
                            
                            <div className="form-group">
                                <label htmlFor="accommodationName">Nom de l'hébergement *</label>
                                <input
                                    type="text"
                                    id="accommodationName"
                                    className="text-input"
                                    value={accommodationName}
                                    onChange={(e) => setAccommodationName(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    maxLength={100}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="accommodationDescription">Description de l'hébergement *</label>
                                <textarea
                                    id="accommodationDescription"
                                    className="text-area"
                                    value={accommodationDescription}
                                    onChange={(e) => setAccommodationDescription(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="mealType">Type de repas *</label>
                                <input
                                    type="text"
                                    id="mealType"
                                    className="text-input"
                                    value={mealType}
                                    onChange={(e) => setMealType(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    maxLength={100}
                                />
                                <small className="form-help">Ex: Demi-pension, Pension complète...</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="mealDescription">Description des repas *</label>
                                <textarea
                                    id="mealDescription"
                                    className="text-area"
                                    value={mealDescription}
                                    onChange={(e) => setMealDescription(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    rows={2}
                                    maxLength={300}
                                />
                            </div>
                        </fieldset>

                        <menu type="toolbar" className="form-actions">
                            <button 
                                type="submit" 
                                className="btn-success action-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting 
                                    ? 'En cours...' 
                                    : editingStayStepId 
                                        ? 'Enregistrer les modifications' 
                                        : 'Ajouter l\'étape'
                                }
                            </button>
                            
                            {editingStayStepId && (
                                <button 
                                    type="button"
                                    className="btn-danger action-button"
                                    onClick={resetForm}
                                    disabled={isSubmitting}
                                >
                                    Annuler la modification
                                </button>
                            )}
                        </menu>
                    </form>
                </section>

                <footer className="step-edit-footer">
                    <button 
                        className="btn-primary action-button"
                        onClick={() => setIsEditing(false)}
                        disabled={isSubmitting}
                    >
                        Terminer
                    </button>
                </footer>
            </section>
        );
    };

    return (
        <article className="step-management">
            {isEditing ? renderEditMode() : renderViewMode()}
        </article>
    );
};

export default StayStepTest;