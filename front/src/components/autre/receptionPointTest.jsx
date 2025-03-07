import React, { useState, useEffect } from 'react';
import { createReceptionPoint, updateReceptionPoint } from '../../api/admin/receptionPoint';
import { getReceptionPointById, getAllReceptionPoints } from '../../api/publicApi';
import { updateStayReceptionPoint } from '../../api/admin/stay';
import { validateReceptionPoint} from '../../utils/validateReceptionPoint';

const ReceptionPointTest = ({ stayId, currentReceptionPointId, onPointChange }) => {
    const [currentPoint, setCurrentPoint] = useState(null);
    const [receptionPoints, setReceptionPoints] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showSelectPoint, setShowSelectPoint] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedPointId, setSelectedPointId] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [selectedPointDetails, setSelectedPointDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastFetchTime, setLastFetchTime] = useState(null);
    const [mode, setMode] = useState('view'); // 'view', 'select', 'create'

    const [formData, setFormData] = useState({
        location: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        opening_time: '',
        closing_time: ''
    });

    useEffect(() => {
        loadReceptionPoints();
        if (currentReceptionPointId) {
            loadCurrentPoint();
        }
    }, [currentReceptionPointId]);

    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [message]);
    
    const loadReceptionPoints = () => {
        // Si les données ont été chargées il y a moins de 5 minutes, ne pas recharger
        if (lastFetchTime && (Date.now() - lastFetchTime) < 300000) {
            return;
        }

        setIsLoading(true);
        getAllReceptionPoints()
            .then(res => {
                setReceptionPoints(res.data);
                setLastFetchTime(Date.now());
            })
            .catch(error => {
                console.error("Erreur chargement points de réception:", error);
                setMessage({ type: 'error', text: "Erreur lors du chargement des points de réception" });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    
    const loadCurrentPoint = () => {
        if (!currentReceptionPointId) return;
    
        getReceptionPointById(currentReceptionPointId)
            .then(res => {
                if (res.status === 200) {
                    setCurrentPoint(res.data);
                }
            })
            .catch(error => {
                console.error("Erreur chargement point actuel:", error);
                setMessage({ type: 'error', text: "Erreur lors du chargement du point actuel" });
            });
    };
    
    const handleChangePoint = () => {
        if (!selectedPointId) return;

        if (stayId) {
            // Si un stayId existe, mettre à jour le point de réception pour ce séjour
            updateStayReceptionPoint(stayId, selectedPointId)
                .then(res => {
                    if (res.status === 200) {
                        onPointChange(selectedPointId);
                        loadCurrentPoint();
                        setShowSelectPoint(false);
                        setMessage({ type: 'success', text: 'Point de réception modifié avec succès' });
                        setTimeout(() => {
                            setMode('view');
                        }, 1500);
                    }
                })
                .catch(error => {
                    console.error("Erreur lors du changement de point:", error);
                    setMessage({ type: 'error', text: 'Erreur lors du changement de point de réception' });
                });
        } else {
            // Si c'est un nouveau séjour, simplement mettre à jour l'état local
            onPointChange(selectedPointId);
            // Trouver le point sélectionné pour le mettre comme point courant
            const selectedPoint = receptionPoints.find(point => point.id === parseInt(selectedPointId));
            setCurrentPoint(selectedPoint);
            setShowSelectPoint(false);
            setMessage({ type: 'success', text: 'Point de réception sélectionné' });
        }
    };

    // const handleEdit = (point) => {
    //     setFormData(point);
    //     setEditingId(point.id);
    //     setShowForm(true);
    // };

    // const handleNew = () => {
    //     // Réinitialiser le formulaire avec des valeurs vides
    //     setFormData({
    //         location: '',
    //         contact_name: '',
    //         contact_phone: '',
    //         contact_email: '',
    //         opening_time: '',
    //         closing_time: ''
    //     });
    //     setEditingId(null);
    //     setShowForm(true);
    // };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
    
        const receptionPointFields = [
            { name: "location", value: formData.location },
            { name: "contact_name", value: formData.contact_name },
            { name: "contact_phone", value: formData.contact_phone },
            { name: "contact_email", value: formData.contact_email },
            { name: "opening_time", value: formData.opening_time },
            { name: "closing_time", value: formData.closing_time }
        ];
    
        const errors = validateReceptionPoint(receptionPointFields);
        if (errors.length > 0) {
            setMessage({ type: "error", text: errors.join(", ") });
            return;
        }
    
        const dataToSend = {
            location: formData.location,
            contact_name: formData.contact_name,
            contact_phone: formData.contact_phone,
            contact_email: formData.contact_email,
            opening_time: formData.opening_time,
            closing_time: formData.closing_time
        };
    
        if (editingId) {
            updateReceptionPoint(editingId, dataToSend)
                .then((res) => {
                    if (res.status === 200) {
                        // Mettre à jour les données locales
                        setCurrentPoint(res.data);
    
                        // Mettre à jour la liste des points de réception
                        setReceptionPoints(prevPoints => 
                            prevPoints.map(point => 
                                point.id === editingId ? res.data : point
                            )
                        );
    
                        // Réinitialiser le formulaire
                        setEditingId(null);
                        setFormData({
                            location: '',
                            contact_name: '',
                            contact_phone: '',
                            contact_email: '',
                            opening_time: '',
                            closing_time: ''
                        });
    
                         // Afficher le message de succès
                        setMessage({ 
                            type: 'success', 
                            text: 'Point de réception modifié avec succès' 
                        });
                        setTimeout(() => {
                            setMode('view');
                        }, 1500);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setMessage({ type: 'error', text: 'Erreur lors de la modification du point de réception' });
                });
        } else {
            createReceptionPoint(dataToSend)
            .then((res) => {
                if (res.status === 201) {
                    // Mettre à jour les données locales
                    setCurrentPoint(res.data);
                    
                    // Ajouter le nouveau point à la liste des points de réception
                    setReceptionPoints(prevPoints => [...prevPoints, res.data]);

                    if (stayId) {
                        // Si un stayId existe, attribuer le nouveau point de réception au séjour
                        return updateStayReceptionPoint(stayId, res.data.id)
                            .then(updateRes => {
                                if (updateRes.status === 200) {
                                    onPointChange(res.data.id);
                                    
                                    // Réinitialiser le formulaire
                                    setFormData({
                                        location: '',
                                        contact_name: '',
                                        contact_phone: '',
                                        contact_email: '',
                                        opening_time: '',
                                        closing_time: ''
                                    });
                                    
                                    // Afficher le message de succès
                                    setMessage({ 
                                        type: 'success', 
                                        text: 'Point de réception créé et attribué avec succès' 
                                    });
                                    
                                    // Ajouter un délai avant de revenir à la vue principale
                                    setTimeout(() => {
                                        setMode('view');
                                    }, 1500);
                                }
                            });
                    } else {
                        // Si c'est un nouveau séjour, simplement retourner le nouveau point
                        onPointChange(res.data.id);
                        
                        // Réinitialiser le formulaire
                        setFormData({
                            location: '',
                            contact_name: '',
                            contact_phone: '',
                            contact_email: '',
                            opening_time: '',
                            closing_time: ''
                        });

                        // Afficher le message de succès
                        setMessage({ 
                            type: 'success', 
                            text: 'Point de réception créé avec succès' 
                        });

                        // Changer de mode pour afficher les détails du nouveau point
                        setMode('view');
                    }
                }
            })
            .catch((err) => {
                console.error(err);
                setMessage({ 
                    type: 'error', 
                    text: 'Erreur lors de la création ou de l\'attribution du point de réception' 
                });
            });
        }        
    }

    const handleSelectChange = (e) => {
        const newSelectedId = e.target.value;
        setSelectedPointId(newSelectedId);
        
        // Si un point est sélectionné, trouver ses détails
        if (newSelectedId) {
            const selectedPoint = receptionPoints.find(point => point.id === parseInt(newSelectedId));
            setSelectedPointDetails(selectedPoint);
        } else {
            setSelectedPointDetails(null);
        }
    };

    return (
        <div className="reception-point-section">
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Affichage du point actuel seulement en mode 'view' */}
            {mode === 'view' && currentPoint && (
                <div className="current-point">
                    <h3>Point de réception actuel</h3>
                    <p><strong>Lieu :</strong> {currentPoint.location}</p>
                    <p><strong>Contact :</strong> {currentPoint.contact_name}</p>
                    <p><strong>Téléphone :</strong> {currentPoint.contact_phone}</p>
                    <p><strong>Email :</strong> {currentPoint.contact_email}</p>
                    <p><strong>Horaires :</strong> {currentPoint.opening_time} - {currentPoint.closing_time}</p>
                </div>
            )}

            {/* Boutons de choix du mode */}
            <div className="mode-buttons">
                <button 
                    className={`mode-button ${mode === 'select' ? 'active' : ''}`}
                    onClick={() => setMode('select')}
                >
                    Choisir un point existant
                </button>
                <button 
                    className={`mode-button ${mode === 'create' ? 'active' : ''}`}
                    onClick={() => setMode('create')}
                >
                    Créer un nouveau point
                </button>
            </div>

            {/* Section de sélection d'un point existant */}
            {mode === 'select' && (
                <div className="select-point-section">
                    <h3>Sélectionner un point de réception</h3>
                    <select 
                        onChange={handleSelectChange}
                        value={selectedPointId}
                    >
                        <option value="">Choisir un point</option>
                        {receptionPoints.map(point => (
                            <option key={point.id} value={point.id}>
                                {point.location}
                            </option>
                        ))}
                    </select>
                    
                    {selectedPointDetails && (
                        <div className="selected-point-details">
                            <h4>Détails du point sélectionné</h4>
                            <p><strong>Lieu :</strong> {selectedPointDetails.location}</p>
                            <p><strong>Contact :</strong> {selectedPointDetails.contact_name}</p>
                            <p><strong>Téléphone :</strong> {selectedPointDetails.contact_phone}</p>
                            <p><strong>Email :</strong> {selectedPointDetails.contact_email}</p>
                            <p><strong>Horaires :</strong> {selectedPointDetails.opening_time} - {selectedPointDetails.closing_time}</p>
                            
                            <div className="actions">
                                <button 
                                    className="validate-button"
                                    onClick={handleChangePoint}
                                >
                                    Valider
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Formulaire de création/modification */}
            {mode === 'create' && (
                <div className="create-point-section">
                    <h3>{editingId ? 'Modifier le point' : 'Créer un nouveau point'}</h3>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Lieu
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                required
                            />
                        </label>

                        <label>
                            Nom du contact
                            <input
                                type="text"
                                value={formData.contact_name}
                                onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                                required
                            />
                        </label>

                        <label>
                            Téléphone
                            <input
                                type="tel"
                                value={formData.contact_phone}
                                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                                required
                            />
                        </label>

                        <label>
                            Email
                            <input
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                required
                            />
                        </label>

                        <label>
                            Heure d'ouverture
                            <input
                                type="time"
                                value={formData.opening_time}
                                onChange={(e) => setFormData({...formData, opening_time: e.target.value})}
                                required
                            />
                        </label>

                        <label>
                            Heure de fermeture
                            <input
                                type="time"
                                value={formData.closing_time}
                                onChange={(e) => setFormData({...formData, closing_time: e.target.value})}
                                required
                            />
                        </label>

                        <div className="actions">
                            <button type="submit">
                                {editingId ? "Sauvegarder" : "Créer"}
                            </button>
                            {/* <button type="button" onClick={() => setShowForm(false)}>
                                Annuler
                            </button> */}
                        </div>
                    </form>
                </div>
            )}

            {/* Boutons d'action */}
            <div className="action-buttons">
                {mode !== 'view' && (
                    <button 
                        className="cancel-button"
                        onClick={() => {
                            setMode('view');
                            setSelectedPointId('');
                            setSelectedPointDetails(null);
                        }}
                    >
                        Annuler
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReceptionPointTest;