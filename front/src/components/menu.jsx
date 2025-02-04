import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

function Menu({ user }) {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const location = useLocation();

  // Vérifie si la route actuelle est dans les sous-menus de "Séjours"
  const isInStaysSubMenu = location.pathname.startsWith("/stays");

  return (
    <ul className="main-navBar">
      <li>
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
          Accueil
        </NavLink>
      </li>

      {/* Menu pour un utilisateur connecté */}
      {/* {user?.isLogged ? ( */}
        <>
          <li>
            <NavLink
              to="/profil"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Profil
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
                <NavLink
                  to="/stays/mountain"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Montagne
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/stays/beach"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Plage
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/stays/city"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Ville
                </NavLink>
              </li>
            </ul>
          </li>
        </>
      {/* ) : ( */}
        {/* // Menu pour un utilisateur non connecté */}
        <>
          <li>
            <NavLink
              to="/register"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Inscription
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Connexion
            </NavLink>
          </li>
        </>
      {/* )} */}
    </ul>
  );
}

export default Menu;
