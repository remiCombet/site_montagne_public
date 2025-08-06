import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

function Menu() {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Utiliser le contexte au lieu de Redux
  const { isLoggedIn, isAdmin, logout } = useAuth();

  const isInStaysSubMenu = location.pathname.startsWith("/stays");

  // Fonction de déconnexion mise à jour
  const handleLogout = (e) => {
    e.preventDefault();
    
    // Déconnexion
    logout();
    
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
          <li>
            <NavLink to="/stays/city" className={({ isActive }) => (isActive ? "active" : "")}>
              Ville
            </NavLink>
          </li>
        </ul>
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