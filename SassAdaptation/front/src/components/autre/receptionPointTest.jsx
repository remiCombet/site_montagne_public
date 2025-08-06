import { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { updateStayStore } from '../../slices/staySlice';
import { createReceptionPoint, updateReceptionPoint } from '../../api/admin/receptionPoint';
import { getReceptionPointById, getAllReceptionPoints } from '../../api/publicApi';
import { updateStayReceptionPoint } from '../../api/admin/stay';
import { validateReceptionPoint } from '../../utils/validateReceptionPoint';
import { 
    normalizeTimeFormat, 
    initTimeSelectorsFromString,
    generateHourOptions,
    generateMinuteOptions 
} from '../../utils/timeFormatUtils.jsx';

const ReceptionPointTest = ({ stayId, currentReceptionPointId, onPointChange, className, onMessage }) => {
    const dispatch = useDispatch();
    
    const [currentPoint, setCurrentPoint] = useState(null);
    const [receptionPoints, setReceptionPoints] = useState([]);
    const [selectedPointId, setSelectedPointId] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [selectedPointDetails, setSelectedPointDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastFetchTime, setLastFetchTime] = useState(null);
    const [mode, setMode] = useState('view');
    const [useTimeSelector, setUseTimeSelector] = useState(false);

    // État pour les sélecteurs d'heure
    const [timeSelectors, setTimeSelectors] = useState({
        opening_hours: '09',
        opening_minutes: '00',
        closing_hours: '18',
        closing_minutes: '00'
    });

    const [formData, setFormData] = useState({
        location: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        opening_time: '',
        closing_time: ''
    });

    useEffect(() => {
        // Détecter si le navigateur est Firefox pour activer automatiquement les sélecteurs d'heure
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        setUseTimeSelector(isFirefox);
        
        loadReceptionPoints();
        if (currentReceptionPointId) {
            loadCurrentPoint();
        }
    }, [currentReceptionPointId]);

    // Préchargement de données avant l'affichage complet
    useEffect(() => {
        // Si on a un ID mais pas encore de données, précharger les données
        if (currentReceptionPointId && !lastFetchTime) {
            // Précharger silencieusement sans indicateur de chargement
            getAllReceptionPoints().then(res => {
                const normalizedPoints = res.data.map(point => ({
                    ...point,
                    opening_time: normalizeTimeFormat(point.opening_time),
                    closing_time: normalizeTimeFormat(point.closing_time)
                }));
                setReceptionPoints(normalizedPoints);
                setLastFetchTime(Date.now());
            }).catch(() => {});
        }
    }, []);

    // Mise à jour du formData quand les sélecteurs d'heure changent
    useEffect(() => {
        if (useTimeSelector) {
            const opening_time = `${timeSelectors.opening_hours}:${timeSelectors.opening_minutes}`;
            const closing_time = `${timeSelectors.closing_hours}:${timeSelectors.closing_minutes}`;
            
            setFormData(prev => ({
                ...prev,
                opening_time,
                closing_time
            }));
            
        }
    }, [timeSelectors, useTimeSelector]);
    
    const loadReceptionPoints = () => {
        // Si les données ont été chargées il y a moins de 5 minutes, ne pas recharger
        if (lastFetchTime && (Date.now() - lastFetchTime) < 300000) {
            return;
        }

        // Montrer l'indicateur de chargement uniquement s'il n'y a pas encore de données
        if (receptionPoints.length === 0) {
            setIsLoading(true);
        }

        getAllReceptionPoints()
            .then(res => {
                // Normaliser les horaires de tous les points récupérés
                const normalizedPoints = res.data.map(point => ({
                    ...point,
                    opening_time: normalizeTimeFormat(point.opening_time),
                    closing_time: normalizeTimeFormat(point.closing_time)
                }));
                
                setReceptionPoints(normalizedPoints);
                setLastFetchTime(Date.now());
            })
            .catch(error => {
                console.error("Erreur chargement points de réception:", error);
                onMessage({ type: 'error', text: "Erreur lors du chargement des points de réception" });
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
                    // Normaliser les horaires pour l'affichage
                    const point = {
                        ...res.data,
                        opening_time: normalizeTimeFormat(res.data.opening_time),
                        closing_time: normalizeTimeFormat(res.data.closing_time)
                    };
                    setCurrentPoint(point);
                }
            })
            .catch(error => {
                console.error("Erreur chargement point actuel:", error);
                onMessage({ type: 'error', text: "Erreur lors du chargement du point actuel" });
            });
    };

    // Fonction pour initialiser le formulaire avec les données du point actuel
    const handleEditCurrentPoint = () => {
        if (!currentPoint) return;
        
        setEditingId(currentPoint.id);
        
        // Initialiser les sélecteurs d'heure à partir des données du point
        const openingSelectors = initTimeSelectorsFromString(currentPoint.opening_time, 'opening');
        const closingSelectors = initTimeSelectorsFromString(currentPoint.closing_time, 'closing');
        
        setTimeSelectors({
            ...openingSelectors,
            ...closingSelectors
        });
        
        setFormData({
            location: currentPoint.location || '',
            contact_name: currentPoint.contact_name || '',
            contact_phone: currentPoint.contact_phone || '',
            contact_email: currentPoint.contact_email || '',
            opening_time: currentPoint.opening_time || '',
            closing_time: currentPoint.closing_time || ''
        });
        
        setMode('create'); // Réutiliser le mode création pour l'édition
    };
    
    const handleChangePoint = async () => {
        if (!selectedPointId) return;
        
        setIsSubmitting(true);

        try {
            if (stayId) {
                const res = await updateStayReceptionPoint(stayId, selectedPointId);
                if (res.status === 200) {
                    // Dispatcher l'action pour mettre à jour le store
                    dispatch(updateStayStore({
                        id: stayId,
                        reception_point_id: selectedPointId,
                        ...res.data
                    }));
                    
                    // Garder onPointChange pour la rétrocompatibilité si nécessaire
                    onPointChange && onPointChange({
                        ...res.data,
                        reception_point_id: selectedPointId
                    });
                    
                    loadCurrentPoint();
                    onMessage({ type: 'success', text: 'Point de réception modifié avec succès' });
                    setTimeout(() => setMode('view'), 1500);
                }
            } else {
                // Pour un nouveau séjour, garder la logique existante
                onPointChange && onPointChange({ reception_point_id: selectedPointId });
                const selectedPoint = receptionPoints.find(p => p.id === parseInt(selectedPointId));
                setCurrentPoint(selectedPoint);
                onMessage({ type: 'success', text: 'Point de réception sélectionné' });
                setMode('view');
            }
        } catch (error) {
            console.error("Erreur lors du changement de point:", error);
            onMessage({ type: 'error', text: 'Erreur lors du changement de point de réception' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onMessage({ type: '', text: '' });
        setIsSubmitting(true);
    
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
            console.error("Erreurs de validation:", errors);
            onMessage({ type: "error", text: errors.join(", ") });
            setIsSubmitting(false);
            return;
        }
    
        // Normalisation des horaires avant envoi
        const dataToSend = {
            location: formData.location,
            contact_name: formData.contact_name,
            contact_phone: formData.contact_phone,
            contact_email: formData.contact_email,
            opening_time: normalizeTimeFormat(formData.opening_time),
            closing_time: normalizeTimeFormat(formData.closing_time)
        };
    
    
        if (editingId) {
            updateReceptionPoint(editingId, dataToSend)
                .then((res) => {
                    if (res.status === 200) {
                        // Les horaires sont déjà normalisés lors de l'envoi
                        const updatedPoint = {
                            ...res.data,
                            opening_time: normalizeTimeFormat(res.data.opening_time),
                            closing_time: normalizeTimeFormat(res.data.closing_time)
                        };
                        
                        // Mettre à jour les données locales
                        setCurrentPoint(updatedPoint);
    
                        // Mettre à jour la liste des points de réception
                        setReceptionPoints(prevPoints => 
                            prevPoints.map(point => 
                                point.id === editingId ? updatedPoint : point
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
                        onMessage({ 
                            type: 'success', 
                            text: 'Point de réception modifié avec succès' 
                        });
                        setTimeout(() => {
                            setMode('view');
                        }, 1500);
                    }
                })
                .catch((err) => {
                    console.error("Erreur lors de la mise à jour:", err);
                    onMessage({ type: 'error', text: 'Erreur lors de la modification du point de réception' });
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        } else {
            createReceptionPoint(dataToSend)
                .then((res) => {
                    if (res.status === 201) {
                        const newPoint = {
                            ...res.data,
                            opening_time: normalizeTimeFormat(res.data.opening_time),
                            closing_time: normalizeTimeFormat(res.data.closing_time)
                        };
                        
                        // Mettre à jour les données locales
                        setCurrentPoint(newPoint);
                        
                        // Ajouter le nouveau point à la liste des points de réception
                        setReceptionPoints(prevPoints => [...prevPoints, newPoint]);

                        if (stayId) {
                            // Si un stayId existe, attribuer le nouveau point de réception au séjour
                            return updateStayReceptionPoint(stayId, res.data.id)
                                .then(updateRes => {
                                    if (updateRes.status === 200) {
                                        onPointChange && onPointChange(res.data.id);
                                        
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
                                        onMessage({ 
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
                            onPointChange && onPointChange(res.data.id);
                            
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
                            onMessage({ 
                                type: 'success', 
                                text: 'Point de réception créé avec succès' 
                            });

                            // Changer de mode pour afficher les détails du nouveau point
                            setMode('view');
                        }
                    }
                })
                .catch((err) => {
                    console.error("Erreur lors de la création:", err);
                    onMessage({ 
                        type: 'error', 
                        text: 'Erreur lors de la création ou de l\'attribution du point de réception' 
                    });
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }        
    };

    const handleSelectChange = (e) => {
        const newSelectedId = e.target.value;
        setSelectedPointId(newSelectedId);
        
        // Si un point est sélectionné, trouver ses détails
        if (newSelectedId) {
            const selectedPoint = receptionPoints.find(point => point.id === parseInt(newSelectedId));
            setSelectedPointDetails(selectedPoint); // Déjà normalisé lors du chargement initial
        } else {
            setSelectedPointDetails(null);
        }
    };

    // Gérer directement les changements de champ horaire via l'input classique
    const handleTimeChange = (e, field) => {
        // L'input de type time renvoie déjà un format HH:MM
        const normalizedValue = normalizeTimeFormat(e.target.value);
        setFormData({...formData, [field]: normalizedValue});
    };
    
    // Gérer les changements de sélecteurs d'heure
    const handleTimeSelectorChange = (e, field) => {
        setTimeSelectors({
            ...timeSelectors,
            [field]: e.target.value
        });
        
        // Le formData sera mis à jour automatiquement par l'effet
    };

    // Mémoisation des générateurs d'options pour éviter les recalculs à chaque rendu
    const hourOptions = useMemo(() => generateHourOptions(), []);
    const minuteOptions = useMemo(() => generateMinuteOptions(), []);

    // Bouton pour basculer entre les deux modes de sélection d'heure
    const renderTimeSelectorToggle = () => (
        <div className="time-selector-toggle">
            <button 
                type="button" 
                className="btn-outline-primary btn-sm"
                onClick={() => setUseTimeSelector(!useTimeSelector)}
            >
                {useTimeSelector 
                    ? "Utiliser le champ horaire standard" 
                    : "Utiliser les sélecteurs d'heure"}
            </button>
            <small className="helper-text">
                Si vous avez des difficultés avec la saisie d'horaires, changez de mode
            </small>
        </div>
    );

    const renderViewMode = () => (
        <article className={`reception-point ${className}`}>
            {currentPoint ? (
                <>
                    <header>
                        <h4>Point de réception actuel</h4>
                    </header>
                    
                    <dl className="point-details">
                        <li className="detail-item">
                            <dt>Lieu</dt>
                            <dd>{currentPoint.location}</dd>
                        </li>
                        <li className="detail-item">
                            <dt>Contact</dt>
                            <dd>{currentPoint.contact_name}</dd>
                        </li>
                        <li className="detail-item">
                            <dt>Téléphone</dt>
                            <dd>{currentPoint.contact_phone}</dd>
                        </li>
                        <li className="detail-item">
                            <dt>Email</dt>
                            <dd>{currentPoint.contact_email}</dd>
                        </li>
                        <li className="detail-item">
                            <dt>Horaires</dt>
                            <dd>{currentPoint.opening_time} - {currentPoint.closing_time}</dd>
                        </li>
                    </dl>

                    {onPointChange && (
                        <menu type="toolbar" className="action-menu">
                            <button 
                                className="action-button btn-outline-primary"
                                onClick={handleEditCurrentPoint}
                            >
                                Modifier ce point
                            </button>
                        </menu>
                    )}
                </>
            ) : (
                <p className="empty-message">Aucun point de réception sélectionné.</p>
            )}

            {onPointChange && (
                <menu type="toolbar" className="reception-actions">
                    <button 
                        className="action-button btn-primary"
                        onClick={() => setMode('select')}
                    >
                        Choisir un point existant
                    </button>
                    <button 
                        className="action-button btn-primary"
                        onClick={() => setMode('create')}
                    >
                        Créer un nouveau point
                    </button>
                </menu>
            )}
        </article>
    );

    const renderSelectMode = () => (
        <article className={`reception-point ${className}`}>
            <header>
                <h4>Sélectionner un point de réception</h4>
            </header>

            <form className="point-selection-form">
                <fieldset>
                    <legend>Point de réception</legend>
                    <select 
                        onChange={handleSelectChange}
                        value={selectedPointId}
                        disabled={isSubmitting}
                    >
                        <option value="">Choisir un point</option>
                        {receptionPoints.map(point => (
                            <option key={point.id} value={point.id}>
                                {point.location}
                            </option>
                        ))}
                    </select>
                </fieldset>
                
                {selectedPointDetails && (
                    <dl className="point-details">
                        <li className="detail-item">
                            <dt>Lieu</dt>
                            <dd>{selectedPointDetails.location}</dd>
                        </li>
                        <li className="detail-item">
                            <dt>Contact</dt>
                            <dd>{selectedPointDetails.contact_name}</dd>
                        </li>
                        <li className="detail-item">
                            <dt>Téléphone</dt>
                            <dd>{selectedPointDetails.contact_phone}</dd>
                        </li>
                        <li className="detail-item">
                            <dt>Email</dt>
                            <dd>{selectedPointDetails.contact_email}</dd>
                        </li>
                        <li className="detail-item">
                            <dt>Horaires</dt>
                            <dd>{selectedPointDetails.opening_time} - {selectedPointDetails.closing_time}</dd>
                        </li>
                    </dl>
                )}

                <menu type="toolbar" className="action-menu">
                    <button 
                        type="button"
                        className="action-button btn-success"
                        onClick={handleChangePoint}
                        disabled={!selectedPointId || isSubmitting}
                    >
                        {isSubmitting ? 'Validation...' : 'Valider'}
                    </button>
                    <button 
                        type="button"
                        className="action-button btn-outline-danger"
                        onClick={() => setMode('view')}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                </menu>
            </form>
        </article>
    );

    const renderCreateMode = () => (
        <article className={`reception-point ${className}`}>
            <header>
                <h4>{editingId ? 'Modifier le point' : 'Nouveau point'}</h4>
            </header>

            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>Informations du lieu</legend>
                    <label>
                        <span>Lieu</span>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            required
                            disabled={isSubmitting}
                        />
                    </label>
                </fieldset>

                <fieldset className="form-fieldset">
                    <legend>Informations de contact</legend>
                    
                    <label className="form-group">
                        <span>Nom du contact</span>
                        <input
                            id="contact-name"
                            type="text"
                            className="text-input"
                            value={formData.contact_name}
                            onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                            required
                            disabled={isSubmitting}
                        />
                    </label>

                    <label className="form-group">
                        <span>Téléphone</span>
                        <input
                            id="contact-phone"
                            type="tel"
                            className="text-input"
                            value={formData.contact_phone}
                            onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                            required
                            disabled={isSubmitting}
                        />
                    </label>

                    <label className="form-group">
                        <span>Email</span>
                        <input
                            id="contact-email"
                            type="email"
                            className="text-input"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                            required
                            disabled={isSubmitting}
                        />
                    </label>
                </fieldset>

                <fieldset className="form-fieldset time-fieldset">
                    <legend>Horaires d'accueil</legend>
                    
                    {renderTimeSelectorToggle()}
                    
                    {!useTimeSelector ? (
                        <div className="form-row">
                            <label className="form-group">
                                <span>Heure d'ouverture</span>
                                <input
                                    id="opening-time"
                                    type="time"
                                    className="time-input"
                                    value={formData.opening_time}
                                    onChange={(e) => handleTimeChange(e, 'opening_time')}
                                    required
                                    disabled={isSubmitting}
                                />
                                <small className="helper-text">Heure : Minutes</small>
                            </label>

                            <label className="form-group">
                                <span>Heure de fermeture</span>
                                <input
                                    id="closing-time"
                                    type="time"
                                    className="time-input"
                                    value={formData.closing_time}
                                    onChange={(e) => handleTimeChange(e, 'closing_time')}
                                    required
                                    disabled={isSubmitting}
                                />
                                <small className="helper-text">Heure : Minutes</small>
                            </label>
                        </div>
                    ) : (
                        <div className="form-row time-selector-row">
                            <div className="form-group time-selector-group">
                                <span>Heure d'ouverture</span>
                                <div className="time-selector-container">
                                    <select
                                        value={timeSelectors.opening_hours}
                                        onChange={(e) => handleTimeSelectorChange(e, 'opening_hours')}
                                        disabled={isSubmitting}
                                        className="time-select hours-select"
                                    >
                                        {hourOptions}
                                    </select>
                                    <span className="time-separator">:</span>
                                    <select
                                        value={timeSelectors.opening_minutes}
                                        onChange={(e) => handleTimeSelectorChange(e, 'opening_minutes')}
                                        disabled={isSubmitting}
                                        className="time-select minutes-select"
                                    >
                                        {minuteOptions}
                                    </select>
                                </div>
                                <small className="helper-text">Heure : Minutes</small>
                            </div>

                            <div className="form-group time-selector-group">
                                <span>Heure de fermeture</span>
                                <div className="time-selector-container">
                                    <select
                                        value={timeSelectors.closing_hours}
                                        onChange={(e) => handleTimeSelectorChange(e, 'closing_hours')}
                                        disabled={isSubmitting}
                                        className="time-select hours-select"
                                    >
                                        {hourOptions}
                                    </select>
                                    <span className="time-separator">:</span>
                                    <select
                                        value={timeSelectors.closing_minutes}
                                        onChange={(e) => handleTimeSelectorChange(e, 'closing_minutes')}
                                        disabled={isSubmitting}
                                        className="time-select minutes-select"
                                    >
                                        {minuteOptions}
                                    </select>
                                </div>
                                <small className="helper-text">Heure : Minutes</small>
                            </div>
                        </div>
                    )}
                </fieldset>

                <menu type="toolbar" className="action-menu">
                    <button 
                        type="submit"
                        className="action-button btn-success"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button 
                        type="button"
                        className="action-button btn-outline-danger"
                        onClick={() => setMode('view')}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                </menu>
            </form>
        </article>
    );

    return (
        <>
            {isLoading ? (
                <p className="loading-message">Chargement...</p>
            ) : (
                mode === 'view' ? renderViewMode() :
                mode === 'select' ? renderSelectMode() :
                renderCreateMode()
            )}
        </>
    );
};

export default ReceptionPointTest;