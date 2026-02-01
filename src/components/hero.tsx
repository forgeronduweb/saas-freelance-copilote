"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="flex flex-col items-center text-sm bg-gradient-to-b from-white via-white to-slate-50 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/bg-with-grid.png')] bg-cover bg-center bg-no-repeat opacity-50" />
      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur text-slate-800 text-sm">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900">Tuma</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 transition duration-500">
          <a href="#how-it-works" className="hover:text-yellow-600 transition">
            Comment ça marche
          </a>
          <a href="#pricing" className="hover:text-yellow-600 transition">
            Tarifs
          </a>
        </div>

        <div className="hidden md:block space-x-3">
          <Link href="/signup" className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 transition text-black rounded-md">
            Commencer
          </Link>
          <Link href="/login" className="hover:bg-slate-100 transition px-6 py-2 border border-yellow-500 text-yellow-600 rounded-md">
            Connexion
          </Link>
        </div>

        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden active:scale-90 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h16"/>
            <path d="M4 12h16"/>
            <path d="M4 19h16"/>
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[100] bg-white/95 text-slate-800 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <a href="#services" onClick={() => setMobileMenuOpen(false)}>
          Fonctionnalités
        </a>
        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
          Tarifs
        </a>
        <Link href="/signup" className="px-8 py-3 bg-yellow-400 text-black rounded-md" onClick={() => setMobileMenuOpen(false)}>
          Commencer
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-slate-100 hover:bg-slate-200 transition text-black rounded-md flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>

      {/* Main Hero Content */}
      <main className="relative z-10 flex flex-col items-center max-md:px-4">
        {/* Badge */}
        <Link href="#pricing" className="mt-32 flex items-center gap-2 border border-yellow-200 rounded-full p-1 pr-3 text-sm font-medium text-yellow-500 bg-yellow-500/20 hover:bg-yellow-500/40 transition">
          <span className="bg-yellow-400 text-black text-xs px-3 py-1 rounded-full">
            NOUVEAU
          </span>
          <p className="flex items-center gap-1">
            <span>Essai gratuit 14 jours</span>
            <svg className="mt-0.5" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="m1 1 4 3.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>
        </Link>

        {/* Title */}
        <h1 className="text-center text-4xl leading-[50px] md:text-6xl md:leading-[80px] font-semibold max-w-4xl text-slate-900 mt-6">
          <span className="text-yellow-600">Le Copilote du Freelance</span> : votre business en pilote automatique.
        </h1>

        {/* Subtitle */}
        <p className="text-center text-base text-slate-700 max-w-lg mt-4">
          Autonomie commerciale, rigueur administrative et efficacité opérationnelle. Gagnez 15h par semaine et développez votre activité en toute sérénité.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <Link href="/signup" className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black active:scale-95 rounded-lg px-7 h-11 transition">
            Commencer gratuitement
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.166 10h11.667m0 0L9.999 4.165m5.834 5.833-5.834 5.834" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="#pricing" className="border border-slate-600 active:scale-95 hover:bg-slate-100 transition text-slate-600 rounded-lg px-8 h-11 flex items-center">
            Voir les tarifs
          </Link>
        </div>

        {/* Dashboard Image */}
        <div className="relative mt-16 mb-0 pb-20">
          <img 
            src="/heros.png"
            className="w-full rounded-[15px] max-w-4xl shadow-2xl border-t-4 border-l-4 border-r-4 border-yellow-400"
            alt="AfriLance Dashboard"
          />
          {/* Gradient fade to benefits */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
        </div>
      </main>
    </section>
  );
}
