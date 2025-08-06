import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Login from './login';
import Register from './register';

// test
import Register2 from './Register2';

const Auth = () => {
  const location = useLocation();
  const [showRegister, setShowRegister] = useState(location.state?.showRegister || false);
  
  // Gestion de la bascule entre les composants
  const handleToggle = () => {
    setShowRegister(!showRegister);
  };

  // Mise à jour de l'état en fonction de la navigation
  useEffect(() => {
    if (location.state?.showRegister !== undefined) {
      setShowRegister(location.state.showRegister);
    }
  }, [location.state]);

  return (
    <section className="auth">
      <div className="auth__container">
        {showRegister ? (
          <Register onRegisterClick={handleToggle} />
          // <Register2 onRegisterClick={handleToggle}/>
        ) : (
          <Login onLoginClick={handleToggle} />
        )}
      </div>

      <div className="auth__attribution">
        <a href="https://www.pexels.com/fr-fr/@kinkate/" target="_blank" rel="noopener noreferrer">Photo par Alex KinKate</a>
      </div>
    </section>
  );
};

export default Auth;