import { useEffect, useState } from 'react';
import { getStayEquipmentsByStayId, getStayToPrepareByStayId } from '../../api/publicApi';
import { addStayEquipment, removeStayEquipment } from '../../api/admin/stayEquipment';
import { addStayToPrepare, removeStayToPrepare } from '../../api/admin/stayPreparation';
import { getAllCategories, createCategory } from '../../api/admin/category';
import { validateCategory } from '../../utils/validateCategory';

const EquipmentsTest = ({ stay, onClose }) => {
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
 
    // Gestion de la fermeture en cliquant en dehors
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            onClose();
        }
    };

    useEffect(() => {
        if (!stay?.id) return;
    
        Promise.all([
            getAllCategories(),
            getStayEquipmentsByStayId(stay.id),
            getStayToPrepareByStayId(stay.id)
        ])
        .then(([categoriesRes, providedRes, toPrepareRes]) => {
            console.log('Réponses API:', { categoriesRes, providedRes, toPrepareRes });
    
            if (categoriesRes?.status === 200 && Array.isArray(categoriesRes.category)) {
                setAllCategories(categoriesRes.category);
            } else {
                console.warn('Format de réponse categories:', categoriesRes);
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
            setMessage({ type: "error", text: "Erreur chargement des données" });
            setAllCategories([]);
            setEquipmentsProvided([]);
            setEquipmentsToPrepare([]);
        });
    }, [stay]);

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: ""});
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        loadUniqueTypes();
    }, []);

    const loadUniqueTypes = async () => {
        try {
            const res = await getAllCategories();
            if (res?.status === 200 && Array.isArray(res.category)) {
                const types = [...new Set(res.category.map(cat => cat.type))];
                setAvailableTypes(types);
                // Définir le premier type comme type par défaut s'il existe
                if (types.length > 0) {
                    setNewCategory(prev => ({ ...prev, type: types[0] }));
                }
            }
        } catch (err) {
            console.error('Erreur chargement des types:', err);
        }
    };

    const loadEquipments = () => {
        if (!stay?.id) return;
    
        Promise.all([
            getStayEquipmentsByStayId(stay.id),
            getStayToPrepareByStayId(stay.id)
        ])
        .then(([providedRes, toPrepareRes]) => {
            console.log('Rechargement des équipements:', { providedRes, toPrepareRes });
            
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
            setMessage({ type: "error", text: "Erreur lors du rechargement" });
        });
    };

    // Fonction pour obtenir les catégories disponibles
    const getAvailableCategories = () => {
        if (!Array.isArray(allCategories)) {
            console.warn('allCategories n\'est pas un tableau:', allCategories);
            return [];
        }
    
        // Vérifier si les tableaux d'équipements existent
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

    // fonction d'ajout d'un équipement
    const handleAddEquipment = (categoryId, type) => {
        console.log('handleAddEquipment appelé avec:', {
            stayId: stay?.id,
            categoryId,
            type
        });
        
        // Vérification que categoryId ou stayId n'est pas undefined
        if (!stay?.id || !categoryId) {
            console.warn('Paramètres invalides:', { stayId: stay?.id, categoryId });
            setMessage({ type: "error", text: "Paramètres invalides" });
            return;
        }

        // Définir quelle fonction d'API utiliser
        const apiCall = type === 'provided' 
        ? addStayEquipment(stay.id, categoryId)
        : addStayToPrepare(stay.id, categoryId);

        apiCall
            .then(res => {
                console.log('Réponse ajout équipement:', res);
                if (res.status === 200) {
                    setMessage({ 
                        type: "success", 
                        text: `Équipement ${type === 'provided' ? 'fourni' : 'à prévoir'} ajouté` 
                    });
                    // Recharger les données
                    loadEquipments();
                }
            })
            .catch(err => {
                console.error('Erreur ajout équipement:', err);
                setMessage({ type: "error", text: "Erreur lors de l'ajout" });
            });
    };

    // fonction de création d'un équipement
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        
        const categoryFields = [
            { name: "type", value: newCategory.type },
            { name: "name", value: newCategory.name },
            { name: "description", value: newCategory.description }
        ];
    
        const errors = validateCategory(categoryFields);
        if (errors.length > 0) {
            setMessage({ type: "error", text: errors.join(", ") });
            return;
        }
    
        try {
            const res = await createCategory(newCategory);
    
            if (res.status === 200) {
                setMessage({ type: "success", text: "Catégorie créée avec succès" });
                // Réinitialiser le formulaire avec le type par défaut
                setNewCategory({ type: 'vêtement', name: '', description: '' });
                setShowCategoryForm(false);
                // Recharger les catégories
                const categoriesRes = await getAllCategories();
                if (categoriesRes?.status === 200) {
                    setAllCategories(categoriesRes.category);
                    // Mettre à jour les types disponibles
                    const types = [...new Set(categoriesRes.category.map(cat => cat.type))];
                    setAvailableTypes(types);
                }
            }
        } catch (err) {
            console.error('Erreur création catégorie:', err);
            setMessage({ type: "error", text: "Erreur lors de la création" });
        }
    };

    // Suppression d'un équipement d'un séjour
    const handleRemoveEquipment = (itemId, type) => {    
        if (!stay?.id || !itemId) {
            console.warn('Paramètres invalides:', { stayId: stay?.id, itemId });
            setMessage({ type: "error", text: "Paramètres invalides" });
            return;
        }
    
        // Définir quelle fonction d'API utiliser
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
                    // Recharger les données
                    loadEquipments();
                }
            })
            .catch(err => {
                console.error('Erreur suppression équipement:', err);
                setMessage({ type: "error", text: "Erreur lors de la suppression" });
            });
    };

    const renderEquipmentsList = (equipments) => {
        const availableCategories = getAvailableCategories();

        return (
            <div className="equipments-list">
                {/* Liste des équipements existants */}
                {equipments && equipments.length > 0 ? (
                    equipments.map((group, index) => (
                        <div key={index} className="category-group">
                            <h4 className="category-title">{group.category}</h4>
                            <ul className="items-list">
                                {group.items.map((item, i) => (
                                    <li key={i} className="equipment-item">
                                        {item.category.name} : {item.category.description}
                                        <button 
                                            onClick={() => handleRemoveEquipment(
                                                item.category_id,
                                                activeTab
                                            )}
                                            className="remove-btn"
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>Aucun équipement</p>
                )}

                {/* Sélecteur pour ajouter de nouveaux équipements */}
                {availableCategories.length > 0 && (
                    <div className="add-equipment-section">
                        <h4>Ajouter un équipement</h4>
                        <select 
                            value={selectedEquipment}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedEquipment(value);
                                handleAddEquipment(Number(value), activeTab);
                                // Réinitialiser la sélection après l'ajout
                                setSelectedEquipment('');
                            }}
                        >
                            <option value="">Sélectionner un équipement...</option>
                            {availableCategories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.type.toUpperCase()} - {category.name} : {category.description}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Bouton et formulaire de création de catégorie */}
                <div className="category-form-section">
                    <button 
                        className="toggle-form-btn"
                        onClick={() => setShowCategoryForm(!showCategoryForm)}
                    >
                        {showCategoryForm ? 'Annuler' : 'Créer une nouvelle catégorie'}
                    </button>

                    {showCategoryForm && (
                        <form onSubmit={handleCreateCategory} className="category-form">
                            <div className="form-group">
                                <label htmlFor="categoryType">Type :</label>
                                <div className="type-selection">
                                    <select
                                        id="categoryType"
                                        value={newCategory.type}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "new") {
                                                setShowNewType(true);
                                                setNewCategory(prev => ({ ...prev, type: '' }));
                                            } else {
                                                setShowNewType(false);
                                                setNewCategory(prev => ({ ...prev, type: value }));
                                            }
                                        }}
                                        required
                                    >
                                        <option value="vêtement">vêtement</option> {/* Option par défaut */}
                                        {availableTypes
                                            .filter(type => type !== 'vêtement')
                                            .map(type => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))
                                        }
                                        <option value="new">Nouveau type...</option>
                                    </select>
                                    
                                    {showNewType && (
                                        <input
                                            type="text"
                                            placeholder="Nouveau type"
                                            value={newCategory.type}
                                            onChange={(e) => setNewCategory(prev => ({
                                                ...prev,
                                                type: e.target.value
                                            }))}
                                            required
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="categoryName">Nom de la catégorie :</label>
                                <input
                                    id="categoryName"
                                    type="text"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="categoryDescription">Description :</label>
                                <input
                                    id="categoryDescription"
                                    type="text"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    required
                                />
                            </div>

                            <button type="submit" className="submit-btn">
                                Créer la catégorie
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content">
                <h3>Équipements</h3>

                {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                        {message.text}
                    </div>
                )}
                
                <div className="tabs">
                    <button 
                        onClick={() => setActiveTab('provided')}
                        className={activeTab === 'provided' ? 'active' : ''}
                    >
                        Équipements fournis
                    </button>
                    <button 
                        onClick={() => setActiveTab('toPrepare')}
                        className={activeTab === 'toPrepare' ? 'active' : ''}
                    >
                        À prévoir
                    </button>
                </div>

                {renderEquipmentsList(
                    activeTab === 'provided' ? equipmentsProvided : equipmentsToPrepare
                )}

                <button className="center" onClick={onClose}>Fermer</button>
            </div>
        </div>
    );
};

export default EquipmentsTest;
