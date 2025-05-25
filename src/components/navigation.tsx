"use client";

import * as React from "react";
import Link from "next/link";

interface NavigationProps {
  isAuthenticated?: boolean;
  userName?: string;
}

const NavLink: React.FC<{ href: string; children: React.ReactNode; isActive?: boolean }> = ({ 
  href, 
  children, 
  isActive = false 
}) => {
  return (
    <Link
      href={href}
      className={`
        relative font-styrene text-paragraph-md-bold uppercase text-text-strong-950 
        transition-opacity duration-300 group
      `}
    >
      {children}
      {/* Левая линия - появляется слева и движется к центру */}
      <span 
        className="
          absolute bottom-0 left-0 h-[2px] bg-text-strong-950 
          w-0 group-hover:w-1/2 
          transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]
          transform translate-y-1
        "
      />
      {/* Правая линия - появляется справа и движется к центру */}
      <span 
        className="
          absolute bottom-0 right-0 h-[2px] bg-text-strong-950 
          w-0 group-hover:w-1/2 
          transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]
          transform translate-y-1
        "
      />
    </Link>
  );
};

export const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated = false,
  userName,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-white-0">
      <div className="flex items-center justify-between px-8 pt-8">
        {/* Левая часть */}
        <div className="flex items-center gap-6">
          <NavLink href="/" isActive={true}>
            Home
          </NavLink>
          <NavLink href="/roadmap">
            Roadmap
          </NavLink>
        </div>

        {/* Правая часть */}
        <div className="flex items-center gap-6">
          <NavLink href="/gallery">
            Gallery
          </NavLink>
          {isAuthenticated && userName ? (
            <span className="font-styrene text-paragraph-md-bold uppercase text-text-strong-950">
              {userName}
            </span>
          ) : (
            <NavLink href="/login">
              Log in
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}; 