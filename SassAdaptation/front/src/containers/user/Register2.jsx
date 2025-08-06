import React, { useState, useEffect, useRef } from 'react';
import { validateUserForm } from "../../utils/validateUserForm";
import { signupUser } from "../../api/auth";
import FieldRequirements from "./fieldRequirements";
import './Register2.css'; // CSS isolé comme TestForm

const Register2 = ({ onRegisterClick }) => {
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
            <div className="register2-wrapper">
                <h2 id="register-form-title">S'enregistrer</h2>
                
                {message.text && (
                    <p className={`auth-message ${message.type}`}>
                        {message.text}
                    </p>
                )}
                
                <form onSubmit={onSubmitForm} className="register2-form">
                    <div className="register2-form-grid">
                        {/* Prénom */}
                        <div className={`register2-field-container ${focusedField === 'firstname' ? 'field-focused' : ''}`}>
                            <label htmlFor="register-firstname">Prénom</label>
                            <input
                                type="text"
                                id="register-firstname"
                                name="register-firstname"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                onFocus={() => handleFocus('firstname')}
                                onBlur={handleBlur}
                                required
                            />
                            <FieldRequirements
                                fieldType="name"
                                value={firstname}
                                isFocused={focusedField === 'firstname'}
                            />
                        </div>
                        
                        {/* Nom */}
                    <div className={`floating-input-container name-container ${focusedField === 'lastname' ? 'field-focused' : ''}`}>
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
                    <div className={`floating-input-container email-container ${focusedField === 'email' ? 'field-focused' : ''}`}>
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

                        
                        {/* Password */}
                        <div className={`register2-field-container full-width ${focusedField === 'password' ? 'field-focused' : ''}`}>
                            {/* Similaire avec full-width */}
                        </div>
                        
                        {/* Phone */}
                        <div className={`register2-field-container full-width ${focusedField === 'phone' ? 'field-focused' : ''}`}>
                            {/* Similaire avec full-width */}
                        </div>
                    </div>
                    
                    <button type="submit" className="register2-submit-btn">
                        S'enregistrer
                    </button>
                </form>
                
                <footer className="auth-links">
                    <p>Vous avez déjà un compte ?{' '}
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            onRegisterClick();
                        }}>
                            Connectez-vous ici
                        </a>
                    </p>
                </footer>
            </div>
        </article>
    );
};

export default Register2;