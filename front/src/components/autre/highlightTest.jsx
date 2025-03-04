import { useState, useEffect } from 'react';
import { getHighlightsByStayId } from '../../api/publicApi';
import { createHighlight, deleteHighlight, updateHighlight } from '../../api/admin/highlight';
import { validateHighlightForm } from '../../utils/validatehighlight';
// @ts-ignore
import { decodeHTML } from '../../utils/decodeHTML';

const HighlightTest = ({ stay, onClose }) => {
    const stayId = stay.id;
    const [stayHighlights, setStayHighlights] = useState([]);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [editingHighlightId, setEditingHighlightId] = useState(null);

    // États pour les champs du formulaire
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Gestion des erreurs/validation
    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [message]);

    // Récupération des points positifs
    useEffect(() => {
        getHighlightsByStayId(stayId)
            .then((res) => {
                if (res.status === 200) {
                    setStayHighlights(res.highlights);
                } else {
                    throw new Error("Erreur lors du chargement des points positifs.");
                }
            })
            .catch((err) => {
                setError("Impossible de récupérer les points positifs.");
                console.error(err);
            });
    }, [stayId]);

    // Gestion de la fermeture en cliquant en dehors
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            onClose();
        }
    };
    
    // Gestion de la création d'un nouveau point positif
    const handleCreateHighlight = async (e) => {
        e.preventDefault();
    
        setMessage({ type: "", text: "" });

        const fielsToValidate = [
            { name: "title", field: "title", value: title },
            { name: "description", field: "description", value: description },
            { name: "stay_id", field: "stay_id", value: parseInt(stayId, 10)},
        ]

        // Validation du formulaire
        const validationErrors = validateHighlightForm(fielsToValidate);

        // cas ou il y a des erreurs
        if (validationErrors.length > 0) {
            setMessage({ type: "error", text: validationErrors.join(', ') });
            console.log('error')
            return;
        }
        
        // Création des données du point positif
        const newHighlightData = { title, description, stay_id: parseInt(stayId, 10) };
    
        // Appel à l'API pour créer le point positif
        createHighlight(newHighlightData)
        .then((res) => {
            if (res.status === 200) {
                // Utilisation de la fonction de mise à jour avec la version précédente de l'état
                setStayHighlights((prevHighlights) => [...prevHighlights, res.hightlight]);

                setMessage({ type: "success", text: "Point positif ajouté avec succès !" });

                setShowForm(false)
                setTitle('');
                setDescription('');
            } else {
                setMessage({ type: "error", text: "Erreur lors de la création du point positif." });
            }
        })
        .catch((err) => {
            setMessage({ type: "error", text: "Erreur lors de la création du point positif." });
            console.error(err);
        });
    };

    // gestion de la suppression d'un point positif
    const handleDeletehighlight = (highlightId) => {
        deleteHighlight(highlightId)
        .then((res) => {
            if (res.status === 200) {
                setStayHighlights((prevHighlights) => prevHighlights.filter(highlight => highlight.id !== highlightId));
                setMessage({ type: "success", text: "Point positif supprimé avec succès !" });
            } else {
                setMessage({ type: "error", text: res.msg || "Erreur lors de la suppression du point positif" });
            }
        })
        .catch((err) => {
            setMessage({ type: "error", text: "Erreur lors de la suppression du point positif." });
            console.error("Erreur lors de la suppression du point positif :", err);
        })
    }

    // gestion de la modification d'un point positif
    const handleUpdateHighlight = async (e) => {
        e.preventDefault();
    
        setMessage({ type: "", text: "" });
    
        const fieldsToValidate = [
            { name: "title", field: "title", value: title },
            { name: "description", field: "description", value: description },
        ];
    
        const validationErrors = validateHighlightForm(fieldsToValidate);
    
        if (validationErrors.length > 0) {
            setMessage({ type: "error", text: validationErrors.join(", ") });
            return;
        }
    
        const updatedHighlight = { title, description };
    
        updateHighlight(editingHighlightId, updatedHighlight)
            .then((res) => {
                if (res.status === 200) {
                    setStayHighlights((prevHighlights) =>
                        prevHighlights.map((highlight) =>
                            highlight.id === editingHighlightId ? { ...highlight, ...updatedHighlight } : highlight
                        )
                    );
                    setMessage({ type: "success", text: "Point positif modifié avec succès !" });
    
                    // Réinitialisation
                    setEditingHighlightId(null);
                    setTitle("");
                    setDescription("");
                    setShowForm(false);
                } else {
                    setMessage({ type: "error", text: res.msg || "Erreur lors de la mise à jour." });
                }
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de la mise à jour du point positif." });
                console.error(err);
            });
    };
    

    const handleEditHighlight = (highlight) => {
        setEditingHighlightId(highlight.id);
        setTitle(highlight.title);
        setDescription(highlight.description);
        setShowForm(true);
    };

    // Gestion de l'annulation de l'ajout
    const handleCancel = () => {
        setShowForm(false);
        setTitle('');
        setDescription('');
    };

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content">
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <h3>Points forts du séjour</h3>
                
                {stayHighlights && stayHighlights.length > 0 ? (
                    <ul>
                        {stayHighlights.map((highlight) => (
                            <li key={highlight.id}>
                                <strong>{decodeHTML(highlight.title)}</strong> : {decodeHTML(highlight.description)}
                                <button onClick={() => handleEditHighlight(highlight)}>Modifier</button>
                                <button onClick={() => handleDeletehighlight(highlight.id)}>Supprimer</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun point fort associé.</p>
                )}

                <h3>Ajouter un point positif</h3>
                {!showForm ? (
                    <div>
                        <button onClick={() => setShowForm(true)}>Ajouter un nouveau point positif</button>
                    </div>
                ) : (
                    // Formulaire d'ajout/de modification du point positif
                    <form onSubmit={editingHighlightId ? handleUpdateHighlight : handleCreateHighlight}>
                        <div>
                            <label htmlFor="title">Titre</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Titre du point fort"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description du point fort"
                                required
                            />
                        </div>
                        <button type="submit">
                            {editingHighlightId ? "Modifier le point positif" : "Ajouter le point positif"}
                        </button>
                        <button type="button" onClick={handleCancel} style={{ backgroundColor: 'red', color: 'white' }}>
                            Annuler
                        </button>
                    </form>
                )}
                <button className="close-btn" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default HighlightTest;