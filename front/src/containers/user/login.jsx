import { useState } from "react";
import { Navigate } from "react-router-dom";
import { loginUser } from "../../api/auth";
import { useDispatch } from "react-redux";
import { connectUser } from "../../slices/userSlice";
import { validateUserForm } from "../../utils/validateUserForm";
// import Breadcrumb from '../utils/breadcrumb';

const Login = () => {
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
        <section className="content-section">
            {/* <article>
                <Breadcrumb />
            </article> */}
            <article>
                <h2>Se connecter</h2>
                {message.text && (
                    <p
                        style={{ color: message.type === "error" ? "red" : "green" }}
                        role="alert"
                        aria-live="assertive"
                    >
                        {message.text}
                    </p>
                )}
                <form
                    className="login-form"
                    onSubmit={onSubmitForm}
                    role="form"
                    aria-labelledby="login-form-title"
                >
                    <label htmlFor="email">Email :</label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        placeholder="Votre email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-label="Email"
                    />

                    <label htmlFor="password">Mot de passe :</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Votre mot de passe"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        aria-label="Mot de passe"
                    />

                    <input type="submit" value="Se connecter" aria-label="Soumettre le formulaire de connexion" />
                </form>
            </article>
        </section>
    );
};

export default Login;
