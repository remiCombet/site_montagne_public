import { useState } from 'react';
import Test1 from './test1';
import Test2 from './test2';

const AuthTest = () => {
  const [showSecond, setShowSecond] = useState(false);
  
  // Gestion de la bascule entre les composants
  const handleSwitch = () => {
    setShowSecond(!showSecond);
  };

  return (
    <section className="auth-container">
      {/* Le div auth-cube est nécessaire pour l'animation 3D */}
      <div className={`auth-cube ${showSecond ? 'show-second' : 'show-first'}`}>
        {/* Ne pas utiliser article ici - le déplacer dans les composants enfants */}
        <Test1 onLoginClick={handleSwitch} />
        <Test2 onRegisterClick={handleSwitch} />
      </div>
    </section>
  );
};

export default AuthTest;