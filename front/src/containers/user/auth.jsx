import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Login from './login';
import Register from './register';

const AuthTest = () => {
  const location = useLocation();
  const [showSecond, setShowSecond] = useState(location.state?.showRegister || false);
  
  // Gestion de la bascule entre les composants
  const handleSwitch = () => {
    setShowSecond(!showSecond);
  };

  // mise a jour de l'état de navigation
  useEffect(() => {
    if (location.state?.showRegister !== undefined) {
      setShowSecond(location.state.showRegister);
    }
  }, [location.state]);

  return (
    <section className="auth-container">
      {/* Le div auth-cube est nécessaire pour l'animation 3D */}
      <div className={`auth-cube ${showSecond ? 'show-second' : 'show-first'}`}>
        <Login onLoginClick={handleSwitch} />
        <Register onRegisterClick={handleSwitch} />
      </div>
    </section>
  );
};

export default AuthTest;