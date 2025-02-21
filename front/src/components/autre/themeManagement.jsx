import { useState, useEffect } from "react";
import { createTheme, deleteTheme } from "../../api/admin/theme";  // Les API d'ajout et de suppression de thème
import { getAllThemes, getAllThemesByStayid } from "../../api/publicApi"; // API pour récupérer les thèmes d'un séjour
import StayFormTest from "../autre/stayFormTest";

const ThemeManagement = ({ stayId }) => {
    const [themes, setThemes] = useState([]);
    const [newTheme, setNewTheme] = useState("");
    const [stayThemes, setStayThemes] = useState([]);
    const [error, setError] = useState(null);

    // Fonction pour récupérer tous les thèmes
    const fetchThemes = async () => {
        try {
            const result = await getAllThemes();
            setThemes(result);
        } catch (err) {
            setError("Erreur lors du chargement des thèmes");
        }
    };

    // Fonction pour récupérer les thèmes d'un séjour
    const fetchStayThemes = async () => {
        try {
            const result = await getAllThemesByStayid(stayId);
            setStayThemes(result.themes);
        } catch (err) {
            setError("Erreur lors du chargement des thèmes associés au séjour");
        }
    };

    // Fonction pour créer un thème
    const handleCreateTheme = async () => {
        if (newTheme.trim() === "") return;
        try {
            await createTheme({ name: newTheme });
            setNewTheme("");
            fetchThemes(); // Recharge la liste des thèmes
        } catch (err) {
            setError("Erreur lors de la création du thème");
        }
    };

    // Fonction pour supprimer un thème
    const handleDeleteTheme = async (themeId) => {
        try {
            await deleteTheme(themeId);
            fetchThemes(); // Recharge la liste des thèmes après suppression
        } catch (err) {
            setError("Erreur lors de la suppression du thème");
        }
    };

    // Fonction pour associer un thème à un séjour
    const handleAddThemeToStay = async (themeId) => {
        try {
            // Ajoute le thème à un séjour
            // En fonction de ton API, tu pourrais utiliser un endpoint pour associer un thème à un séjour
            await addThemeStay(stayId, themeId); // À définir dans l'API si besoin
            fetchStayThemes(); // Recharge les thèmes associés au séjour
        } catch (err) {
            setError("Erreur lors de l'ajout du thème au séjour");
        }
    };

    // Charger les thèmes au démarrage du composant
    useEffect(() => {
        fetchThemes();
        fetchStayThemes();
    }, []);

    return (
        <section>
            <article>
                <h2>Gestion des thèmes</h2>
                {error && <p className="error">{error}</p>}
                <section>
                    <h3>Liste des thèmes</h3>
                    <ul>
                        {Array.isArray(themes) ? (
                            themes.map(theme => (
                                <div key={theme.id}>
                                    {/* Rendu de ton thème */}
                                </div>
                            ))
                        ) : (
                            <p>Aucun thème disponible.</p>
                        )}
                    </ul>
                </section>

                <section>
                    <h3>Créer un thème</h3>
                    <input
                        type="text"
                        value={newTheme}
                        onChange={(e) => setNewTheme(e.target.value)}
                        placeholder="Nom du thème"
                    />
                    <button onClick={handleCreateTheme}>Créer</button>
                </section>

                <section>
                    <h3>Thèmes associés au séjour</h3>
                    <ul>
                        {Array.isArray(stayThemes) ? (
                                stayThemes.map((theme) => (
                                    <li key={theme.id}>{theme.name}</li>
                                ))
                            ) : (
                                <p>Aucun thème trouvé pour ce séjour.</p> // Optionnel, message en cas d'erreur
                            )
                        }
                    </ul>
                </section>
            </article>
        </section>
    );
};

export default ThemeManagement;
