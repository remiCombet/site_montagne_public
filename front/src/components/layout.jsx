import React from 'react';
import Header from './header';
import Footer from './footer';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <section className="background-section"></section>
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;