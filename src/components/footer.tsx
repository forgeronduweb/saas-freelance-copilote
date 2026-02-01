"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleLogoClick = (e: React.MouseEvent) => {
        if (status === "authenticated") {
            e.preventDefault();
            router.push("/dashboard");
        }
    };

    const handleHomeClick = (e: React.MouseEvent) => {
        if (status === "authenticated") {
            e.preventDefault();
            router.push("/dashboard");
        }
    };

    const quickLinks = [
        { name: "Accueil", href: "/", handler: handleHomeClick },
        { name: "Comment ça marche", href: "#how-it-works" },
        { name: "Tarifs", href: "#pricing" },
        { name: "FAQ", href: "/faq" },
        { name: "Blog", href: "/blog" }
    ];

    const legalLinks = [
        { name: "À propos", href: "/about" },
        { name: "Mentions légales", href: "/legal" },
        { name: "CGU", href: "/terms" },
        { name: "Politique de confidentialité", href: "/privacy" },
        { name: "Politique de remboursement", href: "/refund" }
    ];

    const socialLinks = [
        {
            name: "Facebook",
            href: "#",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            )
        },
        {
            name: "LinkedIn",
            href: "#",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
            )
        },
        {
            name: "Instagram",
            href: "#",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.197-2.25-1.197-3.654 0-1.404.449-2.706 1.197-3.654.749-.948 1.9-1.559 3.197-1.559s2.448.611 3.197 1.559c.748.948 1.197 2.25 1.197 3.654 0 1.404-.449 2.706-1.197 3.654-.749.948-1.9 1.559-3.197 1.559zm7.718 0c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.197-2.25-1.197-3.654 0-1.404.449-2.706 1.197-3.654.749-.948 1.9-1.559 3.197-1.559s2.448.611 3.197 1.559c.748.948 1.197 2.25 1.197 3.654 0 1.404-.449 2.706-1.197 3.654-.749.948-1.9 1.559-3.197 1.559z"/>
                </svg>
            )
        },
        {
            name: "Twitter",
            href: "#",
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
            )
        }
    ];

    return (
        <footer className="bg-black text-white">
            <div className="px-4 md:px-16 lg:px-24 xl:px-32 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo et description */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4" onClick={handleLogoClick}>
                            <span className="text-xl font-bold text-yellow-400">Tuma</span>
                        </Link>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Le Copilote du Freelance : votre assistant business personnel pour gérer autonomie commerciale, rigueur administrative et efficacité opérationnelle.
                        </p>
                        
                        {/* Les 3 piliers */}
                        <div className="mb-6">
                            <p className="text-sm text-slate-400 mb-3">Les 3 piliers</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded text-xs font-medium">
                                    Autonomie Commerciale
                                </div>
                                <div className="bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded text-xs font-medium">
                                    Rigueur Administrative
                                </div>
                                <div className="bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded text-xs font-medium">
                                    Efficacité Opérationnelle
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Liens rapides */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-yellow-400">Liens rapides</h3>
                        <ul className="space-y-4">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-slate-300 hover:text-yellow-400 transition-colors"
                                        onClick={link.handler}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Informations légales */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-yellow-400">Informations légales</h3>
                        <ul className="space-y-4">
                            {legalLinks.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-slate-300 hover:text-yellow-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support et contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-yellow-400">Support & Contact</h3>
                        <div className="space-y-4">
                            <div>
                                <Link 
                                    href="/contact"
                                    className="inline-flex items-center text-slate-300 hover:text-yellow-400 transition-colors"
                                >
                                Nous contacter
                                </Link>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Disponibilité</p>
                                <p className="text-slate-300 text-sm">
                                    Plateforme : 24h/24, 7j/7<br />
                                    Support : 24h/24, 7j/7
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Séparateur */}
                <div className="border-t border-slate-700 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Copyright */}
                        <div className="text-slate-400 text-sm">
                            {currentYear} AfriLance. Tous droits réservés.
                        </div>

                        {/* Réseaux sociaux */}
                        <div className="flex items-center gap-4">
                            <span className="text-slate-400 text-sm mr-2">Suivez-nous</span>
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className="text-slate-400 hover:text-yellow-400 transition-colors"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;