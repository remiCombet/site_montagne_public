import { useState, useEffect } from 'react';
import { addStayAccess, createAccess, updateAccess, deleteAccess, removeAccessFromStay, checkAccessUsage } from '../../api/admin/access';
import { getAllAccesses, getAllStayAccess } from '../../api/publicApi';
import { validateAccess } from '../../utils/validateAccess';

const AccessTest = ({ stay, onClose }) => {
    const stayId = stay.id;
    const [allAccesses, setAllAccesses] = useState([]);
    const [stayAccesses, setStayAccesses] = useState([]);

    // gestion des champs pour la création/modification d'un nouvel accès
    const [category, setCategory] = useState("");
    const [informations, setInformations] = useState("");

    // getion des erreurs/validations
    const [message, setMessage] = useState({ type: "", text: "" });

    // Ajout des états pour l'édition
    const [editingAccessId, setEditingAccessId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        getAllAccesses()
            .then((res) => {
                if (res.status === 200) {
                    setAllAccesses(res.access);
                }
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de la récupération des accès." });
                console.error(err);
            });

        getAllStayAccess(stayId)
            .then((res) => {
                console.log(res.accesses)
                setStayAccesses(res.accesses);
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de la récupération des accès du séjour." });
                console.error(err);
            });
    }, []);

    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [message]);

    // Fonction de réinitialisation du formulaire
    const resetForm = () => {
        setCategory("");
        setInformations("");
        setEditingAccessId(null);
        setShowForm(false);
    };

    // Ajouter un accès au séjour
    const handleAddAccess = (accessId) => {
        setMessage({ type: "", text: "" });
        
        // Vérifier si l'accès est déjà associé au séjour
        if (Array.isArray(stayAccesses) && stayAccesses.some(access => access.id === accessId)) {
            alert("Cet accès est déjà ajouté !");
            return;
        }
    
        // Trouver l'accès complet dans allAccesses
        const accessToAdd = allAccesses.find(access => access.id === accessId);
        if (!accessToAdd) return;
    
        // cas positif, ajout de l'accès au séjour
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
                    setMessage({ type: "success", text: "Accès ajouté avec succès !" });
                } else {
                    setMessage({ type: "error", text: res.msg || "Erreur lors de l'ajout de l'accès." });
                }
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de l'ajout de l'accès." });
                console.error("Erreur lors de l'ajout de l'accès :", err);
            });
    };

    // Gestion de la création d'un accès
    const handleCreateAccess = (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        
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
                                
                                setMessage({ type: "success", text: "Accès créé et ajouté avec succès !" });
                                resetForm();
                            } else {
                                throw new Error(stayAccessRes.msg || "Erreur lors de l'ajout de l'accès");
                            }
                        });
                }
                throw new Error("Erreur lors de la création de l'accès");
            })
            .catch((err) => {
                console.error('Erreur:', err);
                setMessage({ type: "error", text: err.message || "Erreur lors de la création." });
            });
    };

    // Gestion de la modification d'un accès
    const handleUpdateAccess = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        const accessFields = [
            { name: "category", value: category },
            { name: "informations", value: informations }
        ];

        const errors = validateAccess(accessFields);
        if (errors.length > 0) {
            setMessage({ type: "error", text: errors.join(", ") });
            return;
        }

        try {
            const accessData = {
                category,
                informations
            };

            const res = await updateAccess(editingAccessId, accessData);
            if (res.status === 200) {
                setAllAccesses(prevAccesses =>
                    prevAccesses.map(access =>
                        access.id === editingAccessId
                            ? { ...access, ...accessData }
                            : access
                    )
                );
                setMessage({ type: "success", text: "Accès modifié avec succès !" });
                resetForm();
            } else {
                setMessage({ type: "error", text: "Erreur lors de la modification de l'accès." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Erreur lors de la modification." });
        }
    };

    // Gestion de la suppression d'un accès
    const handleDeleteAccess = async (accessId) => {
        try {
            // Vérifier d'abord si l'accès est utilisé ailleurs
            const usageCheck = await checkAccessUsage(accessId);
            
            if (usageCheck.status === 200) {
                if (usageCheck.isUsed) {
                    // Si l'accès est utilisé, afficher un message avec les séjours concernés
                    const staysList = usageCheck.usages
                        .map(u => u.stayTitle)
                        .join(', ');
                    
                    setMessage({ 
                        type: "error", 
                        text: `Impossible de supprimer cet accès car il est utilisé dans les séjours suivants : ${staysList}` 
                    });
                    return;
                }
                
                // Si l'accès n'est pas utilisé ailleurs, procéder à la suppression
                const res = await deleteAccess(accessId);
                if (res.status === 200) {
                    setAllAccesses(prevAccesses => 
                        prevAccesses.filter(access => access.id !== accessId)
                    );
                    setMessage({ 
                        type: "success", 
                        text: "Accès supprimé avec succès !" 
                    });
                } else {
                    setMessage({ 
                        type: "error", 
                        text: "Erreur lors de la suppression de l'accès." 
                    });
                }
            }
        } catch (err) {
            console.error(err);
            setMessage({ 
                type: "error", 
                text: "Erreur lors de la vérification/suppression de l'accès." 
            });
        }
    };

    // Gestion de la suppression d'un accès associé au séjour
    const handleRemoveAccess = (accessId) => {
        setMessage({ type: "", text: "" });
        removeAccessFromStay(stayId, accessId)
            .then((res) => {
                if (res.status === 200) {
                    console.log(res)
                    setStayAccesses(prevAccesses => prevAccesses.filter(access => access.id !== accessId));
                    setMessage({ type: "success", text: "Accès supprimé avec succès !" });
                } else {
                    setMessage({ type: "error", text: res.msg || "Erreur lors de la suppression de l'accès." });
                }
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de la suppression de l'accès." });
                console.error("Erreur lors de la suppression de l'accès :", err);
            });
    };

    // Gestion de l'édition d'un accès
    const handleEditAccess = (access) => {
        setEditingAccessId(access.id);
        setCategory(access.category);
        setInformations(access.informations);
        setShowForm(true);
    };

    // Gestion de la fermeture en cliquant en dehors
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            onClose();
        }
    };

    // Modification du return pour inclure le formulaire complet
    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content">
                {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                        {message.text}
                    </div>
                )}

                <h3>Accès du séjour</h3>
                {stayAccesses && stayAccesses.length > 0 ? (
                    <ul>
                        {stayAccesses.map((access) => (
                            <li key={access.id}>
                                <strong>{access.category}</strong>: {access.informations}
                                <button onClick={() => handleEditAccess(access)}>Modifier</button>
                                <button onClick={() => handleRemoveAccess(access.id)}>Enlever</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun acces associé.</p>
                )}

                <h3>Acces disponibles</h3>
                <ul>
                    {allAccesses.map((access) => (
                        <li key={access.id}>
                            {access.category}
                            <button onClick={() => handleAddAccess(access.id)}>Ajouter</button>
                            <button onClick={() => handleDeleteAccess(access.id)}>Supprimer</button>
                        </li>
                    ))}
                </ul>

                <h3>{editingAccessId ? "Modifier l'accès" : "Créer un nouvel accès"}</h3>
                <form onSubmit={editingAccessId ? handleUpdateAccess : handleCreateAccess}>
                    <div className="form-group">
                        <label htmlFor="category">Type de transport *</label>
                        <input
                            type="text"
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="informations">Informations détaillées *</label>
                        <textarea
                            id="informations"
                            value={informations}
                            onChange={(e) => setInformations(e.target.value)}
                            className="form-control"
                            rows="3"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                    >
                        {editingAccessId ? "Modifier" : "Ajouter"}
                    </button>
                </form>

                <button className="close-btn" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default AccessTest;
