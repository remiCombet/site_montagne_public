import { useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { loginUser } from "../../api/auth";
import { useDispatch } from "react-redux";
import { connectUser } from "../../slices/userSlice";
import { validateUserForm } from "../../utils/validateUserForm";

const Login = ({ onLoginClick }) => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Nouvel état
    const [message, setMessage] = useState({ type: "", text: "" });
    const [redirect, setRedirect] = useState(false);
    
    // Référence à l'input mot de passe
    const passwordInputRef = useRef(null);

    // Fonction pour gérer le toggle sans perdre le focus
    const handleTogglePassword = (e) => {
        e.preventDefault();
        
        // Sauvegarder la position du curseur
        const cursorPosition = passwordInputRef.current?.selectionStart || 0;
        
        // Changer l'état
        setShowPassword(!showPassword);
        
        // Rétablir le focus et la position du curseur après le changement
        setTimeout(() => {
            if (passwordInputRef.current) {
                passwordInputRef.current.focus();
                
                // Restaurer la position du curseur
                try {
                    passwordInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
                } catch (error) {
                    console.log("Impossible de restaurer la position du curseur");
                }
            }
        }, 10);
    };

    if (redirect) {
        return <Navigate to="/" />;
    }

    const onSubmitForm = async (e) => {
        e.preventDefault();

        // Réinitialisation du message
        setMessage({ type: "", text: "" });

        // Validation des champs
        const fieldsToValidate = [
            { name: "Email", field: "email", value: email },
            { name: "Mot de passe", field: "password", value: password },
        ];

        const validationErrors = validateUserForm(fieldsToValidate);

        if (validationErrors.length > 0) {
            setMessage({
                type: "error",
                text: validationErrors.join(", "),
            });
            return;
        }

        // Préparation des données à envoyer
        const datas = { email, password };

        // Envoi des données à l'API
        loginUser(datas)
            .then((res) => {
                if (res.status === 200) {
                    // Stockage du token
                    window.localStorage.setItem("Vent_dAmes_Montagne", res.token);

                    // Création de l'objet utilisateur pour Redux
                    const newUser = {
                        infos: {
                            ...res.user,
                            token: res.token,
                        },
                        role: res.user.role || "",
                    };
                    
                    dispatch(connectUser(newUser));
                    setMessage({
                        type: "success",
                        text: "Connexion réussie. Redirection...",
                    });

                    // Redirection après un court délai
                    setTimeout(() => setRedirect(true), 1500);
                } else {
                    setMessage({
                        type: "error",
                        text: res.msg || "Une erreur est survenue. Veuillez réessayer.",
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                setMessage({
                    type: "error",
                    text: "Erreur serveur. Veuillez réessayer plus tard.",
                });
            });
    };

    return (
        <article className="auth-face auth-front">
            <header className="auth-content login-content">
                <h2 id="login-form-title">Se connecter</h2>
                
                {message.text && (
                    <p 
                        className={`auth-message ${message.type}`}
                        role="alert"
                        aria-live="assertive"
                    >
                        {message.text}
                    </p>
                )}
            </header>
            
            <form
                className="auth-form login-form"
                onSubmit={onSubmitForm}
                role="form"
                aria-labelledby="login-form-title"
            >
                <fieldset>
                    <legend className="visually-hidden">Informations de connexion</legend>
                    
                    {/* Champ email */}
                    <div className="floating-input-container">
                        <input
                            type="text"
                            id="login-email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder=" "
                            autoComplete="username"
                            aria-label="Email"
                        />
                        <label htmlFor="login-email">Email</label>
                        <span className="input-border"></span>
                    </div>

                    {/* Champ mot de passe */}
                    <div className="floating-input-container">
                        <input
                            ref={passwordInputRef}
                            type={showPassword ? "text" : "password"}
                            id="login-password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder=" "
                            autoComplete="current-password"
                            aria-label="Mot de passe"
                        />
                        <label htmlFor="login-password">Mot de passe</label>
                        <span className="input-border"></span>
                        
                        {/* Bouton de visibilité */}
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={handleTogglePassword}
                            onMouseDown={(e) => e.preventDefault()} // Empêche la perte de focus
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            tabIndex="-1"
                        >
                            {showPassword ? (
                                <span aria-hidden="true">👁️</span>
                            ) : (
                                <span aria-hidden="true">👁️‍🗨️</span>
                            )}
                        </button>
                    </div>

                    <button type="submit" className="auth-submit">
                        Se connecter
                    </button>
                </fieldset>
            </form>
            
            <footer className="auth-links">
                <p>
                    Vous n'avez pas encore de compte ?{' '}
                    <a 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            onLoginClick();
                        }} 
                        className="login-link"
                    >
                        Inscrivez-vous ici
                    </a>
                </p>
            </footer>
        </article>
    );
};

export default Login;
