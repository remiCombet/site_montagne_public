import { useState, useEffect, useRef } from "react";
import { getAllThemesByStayid, getAllThemes } from "../../api/publicApi";
import { addThemeStay, removeThemeFromStay, createTheme, deleteTheme, checkThemeUsage } from "../../api/admin/theme";
import { validateThemeForm } from "../../utils/validateTheme";

const ThemeTest = ({ stay, onUpdate, onMessage }) => {
    const stayId = stay.id;
    const [allThemes, setAllThemes] = useState([]);
    const [stayThemes, setStayThemes] = useState([]);
    const [error, setError] = useState(false);
    const [newTheme, setNewTheme] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Référence pour l'animation de titre (cohérence avec autres composants)
    const isInitialMount = useRef(true);

    // Ajouter un thème au séjour
    const handleAddTheme = (themeId) => {
        setIsSubmitting(true);
        onMessage({ type: "", text: "" });

        // Vérifier si le thème est déjà associé au séjour
        if (Array.isArray(stayThemes) && stayThemes.some(theme => theme.id === themeId)) {
            onMessage({ type: "error", text: "Ce thème est déjà ajouté !" });
            setIsSubmitting(false);
            return;
        }
        
        // cas positif, ajout du theme au séjour
        addThemeStay(stay.id, themeId)
        .then((res) => {
            if (res.status === 201) {
                const newTheme = { id: themeId, name: allThemes.find(t => t.id === themeId)?.name };
                setStayThemes(prevThemes => [...(prevThemes || []), newTheme]);
                onMessage({ type: "success", text: "Thème ajouté avec succès !" });
                // Notifier le parent si nécessaire
                if (onUpdate) onUpdate(stay);
            } else {
                onMessage({ type: "error", text: res.msg || "Erreur lors de l'ajout du thème." });
            }
        })
        .catch((err) => {
            onMessage({ type: "error", text: "Erreur lors de l'ajout du thème." });
            console.error("Erreur lors de l'ajout du thème :", err);
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    // Supprimer un thème du séjour
    const handleRemoveTheme = (themeId) => {
        setIsSubmitting(true);
        
        removeThemeFromStay(stay.id, themeId)
            .then((res) => {
                if (res.status === 200) {
                    setStayThemes((prevThemes) => prevThemes.filter((theme) => theme.id !== themeId));
                    onMessage({ type: "success", text: "Thème supprimé avec succès !" });
                    // Notifier le parent si nécessaire
                    if (onUpdate) onUpdate(stay);
                } else {
                    onMessage({ type: "error", text: res.msg || "Erreur lors de la suppression du thème." });
                }
            })
            .catch((err) => {
                onMessage({ type: "error", text: "Erreur lors de la suppression du thème." });
                console.error("Erreur lors de la suppression du thème :", err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Création d'un nouveau thème
    const handleCreateNewTheme = async (newTheme) => {
        setIsSubmitting(true);
        onMessage({ type: "", text: "" });

        const fieldsToValidate = [
            { name: "Nom du thème", field: "name", value: newTheme },
            { name: "Identifiant du séjour", field: "stay_id", value: stayId },
        ];
    
        // Attendre la validation
        const validationErrors = await validateThemeForm(fieldsToValidate);
    
        // Vérifier si l'objet validationErrors contient des erreurs
        if (Object.keys(validationErrors).length > 0) {
            onMessage({ type: "error", text: Object.values(validationErrors).join(", ") });
            setIsSubmitting(false);
            return;
        }

        // Appel à l'API pour créer un nouveau thème
        createTheme({ name: newTheme })
            .then((res) => {
                // création réussie
                if (res.status === 200) {
                    const createdTheme = { id: res.theme.id, name: newTheme };
                    setAllThemes(prevThemes => [...prevThemes, createdTheme]);
                    onMessage({ type: "success", text: "Thème créé avec succès !" });
                    setNewTheme(''); // Réinitialiser l'input
                }
                // Si l'API renvoie un statut 400 (le thème existe déjà)
                else if (res.status === 400) {
                    onMessage({ type: "error", text: "Ce thème existe déjà." });
                }
                // si une erreur est survenue au niveau du validator
                else if (res.status === 422 && res.errors) {
                    // Afficher le message d'erreur spécifique venant du backend
                    onMessage({ type: "error", text: res.errors.map(err => err.msg).join(", ") });
                }
                // Gestion des autres erreurs
                else {
                    onMessage({ type: "error", text: "Erreur lors de la création du thème." });
                }
            })
            .catch((err) => {
                onMessage({ type: "error", text: "Erreur lors de la création du thème." });
                console.error("Erreur lors de la création du thème :", err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Suppression d'un thème
    const handleDeleteTheme = (themeId) => {
        setIsSubmitting(true);
        
        // Vérifier si le thème est associé à un séjour via l'API
        checkThemeUsage(themeId)
            .then((res) => {
                if (res.status === 200 && res.isUsed) {
                    onMessage({ type: "error", text: "Impossible de supprimer ce thème, il est encore associé à un séjour !" });
                    setIsSubmitting(false);
                    return;
                }

                // Demander confirmation avant suppression
                if (!window.confirm("Voulez-vous vraiment supprimer ce thème ?")) {
                    setIsSubmitting(false);
                    return;
                }

                // Supprimer le thème
                deleteTheme(themeId)
                    .then((res) => {
                        if (res.status === 200) {
                            setAllThemes((prevThemes) => prevThemes.filter(theme => theme.id !== themeId));
                            onMessage({ type: "success", text: "Thème supprimé avec succès !" });
                        } else {
                            onMessage({ type: "error", text: res.msg || "Erreur lors de la suppression du thème." });
                        }
                    })
                    .catch((err) => {
                        onMessage({ type: "error", text: "Erreur lors de la suppression du thème." });
                        console.error("Erreur lors de la suppression du thème :", err);
                    })
                    .finally(() => {
                        setIsSubmitting(false);
                    });
            })
            .catch((err) => {
                onMessage({ type: "error", text: "Erreur lors de la vérification du thème." });
                console.error("Erreur lors de la vérification du thème :", err);
                setIsSubmitting(false);
            });
    };

    useEffect(() => {
        // Charger les données au montage du composant
        loadData();
    }, [stay.id]);

    // Fonction de chargement des données
    const loadData = () => {
        Promise.all([getAllThemes(), getAllThemesByStayid(stayId)])
            .then(([themesRes, stayThemesRes]) => {
                if (themesRes.status === 200) {
                    setAllThemes(themesRes.themes);
                } else {
                    throw new Error("Erreur lors du chargement des thèmes.");
                }

                if (stayThemesRes.themes) {
                    setStayThemes(stayThemesRes.themes);
                } else {
                    setStayThemes([]);
                }
            })
            .catch((err) => {
                setError("Impossible de récupérer les données des thèmes.");
                console.error(err);
            });
    };

    // Mode lecture simple
    const renderViewMode = () => (
        <section className="theme-view-mode">
            <header className="theme-header">
                <h3>Thèmes du séjour</h3>
                
                {stayThemes && stayThemes.length > 0 ? (
                    <ul className="theme-list">
                        {stayThemes.map((theme) => (
                            <li key={theme.id} className="theme-tag">
                                {theme.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-message">Aucun thème associé à ce séjour.</p>
                )}
            </header>
    
            <aside className="theme-action">
                <button 
                    className="btn-primary action-button"
                    onClick={() => setIsEditing(true)}
                    aria-label="Modifier les thèmes"
                >
                    Modifier
                </button>
            </aside>
        </section>
    );

    // Mode édition
    const renderEditMode = () => (
        <section className="theme-edit-mode">
            <header className="section-header">
                <h3>Gestion des thèmes du séjour</h3>
            </header>

            <section className="theme-section">
                <h4>Thèmes actuels du séjour</h4>
                {stayThemes && stayThemes.length > 0 ? (
                    <ul className="theme-list with-actions">
                        {stayThemes.map((theme) => (
                            <li key={theme.id} className="theme-item">
                                <span className="theme-name">{theme.name}</span>
                                <menu type="toolbar" className="theme-actions">
                                    <button 
                                        className="btn-outline-danger btn-sm"
                                        onClick={() => handleRemoveTheme(theme.id)}
                                        disabled={isSubmitting}
                                    >
                                        Enlever
                                    </button>
                                </menu>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-message">Aucun thème associé à ce séjour.</p>
                )}
            </section>

            <section className="theme-section">
                <h4>Thèmes disponibles</h4>
                {allThemes.filter(theme => !stayThemes.some(st => st.id === theme.id)).length > 0 ? (
                    <ul className="theme-list with-actions">
                        {allThemes.filter(theme => !stayThemes.some(st => st.id === theme.id)).map((theme) => (
                            <li key={theme.id} className="theme-item">
                                <span className="theme-name">{theme.name}</span>
                                <menu type="toolbar" className="theme-actions">
                                    <button 
                                        className="btn-success btn-sm"
                                        onClick={() => handleAddTheme(theme.id)}
                                        disabled={isSubmitting}
                                    >
                                        Ajouter
                                    </button>
                                    <button 
                                        className="btn-outline-danger btn-sm"
                                        onClick={() => handleDeleteTheme(theme.id)}
                                        disabled={isSubmitting}
                                    >
                                        Supprimer
                                    </button>
                                </menu>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-message">Tous les thèmes disponibles sont déjà associés à ce séjour.</p>
                )}
            </section>

            <section className="theme-form-section">
                <h4>Créer un nouveau thème</h4>
                <form 
                    className="theme-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (newTheme.trim()) handleCreateNewTheme(newTheme);
                    }}
                >
                    <div className="form-group">
                        <label htmlFor="new-theme" className="visually-hidden">Nom du nouveau thème</label>
                        <div className="input-group">
                            <input
                                id="new-theme"
                                type="text"
                                className="text-input"
                                placeholder="Nom du nouveau thème"
                                value={newTheme}
                                onChange={(e) => setNewTheme(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                            <button 
                                type="submit"
                                className="btn-success action-button"
                                disabled={!newTheme.trim() || isSubmitting}
                            >
                                {isSubmitting ? 'En cours...' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            <footer className="theme-edit-footer">
                <button 
                    className="btn-primary action-button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                >
                    Terminer
                </button>
            </footer>
        </section>
    );

    return (
        <article className="theme-management">
            {isEditing ? renderEditMode() : renderViewMode()}
        </article>
    );
};

export default ThemeTest;