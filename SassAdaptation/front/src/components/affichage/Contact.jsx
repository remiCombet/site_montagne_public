import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DOMpurify from 'dompurify';
import MessagePopup from '../admin/messagePopup';
import { useAuth } from '../../context/authContext';
import { validateContactMessage, checkRateLimit } from '../../utils/validateContactMessage';

const Contact = () => {
    // État existant
    const { isLoggedIn, userData } = useAuth();
    const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
    const form = useRef();
    const [status, setStatus] = useState({
        submitting: false,
        submitted: false,
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [messageLength, setMessageLength] = useState(0);
    const MAX_MESSAGE_LENGTH = 2000;
    
    // Gérer la saisie du message et mettre à jour le compteur
    const handleMessageInput = (e) => {
        setMessageLength(e.target.value.length);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Vérifier si une soumission est déjà en cours
        if (status.submitting) {
            return;
        }
        
        // Vérifier la limitation de débit côté client (pour UX)
        const rateCheck = checkRateLimit(lastSubmissionTime);
        if (!rateCheck.canSubmit) {
            setMessage({ 
                type: 'error', 
                text: `Merci de patienter ${rateCheck.waitTime} secondes avant d'envoyer un nouveau message.` 
            });
            return;
        }
        
        // Récupérer et sanitiser le message côté client
        const messageContent = form.current.message.value;
        const sanitizedMessage = DOMpurify.sanitize(messageContent.trim());
        
        // Validation côté client
        const validation = validateContactMessage(sanitizedMessage);
        if (!validation.isValid) {
            setMessage({ 
                type: 'error', 
                text: validation.errors[0]
            });
            return;
        }
        
        setStatus({ submitting: true, submitted: false });
        
        try {
            // Appel à notre API backend au lieu d'EmailJS directement
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: sanitizedMessage,
                    name: userData ? `${userData.firstname || ''} ${userData.lastname || ''}`.trim() : '',
                    email: userData?.email || ''
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setStatus({ submitting: false, submitted: true });
                setLastSubmissionTime(Date.now());
                setMessage({ 
                    type: 'success', 
                    text: data.message
                });
                form.current.reset();
                setMessageLength(0);
            } else {
                throw new Error(data.message || 'Erreur lors de l\'envoi');
            }
        } catch (error) {
            setStatus({ submitting: false, submitted: false });
            setMessage({ 
                type: 'error', 
                text: error.message || 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.'
            });
        }
    };

    // Modifier le textarea dans le JSX pour inclure le compteur
    return (
        <section className={`contact ${isLoggedIn ? 'contact--logged' : ''}`} id="contact">
            {message.text && (
                <MessagePopup 
                    message={message.text}
                    type={message.type}
                    onClose={() => setMessage({ type: '', text: '' })}
                />
            )}

            <header className="contact__header">
                <h2 className="contact__title">Contact</h2>
                <p className="contact__subtitle">Pour toute question ou information, n'hésitez pas à nous contacter :</p>
            </header>

            <address className="contact__details">
                <div className="contact__item">
                    <h3 className="contact__item-title">Adresse mail</h3>
                    <p className="contact__item-value">
                        <a href="mailto:contact@montagne-adventure.fr">contact@montagne-adventure.fr</a>
                    </p>
                </div>
                
                <div className="contact__item">
                    <h3 className="contact__item-title">Téléphone</h3>
                    <p className="contact__item-value">
                        <a href="tel:+33123456789">01 23 45 67 89</a>
                    </p>
                </div>
                
                <div className="contact__item">
                    <h3 className="contact__item-title">Adresse</h3>
                    <p className="contact__item-value">
                        123 Rue de la Montagne<br />
                        75000 Paris<br />
                        France
                    </p>
                </div>
            </address>

            <div className={`contact__form-container ${isLoggedIn ? 'logged' : 'not-logged'}`}>
                {isLoggedIn ? (
                    <form ref={form} className="contact__form" onSubmit={handleSubmit}>
                        <h3 className="contact__form-title">Envoyez-nous un message</h3>
                        
                        {/* Champs masqués avec les données utilisateur */}
                        <input 
                            type="hidden" 
                            name="user_name"
                            value={userData ? `${userData.firstname || ''} ${userData.lastname || ''}`.trim() : ''}
                        />
                        <input 
                            type="hidden" 
                            name="user_email"
                            value={userData?.email || ''} 
                        />
                        
                        {/* Affichage des infos utilisateur */}
                        <div className="contact__user-info">
                            <p>Identité associée à ce message : <strong>
                                {userData ? `${userData.firstname || ''} ${userData.lastname || ''}`.trim() : ''}
                            </strong> ({userData?.email || ''})</p>
                        </div>
                        
                        <div className="contact__form-group">
                            <label htmlFor="message" className="contact__form-label">
                                Votre message
                                <span className={`char-counter ${messageLength > MAX_MESSAGE_LENGTH ? 'char-counter--exceeded' : ''}`}>
                                    {messageLength}/{MAX_MESSAGE_LENGTH}
                                </span>
                            </label>
                            <textarea 
                                id="message"
                                name="message" 
                                className="contact__form-textarea" 
                                rows="6" 
                                required
                                disabled={status.submitting}
                                placeholder="Décrivez votre demande, question ou commentaire..."
                                onChange={handleMessageInput}
                                maxLength={MAX_MESSAGE_LENGTH + 100}
                            ></textarea>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="contact__form-submit"
                            disabled={status.submitting}
                        >
                            {status.submitting ? 'Envoi en cours...' : 'Envoyer'}
                        </button>
                    </form>
                ) : (
                    <div className="contact__login-container">
                        <p className="contact__login-message">
                            Pour nous contacter via ce formulaire, veuillez vous connecter à votre compte.
                        </p>
                        <Link to="/auth" className="contact__login-link">
                            Se connecter / S'inscrire
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Contact;