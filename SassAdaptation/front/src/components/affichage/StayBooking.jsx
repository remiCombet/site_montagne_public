import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../context/authContext';
import { selectUser } from '../../slices/userSlice';
import { selectSelectedStay, addStayRequest } from '../../slices/staySlice';
import { addStayParticipant /* checkUserStayParticipation - temporairement désactivé */ } from '../../api/publicApi';
import { Link } from 'react-router-dom';

const StayBooking = ({ stayId }) => {
    const [peopleNumber, setPeopleNumber] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [hasExistingRequest, setHasExistingRequest] = useState(false); // Garder la variable mais ne pas l'utiliser
    
    const { isLoggedIn } = useAuth();
    const userState = useSelector(selectUser);
    const currentStay = useSelector(selectSelectedStay);
    const dispatch = useDispatch();
    
    // Calcul des places disponibles
    const maxParticipants = currentStay?.max_participant || 0;
    const currentParticipants = currentStay?.current_participant || 0;
    const availablePlaces = Math.max(0, maxParticipants - currentParticipants);
    const minParticipants = currentStay?.min_participant || 1;

    const isFullyBooked = availablePlaces <= 0;

    // Désactiver temporairement la vérification
    /*
    useEffect(() => {
        if (isLoggedIn && stayId) {
            checkUserStayParticipation(stayId)
                .then(response => {
                    if (response && response.status === 200 && response.exists) {
                        setHasExistingRequest(true);
                    }
                })
                .catch(err => {
                    console.warn("Erreur lors de la vérification des demandes existantes:", err);
                });
        }
    }, [stayId, isLoggedIn]);
    */

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isLoggedIn || !userState.isLogged) {
            setError("Vous devez être connecté pour faire une demande de réservation.");
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        
        const userId = userState.infos?.id;
        console.log("ID utilisateur récupéré:", userId);

        if (!userId) {
            console.error("ID utilisateur manquant dans:", userState.infos);
            setError("Erreur d'identification de l'utilisateur. Veuillez vous reconnecter.");
            setIsSubmitting(false);
            return;
        }
        
        try {
            
            const participantData = {
                stay_id: parseInt(stayId),
                participant_id: userId,
                people_number: parseInt(peopleNumber) || 0,
                status: 'en_attente_validation',
                comment: comment.trim()
            };
            
            console.log("Envoi de la demande de réservation avec données:", participantData);
            
            const response = await addStayParticipant(participantData);
            console.log("Réponse complète de l'API:", response);
            
            if (response.status === 200 && response.participants) {
                // Ajouter la demande au store Redux
                dispatch(addStayRequest({
                    ...response.participants,
                    stay_id: stayId
                }));
                
                setSuccess("Votre demande a été enregistrée avec succès ! Nous vous contacterons pour confirmer votre participation.");
                setPeopleNumber(0);
                setComment('');
                // setHasExistingRequest(true); // Ne pas définir pour continuer à tester
            } else {
                setError(response.msg || "Une erreur est survenue lors de la création de la demande.");
                console.error("Erreur API:", response);
            }
        } catch (err) {
            setError("Erreur lors de la soumission de votre demande. Veuillez réessayer.");
            console.error("Erreur lors de l'envoi de la demande:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Désactiver temporairement cette condition
    /*
    if (hasExistingRequest) {
        return (
            <section className="stay-booking stay-booking--existing">
                <div className="stay-booking__message">
                    <h2 className="stay-content__title">Demande en cours</h2>
                    <p>Vous avez déjà effectué une demande de réservation pour ce séjour.</p>
                    <p>Vous recevrez une confirmation par email une fois votre demande traitée.</p>
                </div>
            </section>
        );
    }
    */

    // Le reste du composant reste inchangé...
    return (
        <section className="stay-booking">
            <h2 className="stay-content__title">Réserver ce séjour</h2>
            
            {!isLoggedIn ? (
                <div className="stay-booking__auth-required">
                    <p>Vous devez être connecté pour effectuer une réservation.</p>
                    <div className="stay-booking__auth-buttons">
                        <Link 
                            to="/auth" 
                            state={{ showRegister: false }}
                            className="stay-booking__login-btn"
                        >
                            Se connecter
                        </Link>
                        <Link 
                            to="/auth" 
                            state={{ showRegister: true }}
                            className="stay-booking__register-btn"
                        >
                            S'inscrire
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <form className="stay-booking__form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="stay-booking__error">{error}</div>
                        )}
                        
                        {success && (
                            <div className="stay-booking__success">{success}</div>
                        )}
                        
                        <div className="stay-booking__form-group">
                            <label htmlFor="peopleNumber">Nombre d'accompagnants:</label>
                            <input 
                                type="number" 
                                id="peopleNumber" 
                                name="peopleNumber"
                                min="0" 
                                max={isFullyBooked ? 0 : availablePlaces - 1}
                                value={peopleNumber} 
                                onChange={(e) => setPeopleNumber(parseInt(e.target.value) || 0)}
                                disabled={isFullyBooked || isSubmitting}
                            />
                            <span className="stay-booking__form-help">
                                Sans compter vous-même (déjà inclus)
                            </span>
                        </div>
                        
                        <div className="stay-booking__form-group">
                            <label htmlFor="comment">Commentaires (optionnel):</label>
                            <textarea 
                                id="comment" 
                                name="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Questions, besoins spécifiques..."
                                disabled={isSubmitting}
                                rows={4}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="stay-booking__submit-btn"
                            disabled={isFullyBooked || isSubmitting}
                        >
                            {isSubmitting ? "Envoi en cours..." : "Réserver"}
                        </button>

                        {isFullyBooked && (
                            <p className="stay-booking__fully-booked-message">
                                Ce séjour est complet. Consultez nos autres séjours disponibles.
                            </p>
                        )}
                    </form>
                </>
            )}
        </section>
    );
};

export default StayBooking;