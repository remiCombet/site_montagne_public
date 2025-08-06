import React, { useState, useEffect } from 'react';
import { createReceptionPoint, updateReceptionPoint } from '../../api/admin/receptionPoint';
import { getReceptionPointById, getAllReceptionPoints } from '../../api/publicApi';
import { updateStayReceptionPoint } from '../../api/admin/stay';

const ReceptionPointTest = ({ stayId, currentReceptionPointId, onPointChange }) => {
    const [currentPoint, setCurrentPoint] = useState(null);
    const [receptionPoints, setReceptionPoints] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        location: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        opening_time: '',
        closing_time: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showSelectPoint, setShowSelectPoint] = useState(false);
    const [selectedPointId, setSelectedPointId] = useState('');

    useEffect(() => {
        loadReceptionPoints();
        if (currentReceptionPointId) {
            loadCurrentPoint();
        }
    }, [currentReceptionPointId]);

    const loadReceptionPoints = async () => {
        try {
            const res = await getAllReceptionPoints();
            setReceptionPoints(res.data);
        } catch (error) {
            console.error("Erreur chargement points de réception:", error);
            setMessage({ type: 'error', text: "Erreur lors du chargement des points de réception" });
        }
    };

    const loadCurrentPoint = async () => {
        try {
            if (!currentReceptionPointId) return; // Protection supplémentaire
            const res = await getReceptionPointById(currentReceptionPointId);
            if (res.status === 200) { // Vérification du statut
                setCurrentPoint(res.data);
            }
        } catch (error) {
            console.error("Erreur chargement point actuel:", error);
            setMessage({ type: 'error', text: "Erreur lors du chargement du point actuel" });
        }
    };

    const handleEdit = (point) => {
        setFormData(point);
        setEditingId(point.id);
        setShowForm(true);
    };

    const handleNew = () => {
        setFormData({
            location: '',
            contact_name: '',
            contact_phone: '',
            contact_email: '',
            opening_time: '',
            closing_time: ''
        });
        setEditingId(null);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            if (editingId) {
                // Mise à jour
                const res = await updateReceptionPoint(editingId, formData);
                console.log('Réponse mise à jour:', res); // Debug

                if (res.status === 200 || res.status === 201) {
                    setMessage({ type: 'success', text: 'Point de réception mis à jour avec succès' });
                    // Mise à jour des données après modification
                    await loadCurrentPoint();
                    await loadReceptionPoints();
                    setShowForm(false);
                } else if (res.status === 404) {
                    setMessage({ type: 'error', text: "Point de réception non trouvé" });
                } else {
                    throw new Error(res.msg || 'Erreur lors de la mise à jour');
                }
            } else {
                // Création
                const res = await createReceptionPoint(formData);
                console.log('Réponse création:', res); // Debug

                if (res.status === 201 || res.status === 200) {
                    setMessage({ type: 'success', text: 'Point de réception créé avec succès' });
                    // Mise à jour du point de réception du séjour
                    await updateStayReceptionPoint(stayId, res.data.id);
                    onPointChange(res.data.id);
                    await loadReceptionPoints();
                    setShowForm(false);
                } else {
                    throw new Error(res.msg || 'Erreur lors de la création');
                }
            }
        } catch (error) {
            console.error("Erreur détaillée:", error);
            setMessage({ 
                type: 'error', 
                text: error.message || `Erreur lors de ${editingId ? 'la mise à jour' : 'la création'} du point de réception` 
            });
        }
    };

    // Ajouter cette fonction pour gérer la validation du changement de point
    const handleChangePoint = async () => {
        try {
            if (!selectedPointId) return;
            
            await updateStayReceptionPoint(stayId, selectedPointId);
            onPointChange(selectedPointId);
            setShowSelectPoint(false);
            setMessage({ type: 'success', text: 'Point de réception modifié avec succès' });
            loadCurrentPoint();
        } catch (error) {
            console.error("Erreur lors du changement de point:", error);
            setMessage({ type: 'error', text: 'Erreur lors du changement de point de réception' });
        }
    };

    return (
        <div className="reception-point-section">
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <h3>Point de réception</h3>
            
            {/* Affichage des détails du point actuel */}
            {currentPoint && (
                <div className="current-point">
                    <p><strong>Lieu :</strong> {currentPoint.location}</p>
                    <p><strong>Contact :</strong> {currentPoint.contact_name}</p>
                    <p><strong>Téléphone :</strong> {currentPoint.contact_phone}</p>
                    <p><strong>Email :</strong> {currentPoint.contact_email}</p>
                    <p><strong>Horaires :</strong> {currentPoint.opening_time} - {currentPoint.closing_time}</p>
                    
                    {/* Bouton pour modifier le point actuel */}
                    <button 
                        className="edit-button"
                        onClick={() => handleEdit(currentPoint)}
                    >
                        Modifier ce point de réception
                    </button>
                </div>
            )}

            {/* Section pour changer de point de réception */}
            <div className="change-point-section">
                <button 
                    className="select-button"
                    onClick={() => setShowSelectPoint(!showSelectPoint)}
                >
                    Choisir un autre point de réception
                </button>
                
                {showSelectPoint && (
                    <div className="select-point-container">
                        <select 
                            onChange={(e) => setSelectedPointId(e.target.value)}
                            value={selectedPointId}
                        >
                            <option value="">Sélectionner un point</option>
                            {receptionPoints.map(point => (
                                <option key={point.id} value={point.id}>
                                    {point.location}
                                </option>
                            ))}
                        </select>
                        <div className="select-actions">
                            <button 
                                className="validate-button"
                                onClick={handleChangePoint}
                                disabled={!selectedPointId}
                            >
                                Valider
                            </button>
                            <button 
                                className="cancel-button"
                                onClick={() => {
                                    setShowSelectPoint(false);
                                    setSelectedPointId('');
                                }}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bouton pour créer un nouveau point */}
            <button 
                className="new-button"
                onClick={handleNew}
            >
                Créer un nouveau point de réception
            </button>

            {/* Formulaire de création/modification */}
            {showForm && (
                <form onSubmit={handleSubmit} className="point-form">
                    <h4>{editingId ? "Modifier le point de réception" : "Nouveau point de réception"}</h4>
                    
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
                        <button type="button" onClick={() => setShowForm(false)}>
                            Annuler
                        </button>
                    </div>
                </form>
            )}

            {/* Bouton fermer */}
            {/* <button 
                className="close-button" 
                onClick={onClose}
            >
                Fermer
            </button> */}
        </div>
    );
};

export default ReceptionPointTest;
