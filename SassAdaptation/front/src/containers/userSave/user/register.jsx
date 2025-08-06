import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { signupUser } from "../../api/auth";
import { validateUserForm } from "../../utils/validateUserForm";
import FieldRequirements from "./fieldRequirements";

const Register = ({ onRegisterClick, onFieldFocus }) => {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [focusedField, setFocusedField] = useState(null);

    // Référence à l'input mot de passe
    const passwordInputRef = useRef(null);

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    // Redirection
    const [redirect, setRedirect] = useState(false);

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
                setRedirect(true);
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

    useEffect(() => {
        if (redirect && onRegisterClick) {
            setTimeout(() => {
                onRegisterClick();
                setRedirect(false);
            }, 1500);
        }
    }, [redirect, onRegisterClick]);

    const handleFocus = (field) => {
        setFocusedField(field);
        if (onFieldFocus) {
            onFieldFocus(field); // Informer le parent
        }
    };
    
    const handleBlur = () => {
        setFocusedField(null);
        if (onFieldFocus) {
            onFieldFocus(null); // Informer le parent
        }
    };

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
                    // Certains navigateurs peuvent avoir des problèmes avec setSelectionRange
                    console.log("Impossible de restaurer la position du curseur");
                }
            }
        }, 10);
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
                            onFocus={() => handleFocus('firstname')}
                            onBlur={handleBlur}
                            required
                            placeholder=" "
                            aria-label="Prénom"
                        />
                        <label htmlFor="register-firstname">Prénom</label>
                        <span className="input-border"></span>
                        <FieldRequirements
                            fieldType="name"
                            value={firstname}
                            isFocused={focusedField === 'firstname'}
                        />
                    </div>

                    {/* Nom */}
                    <div className={`floating-input-container ${focusedField === 'lastname' ? 'field-focused' : ''}`}>
                        <input
                            type="text"
                            id="register-lastname"
                            name="register-lastname"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            onFocus={() => handleFocus('lastname')}
                            onBlur={handleBlur}
                            required
                            placeholder=" "
                            aria-label="Nom"
                        />
                        <label htmlFor="register-lastname">Nom</label>
                        <span className="input-border"></span>
                        <FieldRequirements
                            fieldType="name"
                            value={lastname}
                            isFocused={focusedField === 'lastname'}
                        />
                    </div>

                    {/* Email */}
                    <div className={`floating-input-container ${focusedField === 'email' ? 'field-focused' : ''}`}>
                        <input
                            type="email"
                            id="register-email"
                            name="register-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => handleFocus('email')}
                            onBlur={handleBlur}
                            required
                            placeholder=" "
                            aria-label="Email"
                        />
                        <label htmlFor="register-email">Email</label>
                        <span className="input-border"></span>
                        <FieldRequirements
                            fieldType="email"
                            value={email}
                            isFocused={focusedField === 'email'}
                        />
                    </div>

                    {/* Mot de passe */}
                    <div className={`floating-input-container ${focusedField === 'password' ? 'field-focused' : ''}`}>
                        <input
                            ref={passwordInputRef} // Référence à l'élément
                            type={showPassword ? "text" : "password"}
                            id="register-password"
                            name="register-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => handleFocus('password')}
                            onBlur={handleBlur}
                            required
                            placeholder=" "
                            autoComplete="new-password"
                            aria-label="Mot de passe"
                        />
                        <label htmlFor="register-password">Mot de passe</label>
                        <span className="input-border"></span>
                        
                        {/* Bouton de visibilité modifié */}
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={handleTogglePassword} // Nouvelle fonction de gestion
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
                        
                        <FieldRequirements
                            fieldType="password"
                            value={password}
                            isFocused={focusedField === 'password'}
                        />
                    </div>

                    {/* Téléphone */}
                    <div className={`floating-input-container ${focusedField === 'phone' ? 'field-focused' : ''}`}>
                        <input
                            type="text"
                            id="register-phone"
                            name="register-phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onFocus={() => handleFocus('phone')}
                            onBlur={handleBlur}
                            required
                            placeholder=" "
                            aria-label="Téléphone"
                        />
                        <label htmlFor="register-phone">Téléphone</label>
                        <span className="input-border"></span>
                        <FieldRequirements
                            fieldType="phone"
                            value={phone}
                            isFocused={focusedField === 'phone'}
                        />
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
                        onMouseDown={(e) => {
                            // Empêche le blur automatique du champ input
                            e.preventDefault();
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