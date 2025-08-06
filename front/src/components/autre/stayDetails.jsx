import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateStay, deleteStay } from '../../api/stay';
import { updateStayStore, deleteStayStore } from '../../slices/staySlice';
import { selectUser } from '../../slices/userSlice'; // Importation directe du sélecteur
import { format } from 'date-fns';
// @ts-ignore
import { decodeHTML } from '../../utils/decodeHtml';
import ReceptionPointTest from './receptionPointTest';

const StayDetails = ({ stay, onUpdate }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser); // Utilisation du sélecteur importé
    const userId = user.infos?.id; // Accès à l'ID de l'utilisateur via le sélecteur
    const stayId = stay?.id;
    
    // États pour les champs du formulaire
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [technical_level, setTechnical_level] = useState('');
    const [physical_level, setPhysical_level] = useState('');
    const [min_participant, setMin_participant] = useState('');
    const [max_participant, setMax_participant] = useState('');
    const [start_date, setStart_date] = useState('');
    const [end_date, setEnd_date] = useState('');
    const [status, setStatus] = useState('');
    const [receptionPoint, setReceptionPoint] = useState('');
    
    // États de l'interface
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [activeTab, setActiveTab] = useState('details'); // 'details' ou 'reception'
    
    // Référence pour l'animation (cohérence avec autres composants)
    const isInitialMount = useRef(true);

    // Fonction de formatage pour la date (avant soumission)
    const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd');

    // Fonction de formatage pour l'affichage en mode lecture
    const formatDateForDisplay = (date) => {
        if (!date) return '';
        return format(new Date(date), 'dd/MM/yyyy');
    };

    // Fonction de formatage pour l'input en mode édition
    const formatDateForInput = (date) => {
        if (!date) return '';
        return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
    };

    // Charger les données du séjour
    useEffect(() => {
        if (stay) {
            setTitle(decodeHTML(stay.title));
            setDescription(decodeHTML(stay.description));
            setLocation(decodeHTML(stay.location));
            setPrice(stay.price);
            setTechnical_level(stay.technical_level);
            setPhysical_level(stay.physical_level);
            setMin_participant(stay.min_participant);
            setMax_participant(stay.max_participant);
            setStart_date(stay.start_date);
            setEnd_date(stay.end_date);
            setStatus(stay.status);
            setReceptionPoint(stay.reception_point_id);
        }
    }, [stay]);

    // Gérer les messages temporaires
    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [message]);

    // Gestion de l'envoi du formulaire pour les détails du séjour
    const handleSubmitDetails = async (e) => {
        e.preventDefault();
        
        if (!stay?.id) {
            setMessage({ type: "error", text: "L'ID du séjour est manquant" });
            return;
        }
        
        if (!userId) {
            setMessage({ type: "error", text: "Vous devez être connecté pour effectuer cette action" });
            return;
        }
        
        setIsSubmitting(true);
        setMessage({ type: "", text: "" });

        // Formater les dates avant l'envoi
        const formattedStartDate = formatDate(start_date);
        const formattedEndDate = formatDate(end_date);

        const updatedStay = {
            title,
            description,
            location,
            price: parseFloat(price),
            technical_level,
            physical_level,
            min_participant: parseInt(min_participant),
            max_participant: parseInt(max_participant),
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            reception_point_id: receptionPoint,
            status,
            user_id: userId, // Utilisation de l'ID de l'utilisateur connecté (guide)
        };
        
        try {
            const res = await updateStay(stay.id, updatedStay);
            if (res.status === 200) {
                dispatch(updateStayStore(res.stay));
                setMessage({ type: "success", text: "Séjour mis à jour avec succès !" });
                
                // Mettre à jour le composant parent si nécessaire
                if (onUpdate) onUpdate(res.stay);
                
                // Revenir en mode vue après quelques secondes
                setTimeout(() => setIsEditing(false), 1600);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du séjour:", error);
            setMessage({ type: "error", text: "Erreur lors de la mise à jour du séjour" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Gestion du changement de point de réception
    const handlePointChange = async (newPointId) => {
        setIsSubmitting(true);
        setReceptionPoint(newPointId);
        
        try {
            const res = await updateStay(stay.id, { 
                ...stay, 
                reception_point_id: newPointId 
            });
            
            if (res.status === 200) {
                dispatch(updateStayStore({ 
                    ...stay,
                    id: stay.id,
                    reception_point_id: newPointId 
                }));
                
                setMessage({ type: "success", text: "Point de réception mis à jour" });
                
                // Mettre à jour le composant parent si nécessaire
                if (onUpdate) onUpdate(res.stay);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du point de réception:", error);
            setMessage({ type: "error", text: "Erreur lors de la mise à jour du point de réception" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Gestion de la suppression du séjour
    const handleDeleteStay = async () => {
        if (!stay?.id) {
            setMessage({ type: "error", text: "L'ID du séjour est manquant" });
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const res = await deleteStay(stay.id);
            if (res.status === 200) {
                // Mettre à jour le store
                dispatch(deleteStayStore(stay.id));
                setMessage({ type: "success", text: "Séjour supprimé avec succès !" });
                
                // Notifier le parent (pour fermer la carte ou rafraîchir la vue)
                if (onUpdate) {
                    onUpdate(null);
                }
            } else {
                setMessage({ type: "error", text: res.message || "Erreur lors de la suppression du séjour" });
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du séjour:", error);
            setMessage({ type: "error", text: "Erreur lors de la suppression du séjour" });
        } finally {
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Méthode pour récupérer le nom du niveau sous forme lisible
    const getLevelName = (level) => {
        const levels = {
            'facile': 'Facile',
            'modéré': 'Modéré',
            'sportif': 'Sportif',
            'difficile': 'Difficile',
            'extreme': 'Extrême'
        };
        return levels[level] || level;
    };

    // Mode visualisation
    const renderViewMode = () => {
        return (
            <section className="stay-details-view">
                <header className="details-header">
                    <h3>Informations du séjour</h3>
                    
                    <nav className="details-tabs">
                        <button 
                            type="button"
                            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                            aria-pressed={activeTab === 'details'}
                        >
                            Détails généraux
                        </button>
                        <button 
                            type="button"
                            className={`tab-button ${activeTab === 'reception' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reception')}
                            aria-pressed={activeTab === 'reception'}
                        >
                            Point de réception
                        </button>
                    </nav>
                    
                    {activeTab === 'details' ? (
                        <dl className="stay-info-list">
                            <div className="stay-info-item">
                                <dt>Titre</dt>
                                <dd>{title}</dd>
                            </div>
                            
                            <div className="stay-info-item">
                                <dt>Description</dt>
                                <dd>{description}</dd>
                            </div>
                            
                            <div className="stay-info-item">
                                <dt>Localisation</dt>
                                <dd>{location}</dd>
                            </div>
                            
                            <div className="stay-info-item">
                                <dt>Prix</dt>
                                <dd>{price}€</dd>
                            </div>
                            
                            <div className="stay-info-item">
                                <dt>Niveau technique</dt>
                                <dd className={`level level-${technical_level}`}>{getLevelName(technical_level)}</dd>
                            </div>
                            
                            <div className="stay-info-item">
                                <dt>Niveau physique</dt>
                                <dd className={`level level-${physical_level}`}>{getLevelName(physical_level)}</dd>
                            </div>
                            
                            <div className="stay-info-item">
                                <dt>Participants</dt>
                                <dd>Min: {min_participant} - Max: {max_participant}</dd>
                            </div>
                            
                            <div className="stay-info-item">
                                <dt>Dates</dt>
                                <dd>Du {formatDateForDisplay(start_date)} au {formatDateForDisplay(end_date)}</dd>
                            </div>
                            
                            {status && (
                                <div className="stay-info-item">
                                    <dt>Statut</dt>
                                    <dd>{status}</dd>
                                </div>
                            )}
                        </dl>
                    ) : (
                        <div className="stay-reception-point">
                            <h4>Point de réception</h4>
                            <ReceptionPointTest 
                                stayId={stayId}
                                currentReceptionPointId={receptionPoint}
                                onPointChange={null}  // Mode visualisation uniquement
                            />
                        </div>
                    )}
                </header>

                <aside className="details-action">
                    <button 
                        className="btn-primary action-button"
                        onClick={() => setIsEditing(true)}
                        aria-label="Modifier les informations"
                    >
                        Modifier
                    </button>
                </aside>
            </section>
        );
    };

    // Mode édition
    const renderEditMode = () => {
        return (
            <section className="stay-details-edit">
                <header className="section-header">
                    <h3>Modifier les informations du séjour</h3>
                </header>
                
                {message.text && (
                    <aside 
                        className={`alert alert-${message.type === 'error' ? 'danger' : message.type}`}
                        role="alert"
                    >
                        {message.text}
                    </aside>
                )}

                <nav className="details-tabs">
                    <button 
                        type="button"
                        className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                        disabled={isSubmitting}
                        aria-pressed={activeTab === 'details'}
                    >
                        Détails généraux
                    </button>
                    <button 
                        type="button"
                        className={`tab-button ${activeTab === 'reception' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reception')}
                        disabled={isSubmitting}
                        aria-pressed={activeTab === 'reception'}
                    >
                        Point de réception
                    </button>
                </nav>

                {activeTab === 'details' ? (
                    <form className="stay-edit-form" onSubmit={handleSubmitDetails}>
                        <fieldset className="stay-edit-fieldset">
                            <legend>Informations générales</legend>
                            
                            <div className="form-group">
                                <label htmlFor="stay-title">Titre</label>
                                <input
                                    id="stay-title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    className="text-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="stay-description">Description</label>
                                <textarea
                                    id="stay-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    rows={4}
                                    className="text-area"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="stay-location">Localisation</label>
                                <input
                                    id="stay-location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    className="text-input"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="stay-price">Prix (€)</label>
                                <input
                                    id="stay-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    className="text-input"
                                />
                            </div>
                        </fieldset>
                        
                        <fieldset className="stay-edit-fieldset">
                            <legend>Niveaux et participants</legend>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="stay-tech-level">Niveau technique</label>
                                    <select
                                        id="stay-tech-level"
                                        value={technical_level}
                                        onChange={(e) => setTechnical_level(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="select-input"
                                    >
                                        <option value="facile">Facile</option>
                                        <option value="modéré">Modéré</option>
                                        <option value="sportif">Sportif</option>
                                        <option value="difficile">Difficile</option>
                                        <option value="extreme">Extrême</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="stay-phys-level">Niveau physique</label>
                                    <select
                                        id="stay-phys-level"
                                        value={physical_level}
                                        onChange={(e) => setPhysical_level(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="select-input"
                                    >
                                        <option value="facile">Facile</option>
                                        <option value="modéré">Modéré</option>
                                        <option value="sportif">Sportif</option>
                                        <option value="difficile">Difficile</option>
                                        <option value="extreme">Extrême</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="stay-min-part">Participants min.</label>
                                    <input
                                        id="stay-min-part"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={min_participant}
                                        onChange={(e) => setMin_participant(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="text-input"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="stay-max-part">Participants max.</label>
                                    <input
                                        id="stay-max-part"
                                        type="number"
                                        min={min_participant}
                                        step="1"
                                        value={max_participant}
                                        onChange={(e) => setMax_participant(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="text-input"
                                    />
                                </div>
                            </div>
                        </fieldset>
                        
                        <fieldset className="stay-edit-fieldset">
                            <legend>Dates du séjour</legend>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="stay-start-date">Date de début</label>
                                    <input
                                        id="stay-start-date"
                                        type="datetime-local"
                                        value={formatDateForInput(start_date)}
                                        onChange={(e) => setStart_date(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="date-input"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="stay-end-date">Date de fin</label>
                                    <input
                                        id="stay-end-date"
                                        type="datetime-local"
                                        value={formatDateForInput(end_date)}
                                        onChange={(e) => setEnd_date(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="date-input"
                                    />
                                </div>
                            </div>
                        </fieldset>
                        
                        <menu type="toolbar" className="form-actions">
                            <button 
                                type="submit"
                                className="btn-success action-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Sauvegarde en cours...' : 'Sauvegarder'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(false)}
                                className="btn-outline-danger action-button"
                                disabled={isSubmitting}
                            >
                                Annuler
                            </button>
                        </menu>
                    </form>
                ) : (
                    <section className="reception-point-section">
                        <h4>Gérer le point de réception</h4>
                        <ReceptionPointTest 
                            stayId={stayId}
                            currentReceptionPointId={receptionPoint}
                            onPointChange={handlePointChange}
                        />
                    </section>
                )}

                {/* Zone de danger pour la suppression du séjour */}
                <section className="danger-zone">
                    <h4>Attention</h4>
                    <p>
                        La suppression d'un séjour est une action irréversible. Toutes les informations associées à ce séjour seront définitivement perdues.
                    </p>
                    
                    {!showDeleteConfirm ? (
                        <button 
                            type="button" 
                            className="btn-danger action-button"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSubmitting}
                        >
                            Supprimer ce séjour
                        </button>
                    ) : (
                        <div className="delete-confirmation">
                            <h4>Confirmer la suppression</h4>
                            <p>
                                Êtes-vous vraiment sûr de vouloir supprimer ce séjour ? Cette action est irréversible.
                            </p>
                            <div className="action-buttons">
                                <button 
                                    type="button" 
                                    className="btn-danger action-button"
                                    onClick={handleDeleteStay}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Suppression...' : 'Confirmer la suppression'}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-outline-danger action-button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <footer className="details-edit-footer">
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
        <article className="stay-details-management">
            {isEditing ? renderEditMode() : renderViewMode()}
        </article>
    );
};

export default StayDetails;