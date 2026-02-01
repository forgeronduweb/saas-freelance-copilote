"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (status === "authenticated") {
      e.preventDefault();
      router.push("/dashboard");
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 md:px-16 lg:px-24 xl:px-32 md:py-3 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-yellow-50/30 to-transparent'
    }`}>
      {/* Logo */}
      <Link href="/" onClick={handleLogoClick}>
        <div className="flex items-center gap-2 text-xl sm:text-xl md:text-2xl font-bold text-black">
          <Image 
            src="/logo.png" 
            alt="Tuma Logo" 
            width={32} 
            height={32}
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
          />
          Tuma
        </div>
      </Link>

      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Menu */}
      <div
        className={`${
          isOpen ? "max-md:translate-x-0" : "max-md:translate-x-full"
        } max-md:fixed max-md:top-0 max-md:right-0 max-md:h-screen max-md:w-[85%] max-md:max-w-sm
        max-md:bg-white max-md:transition-transform max-md:duration-300 max-md:z-50 max-md:shadow-2xl
        max-md:flex max-md:flex-col max-md:justify-start max-md:pt-20 max-md:pb-8 max-md:px-6 max-md:overflow-y-auto
        md:flex md:items-center md:gap-8 font-medium`}
      >

        {/* Close button (mobile) */}
        <button
          onClick={closeMenu}
          className="md:hidden absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full aspect-square font-medium transition"
          aria-label="Fermer le menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Navigation principale */}
        <div className="max-md:flex max-md:flex-col max-md:gap-4 max-md:w-full max-md:mt-4 md:flex md:items-center md:gap-8">
          <a 
            href="#how-it-works" 
            onClick={closeMenu}
            className="hover:text-yellow-500 transition-colors max-md:text-lg max-md:font-medium max-md:w-full max-md:py-3 max-md:border-b max-md:border-slate-100 md:text-lg"
          >
            Comment ça marche
          </a>
          <a 
            href="#pricing" 
            onClick={closeMenu}
            className="hover:text-yellow-500 transition-colors max-md:text-lg max-md:font-medium max-md:w-full max-md:py-3 max-md:border-b max-md:border-slate-100 md:text-lg"
          >
            Tarifs
          </a>
        </div>
        
        {/* Mobile CTA */}
        <div className="md:hidden w-full mt-auto pt-8">
          <Link 
            href="/signup" 
            onClick={closeMenu}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-medium transition text-lg text-center block"
          >
            Commencer
          </Link>
          <Link 
            href="/login" 
            onClick={closeMenu}
            className="w-full border-2 border-slate-200 hover:border-slate-300 text-black px-6 py-3 rounded-full font-medium transition text-lg mt-3 text-center block"
          >
            Connexion
          </Link>
        </div>
      </div>

      {/* Desktop CTA */}
      <Link href="/login" className="hidden md:block bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 md:px-6 md:py-3 rounded-full font-medium transition text-base md:text-lg">
        Connexion
      </Link>

      {/* Open button (mobile) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden bg-yellow-400 hover:bg-yellow-500 text-black p-2 rounded-lg font-medium transition flex-shrink-0"
        aria-label="Ouvrir le menu"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12h16" />
          <path d="M4 18h16" />
          <path d="M4 6h16" />
        </svg>
      </button>
    </nav>
  );
}