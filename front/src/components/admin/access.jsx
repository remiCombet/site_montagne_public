import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { createAccess, updateAccess, deleteAccess } from "../../api/admin/access";
import { getAllAccesses, getAllStayAccess } from "../../api/publicApi";

// Fonction pour décoder les entités HTML
const decodeHtml = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};

const Access = () => {
    const [category, setCategory] = useState('');
    const [informations, setInformations] = useState('');
    const [accesses, setAccesses] = useState([]);
    const [stayAccesses, setStayAccesses] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentAccessId, setCurrentAccessId] = useState(null);
    const [currentCategory, setCurrentCategory] = useState('');
    const [currentInformations, setCurrentInformations] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        getAllAccesses()
            .then((res) => {
                if (res.status === 200) {
                    setAccesses(res.access || []);
                } else {
                    setMessage({
                        type: "error",
                        text: "Impossible de charger les accès."
                    });
                }
            })
            .catch(() => {
                setMessage({ type: "error", text: "Erreur lors de la récupération des accès." });
            });

            getAllStayAccess()
            .then((res) => {
                if (res.status === 200) {
                    setStayAccesses(res.data || []);
                } else {
                    setMessage({ type: "error", text: "Impossible de charger les accès des séjours." });
                }
            })
            .catch(() => {
                setMessage({ type: "error", text: "Erreur lors de la récupération des accès des séjours." });
            });
    }, [refresh]);

    const handleEdit = (id, category, informations) => {
        setCurrentAccessId(id);
        setCurrentCategory(decodeHtml(category));
        setCurrentInformations(decodeHtml(informations));
        setIsPopupOpen(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        const secureUpdatedAccess = {
            category: DOMPurify.sanitize(currentCategory),
            informations: DOMPurify.sanitize(currentInformations)
        };

        updateAccess(currentAccessId, secureUpdatedAccess)
        .then((res) => {
            if (res.status === 200) {
                setMessage({ type: "success", text: "Accès mis à jour avec succès." });
                setIsPopupOpen(false);
                setRefresh(prev => !prev);
            } else {
                setMessage({ type: "error", text: res.msg || "Erreur lors de la mise à jour de l'accès" });
            }
        })
        .catch((err) => {
            console.error(err);
            setMessage({ type: "error", text: "Erreur lors de la mise à jour de l'accès." });
        });
    };

    const handleDelete = (id) => {
        const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet accès ?");
        if (confirmDelete) {
            deleteAccess(id)
            .then((res) => {
                if (res.status === 200) {
                    setMessage({ type: "success", text: "Accès supprimé avec succès." });
                    setAccesses((prevAccesses) => prevAccesses.filter((access) => access.id !== id));
                } else {
                    setMessage({ type: "error", text: "Erreur lors de la suppression de l'accès." });
                }
            })
            .catch(() => {
                setMessage({ type: "error", text: "Erreur lors de la suppression de l'accès." });
            });
        }
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const newAccess = { category, informations };

        createAccess(newAccess)
        .then((res) => {
            if (res.status === 200) {
                setMessage({ type: "success", text: "Accès ajouté avec succès." });
                setCategory('');
                setInformations('');
                setRefresh(prev => !prev);
            } else {
                setMessage({ type: "error", text: res.msg || "Erreur lors de l'ajout de l'accès." });
            }
        })
        .catch((err) => {
            console.error(err);
            setMessage({ type: "error", text: "Erreur lors de l'ajout de l'accès." });
        });
    };

    return (
        <section>
            <article>
                {message.text && (
                    <p style={{ color: message.type === "error" ? "red" : "green" }} role="alert" aria-live="assertive">
                        {message.text}
                    </p>
                )}
            </article>

            <article>
                <h2>Liste des accès</h2>
                {accesses.length > 0 ? (
                    <ul>
                        {accesses.map((access) => (
                            <li key={access.id}>
                                {decodeHtml(access.category)}: {decodeHtml(access.informations)} {/* Décodage au moment de l'affichage */}
                                <button onClick={() => handleEdit(access.id, access.category, access.informations)}>Modifier</button> | 
                                <button onClick={() => handleDelete(access.id)}>Supprimer</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun accès disponible.</p>
                )}
            </article>

            <article>
                <h2>Liste des accès des séjours</h2>
                {stayAccesses.length > 0 ? (
                    <ul>
                        {stayAccesses.map((stayAccess) => (
                            <li key={stayAccess.id}>
                                Séjour ID {stayAccess.stay_id}: {decodeHtml(stayAccess.category)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun accès de séjour disponible.</p>
                )}
            </article>

            {/* Modal de mise à jour */}
            {isPopupOpen && (
                <div className="Popup">
                    <div className="Popup-content">
                        <h2>Modifier l'accès</h2>
                        <form onSubmit={handleUpdate}>
                        <label htmlFor="category">Catégorie</label>
                        <input
                            type="text"
                            id="category"
                            value={currentCategory}  // Plus besoin de décoder ici
                            onChange={(e) => setCurrentCategory(e.target.value)}
                            required
                        />
                        <label htmlFor="informations">Informations</label>
                        <input
                            type="text"
                            id="informations"
                            value={currentInformations}  // Plus besoin de décoder ici
                            onChange={(e) => setCurrentInformations(e.target.value)}
                            required
                        />
                            <button type="submit">Mettre à jour</button>
                            <button type="button" onClick={() => setIsPopupOpen(false)}>Annuler</button>
                        </form>
                    </div>
                </div>
            )}

            <article>
                <h2>Ajouter un accès</h2>
                <form onSubmit={handleCreate}>
                    <label htmlFor="category">Catégorie</label>
                    <input
                        type="text"
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    />
                    <label htmlFor="informations">Informations</label>
                    <input
                        type="text"
                        id="informations"
                        value={informations}
                        onChange={(e) => setInformations(e.target.value)}
                        required
                    />
                    <button type="submit">Ajouter</button>
                </form>
            </article>

            <article><Link to="/">Retour à l'accueil</Link></article>
        </section>
    );
};

export default Access;
