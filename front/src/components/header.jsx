import React from 'react';
import { useLocation } from 'react-router-dom';
import Menu from "./menu";

const Header = () => {
  const location = useLocation();
  const { pathname } = location;
  
  // Pages qui doivent afficher la bannière
  const shouldShowBanner = 
    pathname === '/' ||
    pathname === '/auth';
    
  return (
    <header>
      <nav className="site-navigation">
        <h1>Titre du site</h1>
        <Menu />
      </nav>
      
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
    </header>
  );
};

export default Header;