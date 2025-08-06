import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { loginUser } from "../../api/auth";
import { useDispatch } from "react-redux";
import { connectUser } from "../../slices/userSlice";
import { validateUserForm } from "../../utils/validateUserForm";
// import Breadcrumb from '../utils/breadcrumb';

const Login = ({ onRegisterClick }) => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Gestion des messages d'erreur ou de succès
    const [message, setMessage] = useState({ type: "", text: "" });

    // Redirection après connexion réussie
    const [redirect, setRedirect] = useState(false);

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
        <div className="auth-content login-content">
            <h2>Se connecter</h2>
            
            {message.text && (
                <div 
                    className={`auth-message ${message.type}`}
                    role="alert"
                    aria-live="assertive"
                >
                    {message.text}
                </div>
            )}
            
            <form
                className="auth-form login-form"
                onSubmit={onSubmitForm}
                role="form"
                aria-labelledby="login-form-title"
            >
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

                <div className="floating-input-container">
                    <input
                        type="password"
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
                </div>

                <button type="submit" className="auth-submit">
                    Se connecter
                </button>
            </form>
            
            <div className="auth-links">
                <p>
                    Vous n'avez pas encore de compte ?{' '}
                    <a 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            onRegisterClick();
                        }} 
                        className="register-link"
                    >
                        Inscrivez-vous ici
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
