import { useEffect, useState, useRef } from 'react';
import { getStayEquipmentsByStayId, getStayToPrepareByStayId } from '../../api/publicApi';
import { addStayEquipment, removeStayEquipment } from '../../api/admin/stayEquipment';
import { addStayToPrepare, removeStayToPrepare } from '../../api/admin/stayPreparation';
import { getAllCategories, createCategory } from '../../api/admin/category';
import { validateCategory } from '../../utils/validateCategory';

const EquipmentsTest = ({ stay, onUpdate }) => {
    const [equipmentsProvided, setEquipmentsProvided] = useState([]);
    const [equipmentsToPrepare, setEquipmentsToPrepare] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('provided');
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [newCategory, setNewCategory] = useState({ 
        type: 'vêtement',
        name: '', 
        description: '' 
    });
    const [availableTypes, setAvailableTypes] = useState([]);
    const [showNewType, setShowNewType] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (!stay?.id) return;
        loadData();
    }, [stay]);

    // Chargement initial des données
    const loadData = () => {
        setIsSubmitting(true);
        
        Promise.all([
            getAllCategories(),
            getStayEquipmentsByStayId(stay.id),
            getStayToPrepareByStayId(stay.id)
        ])
        .then(([categoriesRes, providedRes, toPrepareRes]) => {
            if (categoriesRes?.status === 200 && Array.isArray(categoriesRes.category)) {
                setAllCategories(categoriesRes.category);
                const types = [...new Set(categoriesRes.category.map(cat => cat.type))];
                setAvailableTypes(types);
                if (types.length > 0 && !newCategory.type) {
                    setNewCategory(prev => ({ ...prev, type: types[0] }));
                }
            } else {
                setAllCategories([]);
            }
            
            if (providedRes?.status === 200 && Array.isArray(providedRes.equipments)) {
                setEquipmentsProvided(providedRes.equipments);
            } else {
                setEquipmentsProvided([]);
            }
            
            if (toPrepareRes?.status === 200 && Array.isArray(toPrepareRes.equipments)) {
                setEquipmentsToPrepare(toPrepareRes.equipments);
            } else {
                setEquipmentsToPrepare([]);
            }
        })
        .catch(err => {
            console.error('Erreur chargement données:', err);
            setMessage({ type: "error", text: "Erreur lors du chargement des données" });
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    // Gérer les messages temporaires
    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [message]);

    // Chargement des équipements
    const loadEquipments = () => {
        if (!stay?.id) return;
        setIsSubmitting(true);
        
        Promise.all([
            getStayEquipmentsByStayId(stay.id),
            getStayToPrepareByStayId(stay.id)
        ])
        .then(([providedRes, toPrepareRes]) => {
            if (providedRes?.status === 200 && Array.isArray(providedRes.equipments)) {
                setEquipmentsProvided(providedRes.equipments);
            } else {
                setEquipmentsProvided([]);
            }
            
            if (toPrepareRes?.status === 200 && Array.isArray(toPrepareRes.equipments)) {
                setEquipmentsToPrepare(toPrepareRes.equipments);
            } else {
                setEquipmentsToPrepare([]);
            }
        })
        .catch(err => {
            console.error('Erreur rechargement équipements:', err);
            setMessage({ type: "error", text: "Erreur lors du rechargement des équipements" });
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    // Obtenir les catégories disponibles (non utilisées)
    const getAvailableCategories = () => {
        if (!Array.isArray(allCategories)) {
            return [];
        }
    
        const providedIds = Array.isArray(equipmentsProvided) 
            ? equipmentsProvided.flatMap(group => 
                group?.items?.map(item => item?.category_id) || []
              )
            : [];
    
        const prepareIds = Array.isArray(equipmentsToPrepare)
            ? equipmentsToPrepare.flatMap(group => 
                group?.items?.map(item => item?.category_id) || []
              )
            : [];
    
        const usedCategoryIds = new Set([...providedIds, ...prepareIds]);
    
        return allCategories.filter(category => !usedCategoryIds.has(category?.id));
    };

    // Ajouter un équipement au séjour
    const handleAddEquipment = (categoryId, type) => {
        if (!stay?.id || !categoryId) {
            setMessage({ type: "error", text: "Paramètres invalides" });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: "", text: "" });

        const apiCall = type === 'provided' 
            ? addStayEquipment(stay.id, categoryId)
            : addStayToPrepare(stay.id, categoryId);

        apiCall
            .then(res => {
                if (res.status === 200) {
                    setMessage({ 
                        type: "success", 
                        text: `Équipement ${type === 'provided' ? 'fourni' : 'à prévoir'} ajouté` 
                    });
                    loadEquipments();
                    
                    if (onUpdate) onUpdate(stay);
                } else {
                    setMessage({ 
                        type: "error", 
                        text: res.msg || "Erreur lors de l'ajout" 
                    });
                }
            })
            .catch(err => {
                console.error('Erreur ajout équipement:', err);
                setMessage({ type: "error", text: "Erreur lors de l'ajout de l'équipement" });
            })
            .finally(() => {
                setIsSubmitting(false);
                setSelectedEquipment('');
            });
    };

    // Créer une nouvelle catégorie d'équipement
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });
        
        const categoryFields = [
            { name: "type", value: newCategory.type },
            { name: "name", value: newCategory.name },
            { name: "description", value: newCategory.description }
        ];
    
        const errors = validateCategory(categoryFields);
        if (errors.length > 0) {
            setMessage({ type: "error", text: errors.join(", ") });
            setIsSubmitting(false);
            return;
        }
    
        try {
            const res = await createCategory(newCategory);
    
            if (res.status === 200) {
                setMessage({ type: "success", text: "Catégorie créée avec succès" });
                // Réinitialiser le formulaire avec le type par défaut
                setNewCategory({ type: availableTypes[0] || 'vêtement', name: '', description: '' });
                setShowCategoryForm(false);
                setShowNewType(false);
                
                // Recharger les catégories
                const categoriesRes = await getAllCategories();
                if (categoriesRes?.status === 200) {
                    setAllCategories(categoriesRes.category);
                    // Mettre à jour les types disponibles
                    const types = [...new Set(categoriesRes.category.map(cat => cat.type))];
                    setAvailableTypes(types);
                }
                
                if (onUpdate) onUpdate(stay);
            } else {
                setMessage({ type: "error", text: res.msg || "Erreur lors de la création" });
            }
        } catch (err) {
            console.error('Erreur création catégorie:', err);
            setMessage({ type: "error", text: "Erreur lors de la création de la catégorie" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Supprimer un équipement du séjour
    const handleRemoveEquipment = (itemId, type) => {    
        if (!stay?.id || !itemId) {
            setMessage({ type: "error", text: "Paramètres invalides" });
            return;
        }
    
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });
    
        const apiCall = type === 'provided' 
            ? removeStayEquipment(stay.id, itemId)
            : removeStayToPrepare(stay.id, itemId);
    
        apiCall
            .then(res => {
                if (res.status === 200) {
                    setMessage({ 
                        type: "success", 
                        text: `Équipement ${type === 'provided' ? 'fourni' : 'à prévoir'} supprimé` 
                    });
                    loadEquipments();
                    
                    if (onUpdate) onUpdate(stay);
                } else {
                    setMessage({ 
                        type: "error", 
                        text: res.msg || "Erreur lors de la suppression" 
                    });
                }
            })
            .catch(err => {
                console.error('Erreur suppression équipement:', err);
                setMessage({ type: "error", text: "Erreur lors de la suppression" });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Rendu du mode visualisation
    const renderViewMode = () => {
        return (
            <section className="equipment-view-mode">
                <header className="equipment-header">
                    <h3>Équipements du séjour</h3>
                    
                    <nav className="equipment-tabs">
                        <button 
                            type="button"
                            className={`tab-button ${activeTab === 'provided' ? 'active' : ''}`}
                            onClick={() => setActiveTab('provided')}
                            aria-pressed={activeTab === 'provided'}
                        >
                            Équipements fournis
                        </button>
                        <button 
                            type="button"
                            className={`tab-button ${activeTab === 'toPrepare' ? 'active' : ''}`}
                            onClick={() => setActiveTab('toPrepare')}
                            aria-pressed={activeTab === 'toPrepare'}
                        >
                            À prévoir par le participant
                        </button>
                    </nav>
                    
                    <div className="equipment-content">
                        {activeTab === 'provided' ? (
                            equipmentsProvided && equipmentsProvided.length > 0 ? (
                                <ul className="equipment-list">
                                    {equipmentsProvided.map((group, index) => (
                                        <li key={`provided-${index}`} className="equipment-group">
                                            <h4 className="equipment-category">{group.category}</h4>
                                            <ul className="equipment-items">
                                                {group.items.map((item, i) => (
                                                    <li key={`provided-item-${i}`} className="equipment-item">
                                                        <span className="equipment-name">{item.category.name}</span>
                                                        <span className="equipment-desc">{item.category.description}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="empty-message">Aucun équipement fourni pour ce séjour.</p>
                            )
                        ) : (
                            equipmentsToPrepare && equipmentsToPrepare.length > 0 ? (
                                <ul className="equipment-list">
                                    {equipmentsToPrepare.map((group, index) => (
                                        <li key={`prepare-${index}`} className="equipment-group">
                                            <h4 className="equipment-category">{group.category}</h4>
                                            <ul className="equipment-items">
                                                {group.items.map((item, i) => (
                                                    <li key={`prepare-item-${i}`} className="equipment-item">
                                                        <span className="equipment-name">{item.category.name}</span>
                                                        <span className="equipment-desc">{item.category.description}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="empty-message">Aucun équipement à prévoir pour ce séjour.</p>
                            )
                        )}
                    </div>
                </header>

                <aside className="equipment-action">
                    <button 
                        className="btn-primary action-button"
                        onClick={() => setIsEditing(true)}
                        aria-label="Gérer les équipements"
                    >
                        Modifier
                    </button>
                </aside>
            </section>
        );
    };

    // Rendu du mode édition
    const renderEditMode = () => {
        const availableCategories = getAvailableCategories();
        const currentEquipments = activeTab === 'provided' ? equipmentsProvided : equipmentsToPrepare;
        
        return (
            <section className="equipment-edit-mode">
                <header className="section-header">
                    <h3>Gestion des équipements du séjour</h3>
                </header>
                
                {message.text && (
                    <aside 
                        className={`alert alert-${message.type === 'error' ? 'danger' : message.type}`}
                        role="alert"
                    >
                        {message.text}
                    </aside>
                )}

                <nav className="equipment-tabs">
                    <button 
                        type="button"
                        className={`tab-button ${activeTab === 'provided' ? 'active' : ''}`}
                        onClick={() => setActiveTab('provided')}
                        disabled={isSubmitting}
                        aria-pressed={activeTab === 'provided'}
                    >
                        Équipements fournis
                    </button>
                    <button 
                        type="button"
                        className={`tab-button ${activeTab === 'toPrepare' ? 'active' : ''}`}
                        onClick={() => setActiveTab('toPrepare')}
                        disabled={isSubmitting}
                        aria-pressed={activeTab === 'toPrepare'}
                    >
                        À prévoir par le participant
                    </button>
                </nav>

                <section className="equipment-section">
                    <h4>
                        {activeTab === 'provided'
                            ? 'Équipements actuellement fournis'
                            : 'Équipements à prévoir par le participant'
                        }
                    </h4>
                    
                    {currentEquipments && currentEquipments.length > 0 ? (
                        <ul className="equipment-list with-actions">
                            {currentEquipments.map((group, index) => (
                                <li key={index} className="equipment-group">
                                    <h5 className="equipment-category">{group.category}</h5>
                                    <ul className="equipment-items">
                                        {group.items.map((item, i) => (
                                            <li key={i} className="equipment-item">
                                                <div className="equipment-content">
                                                    <span className="equipment-name">{item.category.name}</span>
                                                    <span className="equipment-desc">{item.category.description}</span>
                                                </div>
                                                <menu type="toolbar" className="equipment-actions">
                                                    <button 
                                                        type="button"
                                                        className="btn-outline-danger btn-sm"
                                                        onClick={() => handleRemoveEquipment(
                                                            item.category_id,
                                                            activeTab
                                                        )}
                                                        disabled={isSubmitting}
                                                        aria-label={`Supprimer ${item.category.name}`}
                                                    >
                                                        Supprimer
                                                    </button>
                                                </menu>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-message">
                            {activeTab === 'provided'
                                ? 'Aucun équipement fourni pour ce séjour.'
                                : 'Aucun équipement à prévoir pour ce séjour.'
                            }
                        </p>
                    )}
                </section>

                <section className="equipment-selection-section">
                    <h4>Ajouter un équipement</h4>
                    
                    {availableCategories.length > 0 ? (
                        <div className="equipment-selector">
                            <div className="form-group">
                                <label htmlFor="equipmentSelect" className="visually-hidden">
                                    Sélectionner un équipement à ajouter
                                </label>
                                <div className="input-group">
                                    <select 
                                        id="equipmentSelect"
                                        value={selectedEquipment}
                                        onChange={(e) => setSelectedEquipment(e.target.value)}
                                        disabled={isSubmitting}
                                        className="equipment-select"
                                    >
                                        <option value="">Sélectionner un équipement...</option>
                                        {availableCategories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.type.toUpperCase()} - {category.name}: {category.description}
                                            </option>
                                        ))}
                                    </select>
                                    <button 
                                        type="button"
                                        className="btn-success"
                                        onClick={() => {
                                            if (selectedEquipment) {
                                                handleAddEquipment(Number(selectedEquipment), activeTab);
                                            }
                                        }}
                                        disabled={!selectedEquipment || isSubmitting}
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="info-message">
                            Tous les équipements disponibles ont déjà été ajoutés.
                            Créez une nouvelle catégorie d'équipement ci-dessous.
                        </p>
                    )}
                </section>

                <section className="equipment-form-section">
                    <header className="form-header">
                        <h4>
                            {showCategoryForm ? 'Créer une nouvelle catégorie d\'équipement' : ''}
                        </h4>
                        <button 
                            type="button"
                            className={`btn-${showCategoryForm ? 'outline-danger' : 'outline-primary'}`}
                            onClick={() => setShowCategoryForm(!showCategoryForm)}
                            disabled={isSubmitting}
                        >
                            {showCategoryForm ? 'Annuler' : 'Créer une nouvelle catégorie'}
                        </button>
                    </header>
                    
                    {showCategoryForm && (
                        <form 
                            className="equipment-form"
                            onSubmit={handleCreateCategory}
                        >
                            <fieldset>
                                <legend>Informations de la catégorie</legend>
                                
                                <div className="form-group">
                                    <label htmlFor="categoryType">Type *</label>
                                    <div className="type-selection">
                                        {!showNewType ? (
                                            <select
                                                id="categoryType"
                                                value={newCategory.type}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value === "new") {
                                                        setShowNewType(true);
                                                        setNewCategory(prev => ({ ...prev, type: '' }));
                                                    } else {
                                                        setNewCategory(prev => ({ ...prev, type: value }));
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                                required
                                                className="text-input"
                                            >
                                                {availableTypes.map(type => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                                <option value="new">Nouveau type...</option>
                                            </select>
                                        ) : (
                                            <div className="new-type-input">
                                                <input
                                                    type="text"
                                                    placeholder="Entrez un nouveau type"
                                                    value={newCategory.type}
                                                    onChange={(e) => setNewCategory(prev => ({
                                                        ...prev,
                                                        type: e.target.value
                                                    }))}
                                                    disabled={isSubmitting}
                                                    required
                                                    className="text-input"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn-outline-secondary btn-sm"
                                                    onClick={() => {
                                                        setShowNewType(false);
                                                        setNewCategory(prev => ({ 
                                                            ...prev, 
                                                            type: availableTypes[0] || 'vêtement'
                                                        }));
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="categoryName">Nom *</label>
                                    <input
                                        id="categoryName"
                                        type="text"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory(prev => ({
                                            ...prev,
                                            name: e.target.value
                                        }))}
                                        placeholder="Ex: Chaussures de randonnée"
                                        disabled={isSubmitting}
                                        required
                                        maxLength={100}
                                        className="text-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="categoryDescription">Description *</label>
                                    <input
                                        id="categoryDescription"
                                        type="text"
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory(prev => ({
                                            ...prev,
                                            description: e.target.value
                                        }))}
                                        placeholder="Ex: Montantes et imperméables"
                                        disabled={isSubmitting}
                                        required
                                        maxLength={255}
                                        className="text-input"
                                    />
                                </div>
                            </fieldset>

                            <menu type="toolbar" className="form-actions">
                                <button 
                                    type="submit"
                                    className="btn-success action-button"
                                    disabled={!newCategory.type.trim() || 
                                            !newCategory.name.trim() || 
                                            !newCategory.description.trim() || 
                                            isSubmitting}
                                >
                                    {isSubmitting ? 'En cours...' : 'Créer la catégorie'}
                                </button>
                            </menu>
                        </form>
                    )}
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
        <article className="equipment-management">
            {isEditing ? renderEditMode() : renderViewMode()}
        </article>
    );
};

export default EquipmentsTest;