"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface NavVisibilityContextType {
  isNavVisible: boolean;
  setNavVisibility: (visible: boolean) => void;
}

const NavVisibilityContext = createContext<NavVisibilityContextType>({
  isNavVisible: true,
  setNavVisibility: () => {},
});

export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const [isNavVisible, setIsNavVisible] = useState(true);

  const setNavVisibility = (visible: boolean) => {
    setIsNavVisible(visible);
  };

  return (
    <NavVisibilityContext.Provider value={{ isNavVisible, setNavVisibility }}>
      {children}
    </NavVisibilityContext.Provider>
  );
}

export function useNavVisibility() {
  const context = useContext(NavVisibilityContext);
  return context;
} 