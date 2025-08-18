
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  isHomePage?: boolean;
}

const Layout = ({ children, isHomePage = false }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar isHomePage={isHomePage} />
      <main className={`flex-grow w-full ${isHomePage ? 'pt-0' : 'pt-16 sm:pt-20'} px-0`}>
        <div className="w-full max-w-full">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
