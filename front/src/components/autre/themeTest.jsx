import { useState, useEffect } from "react";
import { getAllThemesByStayid, getAllThemes } from "../../api/publicApi";
import { addThemeStay, removeThemeFromStay, createTheme, deleteTheme, checkThemeUsage } from "../../api/admin/theme";
import { validateThemeForm } from "../../utils/validateTheme";

const ThemeTest = ({stay, onClose}) => {
    const stayId = stay.id;
    const [allThemes, setAllThemes] = useState([]);
    const [stayThemes, setStayThemes] = useState([]);
    const [error, setError] = useState(false);
    const [newTheme, setNewTheme] = useState('');

    // Gestion des erreurs/validation
    const [message, setMessage] = useState({ type: "", text: "" });

    // Ajouter un thème au séjour
    const handleAddTheme = (themeId) => {

        setMessage({ type: "", text: "" });

        // Vérifier si le thème est déjà associé au séjour
        if (Array.isArray(stayThemes) && stayThemes.some(theme => theme.id === themeId)) {
            alert("Ce thème est déjà ajouté !");
            return;
        }
        
        // cas positif, ajout du theme au séjour
        addThemeStay(stay.id, themeId)
        .then((res) => {
            if (res.status === 201) {
                const newTheme = { id: themeId, name: allThemes.find(t => t.id === themeId)?.name };
                setStayThemes(prevThemes => [...(prevThemes || []), newTheme]);
                setMessage({ type: "success", text: "Thème ajouté avec succès !" });
            } else {
                setMessage({ type: "error", text: res.msg || "Erreur lors de l'ajout du thème." });
            }
        })
        .catch((err) => {
            setMessage({ type: "error", text: "Erreur lors de l'ajout du thème." });
            console.error("Erreur lors de l'ajout du thème :", err);
        });
    };

    // Supprimer un thème du séjour
    const handleRemoveTheme = (themeId) => {
        removeThemeFromStay(stay.id, themeId)
            .then((res) => {
                if (res.status === 200) {
                    setStayThemes((prevThemes) => prevThemes.filter((theme) => theme.id !== themeId));
                    setMessage({ type: "success", text: "Thème supprimé avec succès !" });
                } else {
                    setMessage({ type: "error", text: res.msg || "Erreur lors de la suppression du thème." });
                }
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de la suppression du thème." });
                console.error("Erreur lors de la suppression du thème :", err);
            })
    };

    // Création d'un nouveau thème
    const handleCreateNewTheme = async (newTheme) => {
        setMessage({ type: "", text: "" });

        const fieldsToValidate = [
            { name: "Nom du thème", field: "name", value: newTheme },
            { name: "Identifiant du séjour", field: "stay_id", value: stayId },
        ];
    
        // Attendre la validation
        const validationErrors = await validateThemeForm(fieldsToValidate);
    
        // Vérifier si l'objet validationErrors contient des erreurs
        if (Object.keys(validationErrors).length > 0) {
            setMessage({ type: "error", text: Object.values(validationErrors).join(", ") });
            return;
        }

        // Appel à l'API pour créer un nouveau thème
        createTheme({ name: newTheme })
            .then((res) => {
                // création réussie
                if (res.status === 200) {
                    const createdTheme = { id: res.theme.id, name: newTheme };
                    setAllThemes(prevThemes => [...prevThemes, createdTheme]);
                    setMessage({ type: "success", text: "Thème créé et ajouté avec succès !" });
                }
                // Si l'API renvoie un statut 400 (le thème existe déjà)
                else if (res.status === 400) {
                    setMessage({ type: "error", text: "Ce thème existe déjà." });
                }
                // si lune erreur est survenue au niveau du validator
                else if (res.status === 422 && res.errors) {
                    // Afficher le message d'erreur spécifique venant du backend
                    setMessage({ type: "error", text: res.errors.map(err => err.msg).join(", ") });
                }
                // Gestion des autres erreurs
                else {
                    setMessage({ type: "error", text: "Erreur lors de la création du thème. 1" });
                }
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de la création du thème." });
                console.error("Erreur lors de la création du thème :", err);
            });
    };

    // Suppression d'un thème
    const handleDeleteTheme = (themeId) => {
        // Vérifier si le thème est associé à un séjour via l'API
        checkThemeUsage(themeId)
            .then((res) => {
                if (res.status === 200 && res.isUsed) {
                    setMessage({ type: "error", text: "Impossible de supprimer ce thème, il est encore associé à un séjour !" });
                    return;
                }

                // Demander confirmation avant suppression
                if (!window.confirm("Voulez-vous vraiment supprimer ce thème ?")) {
                    return;
                }

                // Supprimer le thème
                deleteTheme(themeId)
                    .then((res) => {
                        if (res.status === 200) {
                            setAllThemes((prevThemes) => prevThemes.filter(theme => theme.id !== themeId));
                            setMessage({ type: "success", text: "Thème supprimé avec succès !" });
                        } else {
                            setMessage({ type: "error", text: res.msg || "Erreur lors de la suppression du thème." });
                        }
                    })
                    .catch((err) => {
                        setMessage({ type: "error", text: "Erreur lors de la suppression du thème." });
                        console.error("Erreur lors de la suppression du thème :", err);
                    });
            })
            .catch((err) => {
                setMessage({ type: "error", text: "Erreur lors de la vérification du thème." });
                console.error("Erreur lors de la vérification du thème :", err);
            });
    };


    // Gestion de la fermeture en cliquant en dehors
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("popup-overlay")) {
            onClose();
        }
    };

    useEffect(() => {
        if (message.text) {
            const timeoutId = setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [message]);

    useEffect(() => {
        getAllThemes()
            .then((res) => {
                if (res.status === 200) {
                    setAllThemes(res.themes);
                } else {
                    throw new Error("Erreur lors du chargement des thèmes.");
                }
            })
            .catch((err) => {
                setError("Impossible de récupérer les thèmes.");
                console.error(err);
            });

        getAllThemesByStayid(stayId)
            .then((res) => {
                setStayThemes(res.themes)
            })
            .catch((err) => {
                setError("Impossible de récupérer les thèmes liés a un séjour.");
                console.error(err);
            });
    }, []);

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content">
            {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
            )}

            <h3>Thèmes du séjour</h3>
            {stayThemes && stayThemes.length > 0 ? (
                <ul>
                    {stayThemes.map((theme) => (
                        <li key={theme.id}>
                            {theme.name}
                            <button onClick={() => handleRemoveTheme(theme.id)}>
                                Enlever
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Aucun thème associé.</p>
            )}


                <h3>Thèmes disponibles</h3>
                <ul>
                    {allThemes.map((theme) => (
                        <li key={theme.id}>
                            {theme.name}
                            <button onClick={() => handleAddTheme(theme.id)}>
                                Ajouter
                            </button>
                            <button onClick={() => handleDeleteTheme(theme.id)}>
                                Supprimer
                            </button>
                        </li>
                    ))}
                </ul>

                <h3>Créer un nouveau thème</h3>
                <input
                    type="text"
                    placeholder="Nom du nouveau thème"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                />
                <button onClick={() => handleCreateNewTheme(newTheme)}>Créer le thème</button>

                <button className="close-btn" onClick={onClose}>
                    Fermer
                </button>
            </div>
        </div>
    )
};

export default ThemeTest;
