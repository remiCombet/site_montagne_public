import { useState } from "react";
import { Navigate } from "react-router-dom";
import { signupUser } from "../../api/auth";
import { validateUserForm } from "../../utils/validateUserForm";
import FieldRequirements from "./fieldRequirements";

const Register = ({ onRegisterClick }) => {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    const [focusedField, setFocusedField] = useState(null);

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    // Redirection
    const [redirect, setRedirect] = useState(false);

    if (redirect) {
        return <Navigate to="/login" />;
    }

    // validation du formulaire
    const onSubmitForm = async (e) => {
        e.preventDefault();
       
        setMessage({ type: "", text: "" });

        const fieldsToValidate = [
            { name: "prénom", field: "firstname", value: firstname },
            { name: "Nom", field: "lastname", value: lastname },
            { name: "Email", field: "email", value: email },
            { name: "Mot de passe", field: "password", value: password },
            { name: "Téléphone", field: "phone", value: phone },
        ];

        // validation des champs
        const validationErrors = validateUserForm(fieldsToValidate);

        // cas ou il y a des erreurs
        if (validationErrors.length > 0) {
           setMessage({ type: "error", text: validationErrors.join(', ') });
            return;
        }

        // préparation des données à envoyer
        const datas = {
            firstname,
            lastname,
            email,
            password,
            phone
        };

        // envoi des données au backend pour la création de l'utilisateur
        signupUser(datas)
        .then((res) => {
            if (res.status === 200) {
                setMessage({
                    type: "success",
                    text: res.msg || "Utilisateur créé avec succès"
                });
                setTimeout(() => {
                    setRedirect(true);
                }, 1500);
            } else if (res.status === 400) {  
                setMessage({
                    type: "error",
                    text: res.msg || "Cet email est déjà enregistré. Veuillez en utiliser un autre."
                });
            } else {  // Autres erreurs
                setMessage({
                    type: "error",
                    text: res.msg || "Une erreur s'est produite"
                });
            }
        })
        .catch(err => {
            console.log(err);
            setMessage({ 
                type: "error", 
                text: "Erreur lors de la création de l'utilisateur"
            });
        });
    };

    return (
        <article className="auth-face auth-right">
            <header className="register-content">
                <h2 id="register-form-title">S'enregistrer</h2>
                
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
                className="auth-form register-form"
                onSubmit={onSubmitForm}
                role="form"
                aria-labelledby="register-form-title"
            >
                <fieldset>
                    <legend className="visually-hidden">Informations personnelles</legend>
                    
                    {/* Prénom */}
                    <div className={`floating-input-container ${focusedField === 'firstname' ? 'field-focused' : ''}`}>
                        <input
                            type="text"
                            id="register-firstname"
                            name="register-firstname"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            onFocus={() => setFocusedField('firstname')}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder=" "
                            aria-label="Prénom"
                        />
                        <label htmlFor="register-firstname">Prénom</label>
                        <span className="input-border"></span>
                        <FieldRequirements fieldType="name" value={firstname} />
                    </div>

                    {/* Nom */}
                    <div className={`floating-input-container ${focusedField === 'lastname' ? 'field-focused' : ''}`}>
                        <input
                            type="text"
                            id="register-lastname"
                            name="register-lastname"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            onFocus={() => setFocusedField('lastname')}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder=" "
                            aria-label="Nom"
                        />
                        <label htmlFor="register-lastname">Nom</label>
                        <span className="input-border"></span>
                        <FieldRequirements fieldType="name" value={lastname} />
                    </div>

                    {/* Email */}
                    <div className={`floating-input-container ${focusedField === 'email' ? 'field-focused' : ''}`}>
                        <input
                            type="email"
                            id="register-email"
                            name="register-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder=" "
                            aria-label="Email"
                        />
                        <label htmlFor="register-email">Email</label>
                        <span className="input-border"></span>
                        <FieldRequirements fieldType="email" value={email} />
                    </div>

                    {/* Mot de passe */}
                    <div className={`floating-input-container ${focusedField === 'password' ? 'field-focused' : ''}`}>
                        <input
                            type="password"
                            id="register-password"
                            name="register-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder=" "
                            autoComplete="new-password"
                            aria-label="Mot de passe"
                        />
                        <label htmlFor="register-password">Mot de passe</label>
                        <span className="input-border"></span>
                        <FieldRequirements fieldType="password" value={password} />
                    </div>

                    {/* Téléphone */}
                    <div className={`floating-input-container ${focusedField === 'phone' ? 'field-focused' : ''}`}>
                        <input
                            type="text"
                            id="register-phone"
                            name="register-phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder=" "
                            aria-label="Téléphone"
                        />
                        <label htmlFor="register-phone">Téléphone</label>
                        <span className="input-border"></span>
                        <FieldRequirements fieldType="phone" value={phone} />
                    </div>

                    <button type="submit" className="auth-submit">
                        S'enregistrer
                    </button>
                </fieldset>
            </form>
            
            <footer className="auth-links">
                <p>Vous avez déjà un compte ?{' '}
                    <a 
                        href="#" 
                        onClick={(e) => {
                            e.preventDefault();
                            onRegisterClick();
                        }} 
                        className="register-link"
                    >
                        Connectez-vous ici
                    </a>
                </p>
            </footer>
        </article>
    );
};

export default Register;