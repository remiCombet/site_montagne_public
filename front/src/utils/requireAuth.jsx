import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { selectUser, connectUser } from "../slices/userSlice";
import { checkMyToken } from "../api/auth";

const RequireAuth = (props) => {
    const token = window.localStorage.getItem('Vent_dAmes_Montagne');
    const params = useParams();
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const Child = props.child;
    const [redirectPath, setRedirectPath] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user.isLogged) {
            // Si l'utilisateur n'est pas connecté et qu'on a besoin d'une connexion
            if (!token) {
                setRedirectPath("/login");  // Redirige vers login si le token est absent
                setLoading(false);
            } else {
                // Si un token existe, on vérifie sa validité
                checkMyToken()
                    .then((res) => {
                        if (res.status === 200) {
                            // Si le token est valide, on met à jour l'utilisateur
                            dispatch(connectUser({
                                infos: { ...res.user, token },
                                role: res.user.role || ''
                            }));
                        } else {
                            setRedirectPath("/login");  // Token invalide
                        }
                    })
                    .catch(() => {
                        setRedirectPath("/login");  // Erreur lors de la vérification du token
                    })
                    .finally(() => setLoading(false));  // On termine le chargement
            }
        } else {
            // Si l'utilisateur est connecté
            if (props.admin && user.role !== "admin") {

                // Si l'utilisateur est connecté mais n'est pas admin
                setRedirectPath("/");  // Redirige vers la page d'accueil
                setLoading(false);
            } else {
              setLoading(false);
            }
        }
    }, [props, user, token, dispatch]);

    if (loading) {
        return null;
    }

    if (redirectPath) {
        return <Navigate to={redirectPath} />;
    }

    return <Child {...props} params={params} />;
};

export default RequireAuth;
