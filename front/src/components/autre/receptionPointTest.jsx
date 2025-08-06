import { useState, useEffect } from 'react';
import { createReceptionPoint, updateReceptionPoint } from '../../api/admin/receptionPoint';
import { getReceptionPointById, getAllReceptionPoints } from '../../api/publicApi';
import { updateStayReceptionPoint } from '../../api/admin/stay';
import { validateReceptionPoint } from '../../utils/validateReceptionPoint';
import { format, parse, isValid } from 'date-fns';

const ReceptionPointTest = ({ stayId, currentReceptionPointId, onPointChange }) => {
    const [currentPoint, setCurrentPoint] = useState(null);
    const [receptionPoints, setReceptionPoints] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
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
        console.log("Navigateur Firefox détecté?", isFirefox);
        setUseTimeSelector(isFirefox);
        
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
            
            console.log("Heures mises à jour depuis les sélecteurs:", opening_time, closing_time);
        }
    }, [timeSelectors, useTimeSelector]);
    
    // Fonction simplifiée pour normaliser les horaires au format HH:mm
    const normalizeTimeFormat = (timeString) => {
        console.log("Normalisation de l'heure:", timeString);
        if (!timeString) return '';
        
        try {
            // Cas 1: Si le timeString est déjà au format HH:mm
            if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
                // On s'assure juste que les heures sont sur 2 chiffres
                const [hours, minutes] = timeString.split(':');
                const result = `${hours.padStart(2, '0')}:${minutes}`;
                console.log("Heure normalisée (déjà au bon format):", result);
                return result;
            }
            
            // Cas 2: Essayer de parser avec date-fns
            try {
                // Tenter de parser comme HH:mm
                const date = parse(timeString, 'HH:mm', new Date());
                if (isValid(date)) {
                    const result = format(date, 'HH:mm');
                    console.log("Heure normalisée (via date-fns parse):", result);
                    return result;
                }
                throw new Error('Format invalide');
            } catch (error) {
                console.log("Échec de parse date-fns:", error.message);
                // Cas 3: Fallback avec Date standard
                const date = new Date(`1970-01-01T${timeString}`);
                if (isValid(date)) {
                    const result = format(date, 'HH:mm');
                    console.log("Heure normalisée (via Date):", result);
                    return result;
                }
            }
            
            throw new Error('Impossible de parser le format d\'heure');
        } catch (error) {
            console.error('Erreur de normalisation d\'horaire:', error);
            
            // Cas 4: Extraction directe des segments si possible
            if (timeString && timeString.includes(':')) {
                const parts = timeString.split(':');
                const h = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10);
                
                if (!isNaN(h) && !isNaN(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
                    const result = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    console.log("Heure normalisée (via extraction directe):", result);
                    return result;
                }
            }
            
            // En dernier recours, retourner une valeur par défaut
            console.log("Échec de normalisation, retour à 00:00");
            return '00:00';
        }
    };

    // Initialiser les sélecteurs d'heure à partir d'une chaîne HH:MM
    const initTimeSelectorsFromString = (timeString, type) => {
        console.log(`Initialisation des sélecteurs pour ${type} à partir de:`, timeString);
        
        const defaultHours = type === 'opening' ? '09' : '18';
        const defaultMinutes = '00';
        
        if (!timeString) {
            return type === 'opening' 
                ? {opening_hours: defaultHours, opening_minutes: defaultMinutes}
                : {closing_hours: defaultHours, closing_minutes: defaultMinutes};
        }
        
        try {
            const [hours, minutes] = timeString.split(':');
            const formattedHours = hours.padStart(2, '0');
            const formattedMinutes = minutes.padStart(2, '0');
            
            console.log(`Sélecteurs ${type} initialisés:`, formattedHours, formattedMinutes);
            
            return type === 'opening'
                ? {opening_hours: formattedHours, opening_minutes: formattedMinutes}
                : {closing_hours: formattedHours, closing_minutes: formattedMinutes};
        } catch (error) {
            console.error(`Erreur lors de l'initialisation des sélecteurs ${type}:`, error);
            return type === 'opening' 
                ? {opening_hours: defaultHours, opening_minutes: defaultMinutes}
                : {closing_hours: defaultHours, closing_minutes: defaultMinutes};
        }
    };
    
    const loadReceptionPoints = () => {
        console.log("Chargement des points de réception");
        // Si les données ont été chargées il y a moins de 5 minutes, ne pas recharger
        if (lastFetchTime && (Date.now() - lastFetchTime) < 300000) {
            console.log("Utilisation du cache des points de réception");
            return;
        }

        setIsLoading(true);
        getAllReceptionPoints()
            .then(res => {
                console.log("Points de réception reçus:", res.data.length);
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
                setMessage({ type: 'error', text: "Erreur lors du chargement des points de réception" });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    
    const loadCurrentPoint = () => {
        if (!currentReceptionPointId) return;
    
        console.log("Chargement du point actuel:", currentReceptionPointId);
        getReceptionPointById(currentReceptionPointId)
            .then(res => {
                if (res.status === 200) {
                    console.log("Point actuel reçu:", res.data);
                    // Normaliser les horaires pour l'affichage
                    const point = {
                        ...res.data,
                        opening_time: normalizeTimeFormat(res.data.opening_time),
                        closing_time: normalizeTimeFormat(res.data.closing_time)
                    };
                    setCurrentPoint(point);
                    console.log("Point actuel normalisé:", point);
                }
            })
            .catch(error => {
                console.error("Erreur chargement point actuel:", error);
                setMessage({ type: 'error', text: "Erreur lors du chargement du point actuel" });
            });
    };

    // Fonction pour initialiser le formulaire avec les données du point actuel
    const handleEditCurrentPoint = () => {
        if (!currentPoint) return;
        
        console.log("Modification du point actuel:", currentPoint);
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
        
        console.log("Formulaire initialisé pour modification:", formData);
        setMode('create'); // Réutiliser le mode création pour l'édition
    };
    
    const handleChangePoint = () => {
        if (!selectedPointId) return;
        
        console.log("Changement de point de réception:", selectedPointId);
        setIsSubmitting(true);

        if (stayId) {
            // Si un stayId existe, mettre à jour le point de réception pour ce séjour
            updateStayReceptionPoint(stayId, selectedPointId)
                .then(res => {
                    if (res.status === 200) {
                        console.log("Point de réception mis à jour pour le séjour:", res.data);
                        onPointChange && onPointChange(selectedPointId);
                        loadCurrentPoint();
                        setMessage({ type: 'success', text: 'Point de réception modifié avec succès' });
                        setTimeout(() => {
                            setMode('view');
                        }, 1500);
                    }
                })
                .catch(error => {
                    console.error("Erreur lors du changement de point:", error);
                    setMessage({ type: 'error', text: 'Erreur lors du changement de point de réception' });
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        } else {
            // Si c'est un nouveau séjour, simplement mettre à jour l'état local
            console.log("Sélection d'un point pour un nouveau séjour");
            onPointChange && onPointChange(selectedPointId);
            const selectedPoint = receptionPoints.find(point => point.id === parseInt(selectedPointId));
            setCurrentPoint(selectedPoint); // Déjà normalisé lors du chargement initial
            setMessage({ type: 'success', text: 'Point de réception sélectionné' });
            setIsSubmitting(false);
            setTimeout(() => {
                setMode('view');
            }, 1500);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Soumission du formulaire:", formData);
        setMessage({ type: '', text: '' });
        setIsSubmitting(true);
    
        const receptionPointFields = [
            { name: "location", value: formData.location },
            { name: "contact_name", value: formData.contact_name },
            { name: "contact_phone", value: formData.contact_phone },
            { name: "contact_email", value: formData.contact_email },
            { name: "opening_time", value: formData.opening_time },
            { name: "closing_time", value: formData.closing_time }
        ];
    
        console.log("Validation des champs:", receptionPointFields);
        const errors = validateReceptionPoint(receptionPointFields);
        if (errors.length > 0) {
            console.error("Erreurs de validation:", errors);
            setMessage({ type: "error", text: errors.join(", ") });
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
    
        console.log("Données à envoyer:", dataToSend);
    
        if (editingId) {
            console.log("Mise à jour du point:", editingId);
            updateReceptionPoint(editingId, dataToSend)
                .then((res) => {
                    if (res.status === 200) {
                        console.log("Point mis à jour avec succès:", res.data);
                        // Les horaires sont déjà normalisés lors de l'envoi
                        const updatedPoint = {
                            ...res.data,
                            opening_time: normalizeTimeFormat(res.data.opening_time),
                            closing_time: normalizeTimeFormat(res.data.closing_time)
                        };
                        
                        // Mettre à jour les données locales
                        setCurrentPoint(updatedPoint);
                        console.log("Point courant mis à jour:", updatedPoint);
    
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
                    console.error("Erreur lors de la mise à jour:", err);
                    setMessage({ type: 'error', text: 'Erreur lors de la modification du point de réception' });
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        } else {
            console.log("Création d'un nouveau point");
            createReceptionPoint(dataToSend)
                .then((res) => {
                    if (res.status === 201) {
                        console.log("Point créé avec succès:", res.data);
                        const newPoint = {
                            ...res.data,
                            opening_time: normalizeTimeFormat(res.data.opening_time),
                            closing_time: normalizeTimeFormat(res.data.closing_time)
                        };
                        
                        // Mettre à jour les données locales
                        setCurrentPoint(newPoint);
                        console.log("Nouveau point défini comme courant:", newPoint);
                        
                        // Ajouter le nouveau point à la liste des points de réception
                        setReceptionPoints(prevPoints => [...prevPoints, newPoint]);

                        if (stayId) {
                            // Si un stayId existe, attribuer le nouveau point de réception au séjour
                            console.log("Attribution du nouveau point au séjour:", stayId, res.data.id);
                            return updateStayReceptionPoint(stayId, res.data.id)
                                .then(updateRes => {
                                    if (updateRes.status === 200) {
                                        console.log("Attribution réussie:", updateRes.data);
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
                            console.log("Nouveau point créé pour le nouveau séjour");
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
                    console.error("Erreur lors de la création:", err);
                    setMessage({ 
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
        console.log("Sélection d'un point:", newSelectedId);
        setSelectedPointId(newSelectedId);
        
        // Si un point est sélectionné, trouver ses détails
        if (newSelectedId) {
            const selectedPoint = receptionPoints.find(point => point.id === parseInt(newSelectedId));
            console.log("Détails du point sélectionné:", selectedPoint);
            setSelectedPointDetails(selectedPoint); // Déjà normalisé lors du chargement initial
        } else {
            setSelectedPointDetails(null);
        }
    };

    // Gérer directement les changements de champ horaire via l'input classique
    const handleTimeChange = (e, field) => {
        // L'input de type time renvoie déjà un format HH:MM
        console.log(`Modification du champ ${field}:`, e.target.value);
        const normalizedValue = normalizeTimeFormat(e.target.value);
        console.log(`Valeur normalisée pour ${field}:`, normalizedValue);
        setFormData({...formData, [field]: normalizedValue});
    };
    
    // Gérer les changements de sélecteurs d'heure
    const handleTimeSelectorChange = (e, field) => {
        console.log(`Modification du sélecteur ${field}:`, e.target.value);
        setTimeSelectors({
            ...timeSelectors,
            [field]: e.target.value
        });
        
        // Le formData sera mis à jour automatiquement par l'effet
    };

    // Générer des options pour les heures et minutes
    const generateHourOptions = () => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            const formattedHour = i.toString().padStart(2, '0');
            hours.push(<option key={formattedHour} value={formattedHour}>{formattedHour}</option>);
        }
        return hours;
    };
    
    const generateMinuteOptions = () => {
        const minutes = [];
        for (let i = 0; i < 60; i += 5) { // Par pas de 5 minutes
            const formattedMinute = i.toString().padStart(2, '0');
            minutes.push(<option key={formattedMinute} value={formattedMinute}>{formattedMinute}</option>);
        }
        return minutes;
    };

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
        <section className="reception-view-mode">
            {currentPoint ? (
                <article className="current-point">
                    <h4>Point de réception actuel</h4>
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

                    {/* Bouton pour modifier le point actuel */}
                    {onPointChange && (
                        <button 
                            className="btn-outline-primary action-button edit-current-button"
                            onClick={handleEditCurrentPoint}
                            aria-label="Modifier ce point de réception"
                        >
                            Modifier ce point
                        </button>
                    )}
                </article>
            ) : (
                <p className="empty-message">Aucun point de réception sélectionné.</p>
            )}

            {/* Seulement afficher les boutons d'action si l'objet onPointChange est passé (permettant les modifications) */}
            {onPointChange && (
                <nav className="reception-actions">
                    <button 
                        className="btn-primary action-button"
                        onClick={() => setMode('select')}
                        aria-label="Sélectionner un point de réception existant"
                    >
                        Choisir un point existant
                    </button>
                    <button 
                        className="btn-primary action-button"
                        onClick={() => setMode('create')}
                        aria-label="Créer un nouveau point de réception"
                    >
                        Créer un nouveau point
                    </button>
                </nav>
            )}
        </section>
    );

    const renderSelectMode = () => (
        <section className="reception-select-mode">
            <header className="section-header">
                <h4>Sélectionner un point de réception</h4>
            </header>

            <form className="point-selection-form">
                <fieldset className="form-group">
                    <legend>Lieu du point de réception</legend>
                    <select 
                        id="point-select"
                        className="select-input"
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
                    <article className="selected-point-details">
                        <h4>Détails du point sélectionné</h4>
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
                    </article>
                )}

                <footer className="form-actions" role="group" aria-label="Actions du formulaire">
                    <button 
                        type="button"
                        className="btn-success action-button"
                        onClick={handleChangePoint}
                        disabled={!selectedPointId || isSubmitting}
                    >
                        {isSubmitting ? 'Validation...' : 'Valider la sélection'}
                    </button>
                    <button 
                        type="button"
                        className="btn-outline-danger action-button"
                        onClick={() => {
                            setMode('view');
                            setSelectedPointId('');
                            setSelectedPointDetails(null);
                        }}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                </footer>
            </form>
        </section>
    );

    const renderCreateMode = () => (
        <section className="reception-create-mode">
            <header className="section-header">
                <h4>{editingId ? 'Modifier le point de réception' : 'Créer un nouveau point de réception'}</h4>
            </header>

            <form className="point-creation-form" onSubmit={handleSubmit}>
                <fieldset className="form-fieldset">
                    <legend>Informations du lieu</legend>
                    
                    <label className="form-group">
                        <span>Lieu</span>
                        <input
                            id="location"
                            type="text"
                            className="text-input"
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
                                        {generateHourOptions()}
                                    </select>
                                    <span className="time-separator">:</span>
                                    <select
                                        value={timeSelectors.opening_minutes}
                                        onChange={(e) => handleTimeSelectorChange(e, 'opening_minutes')}
                                        disabled={isSubmitting}
                                        className="time-select minutes-select"
                                    >
                                        {generateMinuteOptions()}
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
                                        {generateHourOptions()}
                                    </select>
                                    <span className="time-separator">:</span>
                                    <select
                                        value={timeSelectors.closing_minutes}
                                        onChange={(e) => handleTimeSelectorChange(e, 'closing_minutes')}
                                        disabled={isSubmitting}
                                        className="time-select minutes-select"
                                    >
                                        {generateMinuteOptions()}
                                    </select>
                                </div>
                                <small className="helper-text">Heure : Minutes</small>
                            </div>
                        </div>
                    )}
                </fieldset>

                <footer className="form-actions" role="group" aria-label="Actions du formulaire">
                    <button 
                        type="submit"
                        className="btn-success action-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (editingId ? 'Sauvegarde...' : 'Création...') : (editingId ? 'Sauvegarder' : 'Créer')}
                    </button>
                    <button 
                        type="button"
                        className="btn-outline-danger action-button"
                        onClick={() => {
                            setMode('view');
                            setFormData({
                                location: '',
                                contact_name: '',
                                contact_phone: '',
                                contact_email: '',
                                opening_time: '',
                                closing_time: ''
                            });
                            setEditingId(null);
                        }}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                </footer>
            </form>
        </section>
    );

    return (
        <article className="reception-point-management">
            {message.text && (
                <aside 
                    className={`alert alert-${message.type === 'error' ? 'danger' : message.type}`}
                    role="alert"
                >
                    {message.text}
                </aside>
            )}

            {isLoading && <p className="loading-message">Chargement des points de réception...</p>}
            
            {/* Contenu principal selon le mode actif */}
            {mode === 'view' && renderViewMode()}
            {mode === 'select' && renderSelectMode()}
            {mode === 'create' && renderCreateMode()}
        </article>
    );
};

export default ReceptionPointTest;