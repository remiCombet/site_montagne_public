import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logoutUser } from "../slices/userSlice";
import { resetStayState } from '../slices/staySlice';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    // Supprimer le token
    window.localStorage.removeItem("Vent_dAmes_Montagne");
    
    // Action Redux
    dispatch(logoutUser());
    dispatch(resetStayState());
  };

  // Valeurs exposées par le contexte
  const value = {
    isLoggedIn: user?.isLogged || false,
    isAdmin: user?.role === 'admin',
    userData: user?.infos || {},
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);