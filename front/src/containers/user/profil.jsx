import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser, connectUser } from "../../slices/userSlice";
import { updateUser} from "../../api/user";
// import Breadcrumb from "../../utils/breadcrumb";
import { validateUserForm } from "../../utils/validateUserForm";
import FieldRequirements from "./fieldRequirements";

// attention on modifiera peut atre pas link la cest pou test
import { Link } from "react-router-dom";

const Profil = () => {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // État pour suivre le champ en focus
    const [focusedField, setFocusedField] = useState(null);

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    // Disparition automatique du message après 1.5 secondes
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 1500); // 1.5 secondes

            // Nettoyage du timer pour éviter des effets indésirables
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if (user.infos) {
            // On récupère les infos de l'utilisateur
            setFirstname(user.infos.firstname || "");
            setLastname(user.infos.lastname || "");
            setEmail(user.infos.email || "");
            setPhone(user.infos.phone || "");
        }
    }, [user.infos]);

    // validation du formulaire
    const onSubmitForm = async (e) => {
        e.preventDefault();

        setMessage({ type: "", text: "" });

        if (!user.infos || !user.infos.id) {
            setMessage({
                type: "error",
                text: "Impossible de modifier le profil : utilisateur non trouvé."
            });
            return;
        }

        const fieldsToValidate = [
            { name: "prénom", field: "firstname", value: firstname },
            { name: "Nom", field: "lastname", value: lastname },
            { name: "Email", field: "email", value: email },
            { name: "Téléphone", field: "phone", value: phone },
        ];

        // validation des champs
        const validationErrors = validateUserForm(fieldsToValidate);
        
        // cas où il y a des erreurs
        if (validationErrors.length > 0) {
            setMessage({ type: "error", text: validationErrors.join(', ') });
            return;
        }

        // préparation des données à envoyer
        const datas = {
            firstname,
            lastname,
            email,
            phone
        };
        
        // envoi au backend pour modification du profil
        updateUser(datas, user.infos.id)
        .then((res) => {
            if (res.status === 200) {
                const token = window.localStorage.getItem("Vent_dAmes_Montagne");
                const newUser = {
                    infos: res.user,
                    role: user.role || "user",
                };
                newUser.token = token;

                // Mise à jour du store Redux avec les nouvelles informations
                dispatch(connectUser(newUser));
                console.log('envoi', user.infos)

                // Mise à jour des champs locaux avec les nouvelles données
                setFirstname(res.user.firstname);
                setLastname(res.user.lastname);
                setEmail(res.user.email);
                setPhone(res.user.phone);
                
                setMessage({
                    type: "success",
                    text: res.msg || "Profil modifié avec succès!"
                });
            } else if (res.status === 400) {  // Erreur d'email déjà pris
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
                text: "Erreur lors de la modification de l'utilisateur"
            });
        });
    };

    return (
        <section className="profile-container">
            <article className="profile-card">
                <header className="profile-header">
                    <h2 id="update-form-title">Modifier le profil</h2>
                    {message.text && (
                        <p className={`profile-message ${message.type}`} role="alert" aria-live="assertive">
                            {message.text}
                        </p>
                    )}
                </header>
                
                <form className="update-form" onSubmit={onSubmitForm} role="form" aria-labelledby="update-form-title">
                    {/* Prénom avec validation */}
                    <div className={`floating-input-container ${focusedField === 'firstname' ? 'field-focused' : ''}`}>
                        <input
                            type="text"
                            id="firstname"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            onFocus={() => setFocusedField('firstname')}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder=" "
                            aria-label="Prénom"
                        />
                        <label htmlFor="firstname">Prénom</label>
                        <span className="input-border"></span>
                        <FieldRequirements 
                            fieldType="name" 
                            value={firstname} 
                            isFocused={focusedField === 'firstname'}
                        />
                    </div>

                    {/* Nom avec validation */}
                    <div className={`floating-input-container ${focusedField === 'lastname' ? 'field-focused' : ''}`}>
                        <input
                            type="text"
                            id="lastname"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            onFocus={() => setFocusedField('lastname')}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder=" "
                            aria-label="Nom"
                        />
                        <label htmlFor="lastname">Nom</label>
                        <span className="input-border"></span>
                        <FieldRequirements 
                            fieldType="name"
                            value={lastname}
                            isFocused={focusedField === 'lastname'}
                        />
                    </div>

                    {/* Email avec validation */}
                    <div className={`floating-input-container ${focusedField === 'email' ? 'field-focused' : ''}`}>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder=" "
                            aria-label="Email"
                        />
                        <label htmlFor="email">Email</label>
                        <span className="input-border"></span>
                        <FieldRequirements
                            fieldType="email"
                            value={email}
                            isFocused={focusedField === 'email'}
                        />
                    </div>

                    {/* Téléphone avec validation */}
                    <div className={`floating-input-container ${focusedField === 'phone' ? 'field-focused' : ''}`}>
                        <input
                            type="text"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            required
                            placeholder=" "
                            aria-label="Téléphone"
                        />
                        <label htmlFor="phone">Téléphone</label>
                        <span className="input-border"></span>
                        <FieldRequirements
                            fieldType="phone"
                            value={phone}
                            isFocused={focusedField === 'phone'}
                        />
                    </div>

                    <button type="submit" className="profile-submit">
                        Modifier le profil
                    </button>
                </form>
            </article>
        </section>
    );
};

export default Profil;