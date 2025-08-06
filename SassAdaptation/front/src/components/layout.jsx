import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './header';
import Footer from './footer';

const Layout = ({ children }) => {
  // Utiliser la location actuelle
  const location = useLocation();
  const [pageName, setPageName] = useState('');
  
  // Déterminer la page en fonction du chemin
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setPageName('home');
    else if (path.includes('/contact')) setPageName('contact');
    else if (path.includes('/auth')) setPageName('auth');
    else if (path.match(/^\/stays\/\d+$/)) setPageName('stay-details');
    else if (path.includes('/stays')) setPageName('stays');
    else if (path.includes('/profil')) setPageName('profile');
    else if (path.includes('/admin')) setPageName('admin');
    else setPageName('');
    console.log("Page détectée:", path, "→", pageName);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main className={`main-content ${pageName ? `main-content--${pageName}` : ''}`}>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;