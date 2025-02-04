import { useState } from "react";
import { Navigate } from "react-router-dom";
import { signupUser } from "../../api/auth";
import { validateUserForm } from "../../utils/validateUserForm"
// import Breadcrumb from '../../utils/breadcrumb';

const Register = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

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
                text: "Erreur lors de la création de l'utilisateur"
            });
        });
    };

    return (
        <section>
            {/* <article>
                <Breadcrumb />
            </article> */}
            <article>
                <h2 id="register-form-title">S'enregistrer</h2>
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
                    className="register-Form"
                    onSubmit={onSubmitForm}
                    role="form"
                    aria-labelledby="register-form-title"
                >
                    <label htmlFor="firstname">Prénom</label>
                    <input
                        type="text"
                        id="firstname"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                        aria-label="Prénom"
                    />

                    <label htmlFor="lastname">Nom</label>
                    <input
                        type="text"
                        id="lastname"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                        aria-label="Nom"
                    />

                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-label="Email"
                    />

                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        aria-label="Mot de passe"
                    />

                    <label htmlFor="phone">Téléphone</label>
                    <input
                        type="text"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        aria-label="Téléphone"
                    />

                    <input
                        type="submit"
                        value="S'enregistrer"
                        aria-label="Soumettre le formulaire d'inscription"
                    />
                    
                </form>
            </article>
        </section>
    );
};

export default Register;