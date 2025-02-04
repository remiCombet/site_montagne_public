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

    useEffect(() => {
        // Si l'utilisateur n'est pas connecté
        if (!user.isLogged) {
            if (token === null && props.auth) {
                setRedirectPath("/login"); // Rediriger vers la page de login si l'utilisateur n'est pas connecté
            }
        } else if (token) {
            // Vérification du token pour récupérer les données de l'utilisateur
            checkMyToken()
                .then((res) => {
                    if (res.status !== 200) {
                        if (props.auth) {
                            setRedirectPath("/login"); // Rediriger vers login si le token est invalide
                        }
                    } else {
                        if (!user.isLogged && res.status === 200) {
                            dispatch(connectUser({ 
                                infos: { ...res.user, token }, 
                                role: res.user.role || '' 
                            }));
                        }

                        // Vérification du rôle en fonction des props (admin)
                        if (props.admin && res.user.role !== "admin") {
                            setRedirectPath("/"); // Rediriger si l'utilisateur n'est pas admin
                        }
                    }
                })
                .catch(err => console.log(err));
        } else if (props.admin && user.role !== "admin") {
            setRedirectPath("/"); // Si l'utilisateur connecté n'est pas admin et essaie d'accéder à une route admin
        }
    }, [props, user, token, dispatch]);

    if (redirectPath) {
        return <Navigate to={redirectPath} />;
    }

    return <Child {...props} params={params} />;
};

export default RequireAuth;