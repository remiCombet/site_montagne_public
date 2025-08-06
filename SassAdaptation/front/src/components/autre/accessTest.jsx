import { useState, useEffect, useRef } from 'react';
import { addStayAccess, createAccess, updateAccess, deleteAccess, removeAccessFromStay, checkAccessUsage } from '../../api/admin/access';
import { getAllAccesses, getAllStayAccess } from '../../api/publicApi';
import { validateAccess } from '../../utils/validateAccess';
import { decodeHTML } from '../../utils/decodeHtml';

const AccessTest = ({ stay, onUpdate, onMessage }) => {
    const stayId = stay.id;
    const [allAccesses, setAllAccesses] = useState([]);
    const [stayAccesses, setStayAccesses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAccessId, setEditingAccessId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // États pour les champs du formulaire
    const [category, setCategory] = useState("");
    const [informations, setInformations] = useState("");
    
    const isInitialMount = useRef(true);

    // Chargement des données
    useEffect(() => {
        loadAccesses();
    }, [stayId]);

    const loadAccesses = () => {
        getAllAccesses()
            .then((res) => {
                if (res.status === 200) {
                    setAllAccesses(res.access);
                }
            })
            .catch((err) => {
                onMessage({ type: "error", text: "Erreur lors de la récupération des accès." });
                console.error(err);
            });

        getAllStayAccess(stayId)
            .then((res) => {
                setStayAccesses(res.accesses);
            })
            .catch((err) => {
                onMessage({ type: "error", text: "Erreur lors de la récupération des accès du séjour." });
                console.error(err);
            });
    };

    // Animation pour le changement de titre du formulaire
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
                if (editingAccessId) {
                    editTitle.classList.add('title-entering');
                } else {
                    addTitle.classList.add('title-entering');
                }
                
                setTimeout(() => {
                    if (editingAccessId) {
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
    }, [editingAccessId, isEditing]);

    // Réinitialisation du formulaire
    const resetForm = () => {
        setCategory("");
        setInformations("");
        setEditingAccessId(null);
    };

    // Ajouter un accès existant au séjour
    const handleAddAccess = (accessId) => {
        setIsSubmitting(true);
        onMessage({ type: "", text: "" });
        
        // Vérifier si l'accès est déjà associé au séjour
        if (Array.isArray(stayAccesses) && stayAccesses.some(access => access.id === accessId)) {
            onMessage({ type: "error", text: "Cet accès est déjà ajouté au séjour." });
            setIsSubmitting(false);
            return;
        }
    
        // Trouver l'accès complet dans allAccesses
        const accessToAdd = allAccesses.find(access => access.id === accessId);
        if (!accessToAdd) {
            setIsSubmitting(false);
            return;
        }
    
        // Ajout de l'accès au séjour
        addStayAccess(stayId, accessId)
            .then((res) => {
                if (res.status === 201) {
                    // Créer un nouvel objet d'accès avec toutes les informations nécessaires
                    const newAccess = {
                        id: accessId,
                        category: accessToAdd.category,
                        informations: accessToAdd.informations,
                        stayAccessId: res.access.id
                    };
                    
                    setStayAccesses(prevAccesses => [...(prevAccesses || []), newAccess]);
                    onMessage({ type: "success", text: "Accès ajouté avec succès !" });
                    
                    if (onUpdate) onUpdate(stay);
                } else {
                    onMessage({ type: "error", text: res.msg || "Erreur lors de l'ajout de l'accès." });
                }
            })
            .catch((err) => {
                onMessage({ type: "error", text: "Erreur lors de l'ajout de l'accès." });
                console.error("Erreur lors de l'ajout de l'accès :", err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Création d'un nouvel accès
    const handleCreateAccess = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        onMessage({ type: "", text: "" });
        
        // Validation du formulaire
        const accessFields = [
            { name: "category", value: category },
            { name: "informations", value: informations }
        ];

        const errors = validateAccess(accessFields);
        if (errors.length > 0) {
            onMessage({ type: "error", text: errors.join(", ") });
            setIsSubmitting(false);
            return;
        }
        
        const accessData = {
            category,
            informations
        };
    
        createAccess(accessData)
            .then((res) => {
                if (res.status === 200) {
                    // Mise à jour de allAccesses
                    setAllAccesses(prevAccesses => [...prevAccesses, res.access]);
                    
                    return addStayAccess(stayId, res.access.id)
                        .then((stayAccessRes) => {
                            
                            if (stayAccessRes.status === 201) {
                                // Construction du nouvel accès
                                const newAccess = {
                                    id: res.access.id,
                                    category: res.access.category,
                                    informations: res.access.informations,
                                    stayAccessId: stayAccessRes.access.id
                                };
                                
                                // Mise a jour de stayAccesses
                                setStayAccesses(prevAccesses => {
                                    const updated = Array.isArray(prevAccesses) ? 
                                        [...prevAccesses, newAccess] : 
                                        [newAccess];
                                    return updated;
                                });
                                
                                onMessage({ type: "success", text: "Accès créé et ajouté avec succès !" });
                                resetForm();
                                
                                if (onUpdate) onUpdate(stay);
                                return;
                            } else {
                                throw new Error(stayAccessRes.msg || "Erreur lors de l'ajout de l'accès");
                            }
                        });
                }
                throw new Error("Erreur lors de la création de l'accès");
            })
            .catch((err) => {
                console.error('Erreur:', err);
                onMessage({ type: "error", text: err.message || "Erreur lors de la création." });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Modification d'un accès existant
    const handleUpdateAccess = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        onMessage({ type: "", text: "" });

        const accessFields = [
            { name: "category", value: category },
            { name: "informations", value: informations }
        ];

        const errors = validateAccess(accessFields);
        if (errors.length > 0) {
            onMessage({ type: "error", text: errors.join(", ") });
            setIsSubmitting(false);
            return;
        }

        try {
            const accessData = {
                category,
                informations
            };

            const res = await updateAccess(editingAccessId, accessData);
            if (res.status === 200) {
                // Mettre à jour les deux listes (allAccesses et stayAccesses)
                setAllAccesses(prevAccesses =>
                    prevAccesses.map(access =>
                        access.id === editingAccessId
                            ? { ...access, ...accessData }
                            : access
                    )
                );
                
                setStayAccesses(prevAccesses =>
                    prevAccesses.map(access =>
                        access.id === editingAccessId
                            ? { ...access, ...accessData }
                            : access
                    )
                );
                
                onMessage({ type: "success", text: "Accès modifié avec succès !" });
                resetForm();
                
                if (onUpdate) onUpdate(stay);
            } else {
                onMessage({ type: "error", text: "Erreur lors de la modification de l'accès." });
            }
        } catch (err) {
            console.error(err);
            onMessage({ type: "error", text: "Erreur lors de la modification." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Suppression d'un accès existant
    const handleDeleteAccess = async (accessId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet accès ?")) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Vérifier d'abord si l'accès est utilisé ailleurs
            const usageCheck = await checkAccessUsage(accessId);
            
            if (usageCheck.status === 200) {
                if (usageCheck.isUsed) {
                    // Si l'accès est utilisé, afficher un message avec les séjours concernés
                    const staysList = usageCheck.usages
                        .map(u => u.stayTitle)
                        .join(', ');
                    
                    onMessage({ 
                        type: "error", 
                        text: `Impossible de supprimer cet accès car il est utilisé dans les séjours suivants : ${staysList}` 
                    });
                    setIsSubmitting(false);
                    return;
                }
                
                // Si l'accès n'est pas utilisé ailleurs, procéder à la suppression
                const res = await deleteAccess(accessId);
                if (res.status === 200) {
                    setAllAccesses(prevAccesses => 
                        prevAccesses.filter(access => access.id !== accessId)
                    );
                    onMessage({ 
                        type: "success", 
                        text: "Accès supprimé avec succès !" 
                    });
                    
                    // Si on supprimait celui en cours d'édition
                    if (editingAccessId === accessId) {
                        resetForm();
                    }
                    
                    if (onUpdate) onUpdate(stay);
                } else {
                    onMessage({ 
                        type: "error", 
                        text: "Erreur lors de la suppression de l'accès." 
                    });
                }
            }
        } catch (err) {
            console.error(err);
            onMessage({ 
                type: "error", 
                text: "Erreur lors de la vérification/suppression de l'accès." 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Retirer un accès du séjour (sans le supprimer de la base)
    const handleRemoveAccess = (accessId) => {
        setIsSubmitting(true);
        onMessage({ type: "", text: "" });
        
        removeAccessFromStay(stayId, accessId)
            .then((res) => {
                if (res.status === 200) {
                    setStayAccesses(prevAccesses => prevAccesses.filter(access => access.id !== accessId));
                    onMessage({ type: "success", text: "Accès retiré avec succès !" });
                    
                    if (onUpdate) onUpdate(stay);
                } else {
                    onMessage({ type: "error", text: res.msg || "Erreur lors du retrait de l'accès." });
                }
            })
            .catch((err) => {
                onMessage({ type: "error", text: "Erreur lors du retrait de l'accès." });
                console.error("Erreur lors du retrait de l'accès :", err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Éditer un accès existant
    const handleEditAccess = (access) => {
        setEditingAccessId(access.id);
        setCategory(access.category);
        setInformations(access.informations);
        
        // Scroll vers le formulaire
        setTimeout(() => {
            const formElement = document.querySelector('.access-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Rendu du mode visualisation
    const renderViewMode = () => (
        <section className="access-view-mode">
            <header className="access-header">
                <h3>Accès au séjour</h3>
                
                {stayAccesses && stayAccesses.length > 0 ? (
                    <ul className="access-list">
                        {stayAccesses.map((access) => (
                            <li key={access.id} className="access-item">
                                <strong className="access-category">{decodeHTML(access.category)}</strong>
                                <span className="access-informations">{decodeHTML(access.informations)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-message">Aucun accès associé à ce séjour.</p>
                )}
            </header>

            <aside className="access-action">
                <button 
                    className="btn-primary action-button"
                    onClick={() => setIsEditing(true)}
                    aria-label="Gérer les accès"
                >
                    Modifier
                </button>
            </aside>
        </section>
    );

    // Rendu du mode édition
    const renderEditMode = () => {
        const isAddMode = !editingAccessId;
        const isEditMode = !!editingAccessId;
        
        return (
            <section className="access-edit-mode">
                <header className="section-header">
                    <h3>Gestion des accès du séjour</h3>
                </header>
                
                <section className="access-section">
                    <h4>Accès actuels du séjour</h4>
                    {stayAccesses && stayAccesses.length > 0 ? (
                        <ul className="access-list with-actions">
                            {stayAccesses.map((access) => (
                                <li key={access.id} className={`access-item ${access.id === editingAccessId ? 'active-edit' : ''}`}>
                                    <div className="access-content">
                                        <strong className="access-category">{decodeHTML(access.category)}</strong>
                                        <span className="access-informations">{decodeHTML(access.informations)}</span>
                                    </div>
                                    <menu type="toolbar" className="access-actions">
                                        <button 
                                            className={`btn-outline-primary btn-sm ${access.id === editingAccessId ? 'active' : ''}`}
                                            onClick={() => handleEditAccess(access)}
                                            disabled={isSubmitting}
                                        >
                                            {access.id === editingAccessId ? 'En cours d\'édition' : 'Modifier'}
                                        </button>
                                        <button 
                                            className="btn-outline-danger btn-sm"
                                            onClick={() => handleRemoveAccess(access.id)}
                                            disabled={isSubmitting}
                                        >
                                            Enlever
                                        </button>
                                    </menu>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-message">Aucun accès associé à ce séjour.</p>
                    )}
                </section>

                <section className="access-section">
                    <h4>Accès disponibles</h4>
                    {allAccesses.filter(access => !stayAccesses.some(sa => sa.id === access.id)).length > 0 ? (
                        <ul className="access-list with-actions">
                            {allAccesses.filter(access => !stayAccesses.some(sa => sa.id === access.id)).map((access) => (
                                <li key={access.id} className="access-item">
                                    <div className="access-content">
                                        <strong className="access-category">{decodeHTML(access.category)}</strong>
                                        <span className="access-informations">{decodeHTML(access.informations)}</span>
                                    </div>
                                    <menu type="toolbar" className="access-actions">
                                        <button 
                                            className="btn-success btn-sm"
                                            onClick={() => handleAddAccess(access.id)}
                                            disabled={isSubmitting}
                                        >
                                            Ajouter
                                        </button>
                                        <button 
                                            className="btn-outline-danger btn-sm"
                                            onClick={() => handleDeleteAccess(access.id)}
                                            disabled={isSubmitting}
                                        >
                                            Supprimer
                                        </button>
                                    </menu>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-message">Tous les accès disponibles sont déjà associés à ce séjour.</p>
                    )}
                </section>

                <section className="access-form-section">
                    <header className="form-title-container">
                        <h4 id="add-title" className={`form-title title-add ${isAddMode ? 'title-visible' : 'title-hidden'}`}>
                            Créer un nouvel accès
                        </h4>
                        <h4 id="edit-title" className={`form-title title-edit ${isEditMode ? 'title-visible' : 'title-hidden'}`}>
                            Modifier l'accès
                        </h4>
                    </header>
                    
                    <form 
                        className={`access-form ${editingAccessId ? 'is-editing' : ''}`}
                        onSubmit={editingAccessId ? handleUpdateAccess : handleCreateAccess}
                        aria-labelledby={isAddMode ? "add-title" : "edit-title"}
                    >
                        <span className="editing-indicator" aria-live="polite">
                            Mode modification
                        </span>
                        
                        <fieldset>
                            <legend>Informations de l'accès</legend>
                            
                            <div className="form-group">
                                <label htmlFor="category">Type de transport *</label>
                                <input
                                    id="category"
                                    type="text"
                                    className="text-input"
                                    placeholder="Ex: Train, Bus, Voiture..."
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    maxLength={100}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="informations">Informations détaillées *</label>
                                <textarea
                                    id="informations"
                                    className="text-area"
                                    placeholder="Ex: Gare la plus proche à 5km du départ..."
                                    value={informations}
                                    onChange={(e) => setInformations(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                        </fieldset>

                        <menu type="toolbar" className="form-actions">
                            <button 
                                type="submit"
                                className="btn-success action-button"
                                disabled={!category.trim() || !informations.trim() || isSubmitting}
                            >
                                {isSubmitting 
                                    ? 'En cours...' 
                                    : editingAccessId 
                                        ? 'Enregistrer' 
                                        : 'Créer l\'accès'
                                }
                            </button>
                            
                            {editingAccessId && (
                                <button 
                                    type="button"
                                    className="btn-danger action-button"
                                    onClick={resetForm}
                                    disabled={isSubmitting}
                                >
                                    Annuler
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
        <article className="access-management">
            {isEditing ? renderEditMode() : renderViewMode()}
        </article>
    );
};

export default AccessTest;