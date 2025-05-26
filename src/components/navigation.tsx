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
      className={`group relative font-styrene text-paragraph-md-bold uppercase text-adaptive transition-opacity duration-300`}
    >
      {children}
      {/* Левая линия - появляется слева и движется к центру */}
      <span className="ease-[cubic-bezier(0.22,0.61,0.36,1)] absolute bottom-0 left-0 h-[2px] w-0 translate-y-1 transform bg-adaptive-text transition-all duration-700 group-hover:w-1/2" />
      {/* Правая линия - появляется справа и движется к центру */}
      <span className="ease-[cubic-bezier(0.22,0.61,0.36,1)] absolute bottom-0 right-0 h-[2px] w-0 translate-y-1 transform bg-adaptive-text transition-all duration-700 group-hover:w-1/2" />
    </Link>
  );
};

export const Navigation = () => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    // Перенаправляем на главную страницу с принудительной перезагрузкой
    window.location.href = "/";
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50">
      <div className="flex items-center justify-between px-8 pt-8">
        {/* Левая часть */}
        <div className="flex items-center gap-6">
          <NavLink href="/" isActive={true}>
            Home
          </NavLink>
          <NavLink href="/roadmap">Roadmap</NavLink>
        </div>

        {/* Правая часть */}
        <div className="flex items-center gap-6">
          <NavLink href="/gallery">Gallery</NavLink>
          {session?.user?.username ? (
            <span className="font-styrene text-paragraph-md-bold uppercase text-adaptive">
              <Dropdown.Root onOpenChange={setIsDropdownOpen}>
                <Dropdown.Trigger asChild className="focus:outline-none">
                  <button
                    className={`group relative cursor-pointer font-styrene text-paragraph-md-bold uppercase text-adaptive ${isDropdownOpen ? "[&>span]:w-1/2" : ""}`}
                  >
                    {session.user.username}
                    <span className="ease-[cubic-bezier(0.22,0.61,0.36,1)] absolute bottom-0 left-0 h-[2px] w-0 translate-y-1 transform bg-adaptive-text transition-all duration-700 group-hover:w-1/2" />
                    <span className="ease-[cubic-bezier(0.22,0.61,0.36,1)] absolute bottom-0 right-0 h-[2px] w-0 translate-y-1 transform bg-adaptive-text transition-all duration-700 group-hover:w-1/2" />
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
