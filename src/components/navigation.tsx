"use client";

import * as React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import * as Dropdown from "~/components/ui/dropdown";

const NavLink: React.FC<{
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}> = ({ href, children, isActive = false }) => {
  return (
    <Link
      href={href}
      className="group relative font-styrene text-paragraph-md font-bold uppercase nav-blend transition-opacity duration-300"
    >
      {children}
      {/* Левая линия - появляется слева и движется к центру */}
      <span 
        className="ease-[cubic-bezier(0.22,0.61,0.36,1)] absolute bottom-0 left-0 h-[2px] w-0 translate-y-1 transform nav-blend-line transition-all duration-700 group-hover:w-1/2"
      />
      {/* Правая линия - появляется справа и движется к центру */}
      <span 
        className="ease-[cubic-bezier(0.22,0.61,0.36,1)] absolute bottom-0 right-0 h-[2px] w-0 translate-y-1 transform nav-blend-line transition-all duration-700 group-hover:w-1/2"
      />
    </Link>
  );
};

export const Navigation = () => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    // Перенаправляем на главную страницу с принудительной перезагрузкой
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 px-8 pt-8 z-[10000]" style={{ mixBlendMode: 'difference' }}>
      <div className="flex items-center justify-between">
        {/* Левая часть */}
        <div className="flex items-center gap-6">
          <NavLink href="/" isActive={true}>
            Home
          </NavLink>
          <NavLink href="/gift">Roadmap</NavLink>
        </div>

        {/* Правая часть */}
        <div className="flex items-center gap-6">
          <NavLink href="/gallery">Gallery</NavLink>
          {isMounted && session?.user?.username ? (
            <span className="font-styrene text-paragraph-md font-bold uppercase nav-blend">
              <Dropdown.Root onOpenChange={setIsDropdownOpen}>
                <Dropdown.Trigger asChild className="focus:outline-none">
                  <button
                    className={`group relative cursor-pointer font-styrene text-paragraph-md font-bold uppercase nav-blend ${isDropdownOpen ? "[&>span]:w-1/2" : ""}`}
                  >
                    {session.user.username}
                    <span 
                      className="ease-[cubic-bezier(0.22,0.61,0.36,1)] absolute bottom-0 left-0 h-[2px] w-0 translate-y-1 transform nav-blend-line transition-all duration-700 group-hover:w-1/2"
                    />
                    <span 
                      className="ease-[cubic-bezier(0.22,0.61,0.36,1)] absolute bottom-0 right-0 h-[2px] w-0 translate-y-1 transform nav-blend-line transition-all duration-700 group-hover:w-1/2"
                    />
                  </button>
                </Dropdown.Trigger>
                <Dropdown.Content align="end">
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Content>
              </Dropdown.Root>
            </span>
          ) : (
            <NavLink href="/login">Log in</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};
