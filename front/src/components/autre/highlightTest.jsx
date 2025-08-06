import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateStayStore } from '../../slices/staySlice';
import { getHighlightsByStayId } from '../../api/publicApi';
import { createHighlight, deleteHighlight, updateHighlight } from '../../api/admin/highlight';
import { validateHighlightForm } from '../../utils/validatehighlight';
// @ts-ignore
import { decodeHTML } from '../../utils/decodeHTML';

const HighlightTest = ({ stay, onUpdate }) => {
    const dispatch = useDispatch();
    const stayId = stay.id;
    const [stayHighlights, setStayHighlights] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingHighlightId, setEditingHighlightId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // États pour les champs du formulaire
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    // Référence pour suivre si c'est la première fois que le composant est monté
    const isInitialMount = useRef(true);

    // Récupération des points forts
    useEffect(() => {
        getHighlightsByStayId(stayId)
            .then((res) => {
                if (res.status === 200) {
                    setStayHighlights(res.highlights || []);
                } else {
                    setMessage({ type: 'error', text: 'Erreur lors du chargement des points forts' });
                }
            })
            .catch((err) => {
                console.error('Erreur lors du chargement des points forts:', err);
                setMessage({ type: 'error', text: 'Impossible de récupérer les points forts du séjour' });
            });
    }, [stayId]);

    // Effacer le message après 3 secondes
    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [message]);
    
    // Effet pour animer le changement de titre lors du basculement entre ajout/modification
    useEffect(() => {
        // Ne pas exécuter l'animation au premier montage
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        
        // Si on est en mode édition
        if (isEditing) {
            // Sélectionner les titres
            const addTitle = document.querySelector('.form-title.title-add');
            const editTitle = document.querySelector('.form-title.title-edit');
            
            if (!addTitle || !editTitle) return;
            
            // Fonction d'animation
            const animateTitleChange = () => {
                // Ajouter les classes d'entrée
                if (editingHighlightId) {
                    editTitle.classList.add('title-entering');
                } else {
                    addTitle.classList.add('title-entering');
                }
                
                // Après un délai court, déclencher l'animation
                setTimeout(() => {
                    if (editingHighlightId) {
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
            
            // Exécuter l'animation
            animateTitleChange();
        }
    }, [editingHighlightId, isEditing]);

    // Gestion de l'édition d'un point fort existant
    const handleEditHighlight = (highlight) => {
        setEditingHighlightId(highlight.id);
        setTitle(highlight.title);
        setDescription(highlight.description);
        
        // Après avoir rempli les champs, faire défiler jusqu'au formulaire
        setTimeout(() => {
            const formElement = document.querySelector('.highlight-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Ajout/modification d'un point fort
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        // Validation du formulaire
        const fieldsToValidate = [
            { name: 'title', field: 'title', value: title },
            { name: 'description', field: 'description', value: description }
        ];

        const validationErrors = validateHighlightForm(fieldsToValidate);

        if (validationErrors.length > 0) {
            setMessage({ type: 'error', text: validationErrors.join(', ') });
            setIsSubmitting(false);
            return;
        }

        // Si on modifie un point fort existant
        if (editingHighlightId) {
            const updatedHighlight = { title, description };

            updateHighlight(editingHighlightId, updatedHighlight)
                .then((res) => {
                    if (res.status === 200) {
                        // Mettre à jour localement le state
                        setStayHighlights((prevHighlights) =>
                            prevHighlights.map((highlight) =>
                                highlight.id === editingHighlightId 
                                    ? { ...highlight, ...updatedHighlight } 
                                    : highlight
                            )
                        );

                        setMessage({ type: 'success', text: 'Point fort modifié avec succès' });
                        
                        // Réinitialisation
                        resetForm();

                        // Notifier le parent si nécessaire
                        if (onUpdate) onUpdate(stay);
                    } else {
                        setMessage({ type: 'error', text: res.msg || 'Erreur lors de la mise à jour' });
                    }
                })
                .catch((err) => {
                    console.error('Erreur lors de la mise à jour:', err);
                    setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du point fort' });
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        } 
        // Si on crée un nouveau point fort
        else {
            const newHighlight = { 
                title, 
                description, 
                stay_id: parseInt(stayId, 10) 
            };

            createHighlight(newHighlight)
                .then((res) => {
                    if (res.status === 200) {
                        // Ajouter le nouveau point fort à la liste
                        setStayHighlights((prevHighlights) => [
                            ...prevHighlights, 
                            res.hightlight // Note: attention à la faute de frappe dans l'API
                        ]);

                        setMessage({ type: 'success', text: 'Point fort ajouté avec succès' });
                        
                        // Réinitialisation
                        resetForm();

                        // Notifier le parent si nécessaire
                        if (onUpdate) onUpdate(stay);
                    } else {
                        setMessage({ type: 'error', text: res.msg || 'Erreur lors de la création' });
                    }
                })
                .catch((err) => {
                    console.error('Erreur lors de la création:', err);
                    setMessage({ type: 'error', text: 'Erreur lors de la création du point fort' });
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    };

    // Suppression d'un point fort
    const handleDeleteHighlight = (highlightId) => {
        // Demander confirmation avant suppression
        if (!window.confirm("Voulez-vous vraiment supprimer ce point fort ?")) {
            return;
        }

        setIsSubmitting(true);

        deleteHighlight(highlightId)
            .then((res) => {
                if (res.status === 200) {
                    // Supprimer le point fort de la liste
                    setStayHighlights((prevHighlights) => 
                        prevHighlights.filter((highlight) => highlight.id !== highlightId)
                    );

                    setMessage({ type: 'success', text: 'Point fort supprimé avec succès' });

                    // Si on était en train de modifier ce point fort, annuler l'édition
                    if (editingHighlightId === highlightId) {
                        resetForm();
                    }

                    // Notifier le parent si nécessaire
                    if (onUpdate) onUpdate(stay);
                } else {
                    setMessage({ type: 'error', text: res.msg || 'Erreur lors de la suppression' });
                }
            })
            .catch((err) => {
                console.error('Erreur lors de la suppression:', err);
                setMessage({ type: 'error', text: 'Erreur lors de la suppression du point fort' });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Réinitialisation du formulaire
    const resetForm = () => {
        setTitle('');
        setDescription('');
        setEditingHighlightId(null);
    };

    // Mode affichage simple
    const renderViewMode = () => (
        <section className="highlight-view-mode">
            <header className="highlight-header">
                <h3>Points forts du séjour</h3>
                
                {stayHighlights && stayHighlights.length > 0 ? (
                    <ul className="highlight-list">
                        {stayHighlights.map((highlight) => (
                            <li key={highlight.id} className="highlight-item">
                                <strong className="highlight-title">{decodeHTML(highlight.title)}</strong>
                                <span className="highlight-description">{decodeHTML(highlight.description)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-message">Aucun point fort associé à ce séjour.</p>
                )}
            </header>

            <aside className="highlight-action">
                <button 
                    className="btn-primary action-button"
                    onClick={() => setIsEditing(true)}
                    aria-label="Gérer les points forts"
                >
                    Modifier
                </button>
            </aside>
        </section>
    );

    // Mode édition
    const renderEditMode = () => {
        // Déterminer quel mode est actif pour l'animation du titre
        const isAddMode = !editingHighlightId;
        const isEditMode = !!editingHighlightId;
        
        return (
            <section className="highlight-edit-mode">
                <header className="section-header">
                    <h3>Gestion des points forts du séjour</h3>
                </header>

                {message.text && (
                    <aside 
                        className={`alert alert-${message.type === 'error' ? 'danger' : message.type}`}
                        role="alert"
                    >
                        {message.text}
                    </aside>
                )}

                <section className="highlight-list-section">
                    <h4>Points forts existants</h4>
                    
                    {stayHighlights && stayHighlights.length > 0 ? (
                        <ul className="highlight-edit-list">
                            {stayHighlights.map((highlight) => (
                                <li 
                                    key={highlight.id} 
                                    className={`highlight-edit-item ${highlight.id === editingHighlightId ? 'active-edit' : ''}`}
                                >
                                    <article className="highlight-content">
                                        <strong className="highlight-title">{decodeHTML(highlight.title)}</strong>
                                        <span className="highlight-description">{decodeHTML(highlight.description)}</span>
                                    </article>
                                    <menu type="toolbar" className="highlight-actions">
                                        <button 
                                            type="button"
                                            className={`btn-outline-primary btn-sm ${highlight.id === editingHighlightId ? 'active' : ''}`}
                                            onClick={() => handleEditHighlight(highlight)}
                                            disabled={isSubmitting}
                                            aria-label={`Modifier ${highlight.title}`}
                                        >
                                            {highlight.id === editingHighlightId ? 'En cours d\'édition' : 'Modifier'}
                                        </button>
                                        <button 
                                            type="button"
                                            className="btn-danger btn-sm"
                                            onClick={() => handleDeleteHighlight(highlight.id)}
                                            disabled={isSubmitting}
                                            aria-label={`Supprimer ${highlight.title}`}
                                        >
                                            Supprimer
                                        </button>
                                    </menu>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-message">Aucun point fort associé à ce séjour.</p>
                    )}
                </section>

                <section className="highlight-form-section">
                    <header className="form-title-container">
                        <h4 id="add-title" className={`form-title title-add ${isAddMode ? 'title-visible' : 'title-hidden'}`}>
                            Ajouter un nouveau point fort
                        </h4>
                        <h4 id="edit-title" className={`form-title title-edit ${isEditMode ? 'title-visible' : 'title-hidden'}`}>
                            Modifier le point fort
                        </h4>
                    </header>
                    
                    <form 
                        onSubmit={handleSubmit} 
                        className={`highlight-form ${editingHighlightId ? 'is-editing' : ''}`}
                        aria-labelledby={isAddMode ? "add-title" : "edit-title"}
                    >
                        <span className="editing-indicator" aria-live="polite">
                            Mode modification
                        </span>
                        
                        <fieldset>
                            <legend>Informations du point fort</legend>
                            <div className="form-group">
                                <label htmlFor="title">Titre</label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Accompagnement par un guide"
                                    disabled={isSubmitting}
                                    className="text-input"
                                    maxLength={100}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ex: Notre guide certifié vous accompagne tout au long du séjour"
                                    disabled={isSubmitting}
                                    className="text-area"
                                    rows={3}
                                    maxLength={255}
                                    required
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
                                    : editingHighlightId 
                                        ? 'Enregistrer les modifications' 
                                        : 'Ajouter le point fort'
                                }
                            </button>
                            
                            {editingHighlightId && (
                                <button 
                                    type="button"
                                    className="btn-outline-danger action-button"
                                    onClick={resetForm}
                                    disabled={isSubmitting}
                                >
                                    Annuler la modification
                                </button>
                            )}
                        </menu>
                    </form>
                </section>

                <footer className="edit-footer">
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
        <article className="highlight-management">
            {isEditing ? renderEditMode() : renderViewMode()}
        </article>
    );
};

export default HighlightTest;