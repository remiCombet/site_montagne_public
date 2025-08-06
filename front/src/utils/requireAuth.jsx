import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { connectUser, logoutUser } from "../slices/userSlice";
import { checkMyToken } from "../api/auth";
import { useAuth } from "../context/authContext";

const RequireAuth = (props) => {
    const token = window.localStorage.getItem('Vent_dAmes_Montagne');
    const params = useParams();
    const dispatch = useDispatch();
    const { isLoggedIn, isAdmin } = useAuth();
    const Child = props.child;
    const [redirectPath, setRedirectPath] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cas 1: Page protégée mais utilisateur non connecté
        if (props.auth && !isLoggedIn) {
            // Si pas de token, rediriger directement
            if (!token) {
                console.log("Pas de token - redirection vers login");
                dispatch(logoutUser()); // S'assurer que Redux est propre
                setRedirectPath("/auth");
                setLoading(false);
            } else {
                // Si token présent, vérifier sa validité
                console.log("Token présent - vérification avec l'API");
                checkMyToken()
                    .then((res) => {
                        console.log("Réponse de vérification token:", res);
                        if (res.status === 200) {
                            // Token valide, connecter l'utilisateur
                            console.log("Token valide - mise à jour de l'utilisateur");
                            dispatch(connectUser({
                                infos: { ...res.user, token },
                                role: res.user.role || ''
                            }));
                            setLoading(false);
                        } else {
                            // Token invalide, nettoyer et rediriger
                            console.log("Token invalide:", res.msg);
                            window.localStorage.removeItem('Vent_dAmes_Montagne');
                            dispatch(logoutUser());
                            setRedirectPath("/auth");
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        // Erreur API, nettoyer et rediriger
                        console.error("Erreur vérification token:", error);
                        window.localStorage.removeItem('Vent_dAmes_Montagne');
                        dispatch(logoutUser());
                        setRedirectPath("/auth");
                        setLoading(false);
                    });
            }
        }
        // Cas 2: Page non protégée - aucune vérification nécessaire
        else if (!props.auth) {
            console.log("Page non protégée - accès direct");
            setLoading(false);
        }
        // Cas 3: Page protégée, utilisateur connecté mais vérification admin requise
        else if (props.admin && !isAdmin) {
            console.log("Page admin - utilisateur non admin - redirection accueil");
            setRedirectPath("/");
            setLoading(false);
        }
        // Cas 4: Page protégée, utilisateur connecté avec droits suffisants
        else {
            console.log("Utilisateur connecté avec les droits suffisants");
            setLoading(false);
        }
    }, [props.auth, props.admin, isLoggedIn, isAdmin, token, dispatch]);

    // Afficher un indicateur de chargement pendant la vérification
    if (loading) {
        return <div className="loading-indicator">Vérification de votre session...</div>;
    }

    // Rediriger si nécessaire
    if (redirectPath) {
        return <Navigate to={redirectPath} />;
    }

    // Rendre le composant enfant avec les paramètres
    return <Child {...props} params={params} />;
};

export default RequireAuth;
