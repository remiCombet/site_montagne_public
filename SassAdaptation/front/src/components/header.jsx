import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Menu from "./menu";

const Header = () => {
  const location = useLocation();
  const { pathname } = location;
  
  // pages qui doivent afficher la banniere
  const shouldShowBanner = 
    pathname === '/' 
    // || pathname === '/auth';

    useEffect(() => {
        document.body.classList.toggle('has-banner', shouldShowBanner);
        return () => document.body.classList.remove('has-banner');
    }, [shouldShowBanner]);
    
  return (
    <>
      <header className="main-header">
        <nav className="site-navigation">
          <h1>Titre du site</h1>
          <Menu />
        </nav>
      </header>
      
      {shouldShowBanner && (
        <section 
          className="banner" 
          role="banner" 
          aria-labelledby="banner-heading"
        >
          <h2 id="banner-heading">Découvrez nos séjours d'exception</h2>
          <p>Des expériences inoubliables dans les plus beaux endroits</p>
        </section>
      )}
    </>
  );
};

export default Header;