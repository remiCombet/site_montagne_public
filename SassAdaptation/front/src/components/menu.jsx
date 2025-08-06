import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useDispatch } from "react-redux";
import { setSelectedStay } from "../slices/staySlice";

function Menu() {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Utiliser le contexte au lieu de Redux
  const { isLoggedIn, isAdmin, logout } = useAuth();

  const isInStaysSubMenu = location.pathname.startsWith("/stays");

  // Effet pour surveiller les changements de route et réinitialiser selectedStay si nécessaire
  useEffect(() => {
    const path = location.pathname;
    // Si on n'est pas sur une page de séjour spécifique ou la liste des séjours
    if (!path.startsWith('/stays/') && path !== '/stays' && !path.startsWith('/stays/mountain') && !path.startsWith('/stays/beach')) {
      dispatch(setSelectedStay(null));
    }
  }, [location.pathname, dispatch]);

  // Fonction de déconnexion mise à jour
  const handleLogout = (e) => {
    e.preventDefault();
    
    // Déconnexion
    logout();
    
    // Réinitialiser le séjour sélectionné lors de la déconnexion également
    dispatch(setSelectedStay(null));
    
    navigate('/');
  };

  return (
    <ul className="main-navBar">
      <li>
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
          Accueil
        </NavLink>
      </li>
      <li
        className={`menu-item-has-submenu ${
          isSubMenuOpen || isInStaysSubMenu ? "submenu-active" : ""
        }`}
        onMouseEnter={() => setIsSubMenuOpen(true)}
        onMouseLeave={() => setIsSubMenuOpen(false)}
      >
        <NavLink
          to="/stays"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Séjours
        </NavLink>
        <ul className="submenu">
          <li>
            <NavLink to="/stays/mountain" className={({ isActive }) => (isActive ? "active" : "")}>
              Montagne
            </NavLink>
          </li>
          <li>
            <NavLink to="/stays/beach" className={({ isActive }) => (isActive ? "active" : "")}>
              Plage
            </NavLink>
          </li>
        </ul>
      </li>
      <li>
        <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
          Contact
        </NavLink>
      </li>

      {isLoggedIn ? (
        <>
          <li>
            <NavLink to="/profil" className={({ isActive }) => (isActive ? "active" : "")}>
              Profil
            </NavLink>
          </li>
          {isAdmin && (
            <li>
              <NavLink to="/admin-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                Administration
              </NavLink>
            </li>
          )}
          <li>
            <NavLink
              to="/"
              onClick={handleLogout}
              className={({ isActive }) => (isActive ? "" : "inactive")}
            >
              Déconnexion
            </NavLink>
          </li>
        </>
      ) : (
        <>
          <li>
            <NavLink 
              to="/auth" 
              state={{ showRegister: false }} 
              className={({ isActive }) => (isActive && !location.state?.showRegister ? "active" : "")}
            >
              Connexion
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/auth" 
              state={{ showRegister: true }} 
              className={({ isActive }) => (isActive && location.state?.showRegister ? "active" : "")}
            >
              Inscription
            </NavLink>
          </li>
        </>
      )}
    </ul>
  );
}

export default Menu;