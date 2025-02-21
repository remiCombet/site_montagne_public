import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { createTheme, updateTheme, deleteTheme, addThemeStay } from "../../api/admin/theme";
import { getAllThemes, getAllThemesByStayid } from "../../api/publicApi";
import { validateStayForm } from "../../utils/validateStayForm";

const Theme = ({ stay, selectedStay }) => {
    const [name, setName] = useState('');
    const [themes, setThemes] = useState([]);

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (selectedStay) {
            console.log(selectedStay.id);
            getAllThemesByStayid(selectedStay.id)
                .then(data => {
                    console.log("Données reçues :", data);
                    setThemes(Array.isArray(data.themes) ? data.themes : []);
                })
                .catch(err => {
                    console.error("Erreur lors du chargement des thèmes :", err);
                    setThemes([]);
                });
        }
    }, [selectedStay]);
    

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: "", text: ""});
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [message])

    useEffect(() => {
        getAllThemes()
        .then((res) => {
            if (res.status === 200) {
                setThemes(res.themes || [])
            } else {
                setMessage({
                    type: "error",
                    text: "impossible de charger les themes"
                })
            }
        })
        .catch(() => {
            setMessage({ type: "error", text: "Erreur lors de la récupération des thèmes." });
        });
    }, [themes]);

    // Fonction pour modifier un thème
    const handleEdit = (id) => {
        const updatedName = prompt("Modifiez le nom du thème :");
        if (updatedName) {
            const updatedTheme = { name: updatedName };
            updateTheme(id, updatedTheme)
                .then((res) => {
                    if (res.status === 200) {
                        setMessage({ type: "success", text: "Thème modifié avec succès." });
                    } else {
                        setMessage({ type: "error", text: "Erreur lors de la modification du thème." });
                    }
                })
                .catch(() => {
                    setMessage({ type: "error", text: "Erreur lors de la modification du thème." });
                });
        }
    };

    // Fonction pour supprimer un thème
    const handleDelete = (id) => {
        const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce thème ?");
    
        if (confirmDelete) {
            deleteTheme(id)
                .then((res) => {
                    if (res.status === 200) {
                        setMessage({ type: "success", text: "Thème supprimé avec succès." });
                        // Mettre à jour la liste des thèmes après suppression
                        setThemes((prevThemes) => prevThemes.filter((theme) => theme.id !== id));
                    } else {
                        setMessage({ type: "error", text: "Erreur lors de la suppression du thème." });
                    }
                })
                .catch(() => {
                    setMessage({ type: "error", text: "Erreur lors de la suppression du thème." });
                });
        }
    };    

    const onSubmitForm = async (e) => {
        e.preventDefault();

        setMessage({ type: "", text: "" });

        const fieldsToValidate = [
            { name: "name", field: "name", value: name },
        ];

        // validation des champs
        const validationErrors = validateStayForm(fieldsToValidate);

        // cas ou il y a des erreurs
        if (validationErrors.length > 0) {
            setMessage({ type: "error", text: validationErrors.join(', ') });
            return;
        }

        // préparation des données à envoyer
        const themeData = {
            name
        };

        // envoi des données
        createTheme(themeData)
        .then((res) => {
            if (res.status === 200) {
                setMessage({
                    type: "success",
                    text: res.msg || 'theme créé avec succes'
                });
                setName("");
            } else if (res.status === 400) {
                setMessage({
                    type: "error",
                    text: res.msg || 'ce theme existe déja'
                });
            } else {
                setMessage({
                    type: "error",
                    text: res.msg || `une erreur s'est produite`
                });
            }
        })
        .catch(err => {
            console.log(err)
            setMessage({
                type: "error",
                text: "erreur lors de la création du theme"
            });
        });
    };

    return (
        <section>
            <article>
                {message.text && (
                    <p
                        style={{ color: message.type === "error" ? "red" : "green" }}
                        role="alert"
                        aria-live="assertive"
                    >
                        {message.text}
                    </p>
                )}
            </article>
            <article>
                <h2>Liste des thèmes</h2>
                {themes.length > 0 ? (
                    <ul>
                        {themes.map((theme) => (
                            <li key={theme.id}>
                                {theme.name}
                                <Link to="#" onClick={() => handleEdit(theme.id)}>Modifier</Link> | 
                                <Link to="#" onClick={() => handleDelete(theme.id)}>Supprimer</Link>
                           </li>                        
                        ))}
                    </ul>
                ) : (
                    <p>Aucun thème disponible.</p>
                )}
            </article>
            <article className="bottom-line">
                <h2>Enregister un thème</h2>
                <form
                    role="form"
                    aria-labelledby="creation-theme"
                    onSubmit={onSubmitForm}
                >
                    <label htmlFor="name">nom de thème</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        aria-label="nom de theme"
                    />

                    <input
                        type="submit"
                        value="Ajouter"
                        aria-label="Soumettre le formulaire d'ajout de theme"
                    />
                </form>
            </article>
            {/* <article><Link to="/">Accueil</Link></article> */}
        </section>
    );
};

export default Theme;