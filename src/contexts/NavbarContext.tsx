
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
  isMobileNavOpen: boolean;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const useNavbarContext = () => {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbarContext must be used within a NavbarContextProvider');
  }
  return context;
};

interface NavbarContextProviderProps {
  children: ReactNode;
}

export const NavbarContextProvider: React.FC<NavbarContextProviderProps> = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(prev => !prev);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <NavbarContext.Provider value={{ isMobileNavOpen, toggleMobileNav, closeMobileNav }}>
      {children}
    </NavbarContext.Provider>
  );
};
