"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, MapPin } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { status } = useSession();
    const router = useRouter();

    const handleLogoClick = (e: React.MouseEvent) => {
        if (status === "authenticated") {
            e.preventDefault();
            router.push("/dashboard");
        }
    };

    const productLinks = [
        { name: "Fonctionnalités", href: "/#features" },
        { name: "Tarifs", href: "/#pricing" },
        { name: "Comment ça marche", href: "/#how-it-works" },
    ];

    const companyLinks = [
        { name: "À propos", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    const legalLinks = [
        { name: "Mentions légales", href: "/legal" },
        { name: "CGU", href: "/terms" },
        { name: "Confidentialité", href: "/privacy" },
        { name: "Remboursement", href: "/refund" },
    ];

    return (
        <footer id="footer" className="bg-slate-950 text-white border-t border-slate-800/60">
            <div className="px-4 md:px-10 lg:px-16 py-14">
                <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Logo et description */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-flex items-center gap-2 mb-4" onClick={handleLogoClick}>
                            <span className="text-xl font-bold text-white tracking-tight">Tuma</span>
                        </Link>
                        <p className="text-slate-300/90 text-sm leading-relaxed mb-5 max-w-sm">
                            Le copilote business des freelances. Gérez vos clients, factures et projets en un seul endroit.
                        </p>
                        <div className="space-y-2 text-sm text-slate-400">
                            <a href="mailto:contact@tuma.app" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                                <Mail className="w-4 h-4" />
                                contact@tuma.app
                            </a>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Abidjan, Côte d&apos;Ivoire
                            </div>
                        </div>
                    </div>

                    {/* Produit */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-3">Produit</h3>
                        <ul className="space-y-2">
                            {productLinks.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-slate-400 hover:text-yellow-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Entreprise */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-3">Entreprise</h3>
                        <ul className="space-y-2">
                            {companyLinks.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-slate-400 hover:text-yellow-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Légal */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-3">Légal</h3>
                        <ul className="space-y-2">
                            {legalLinks.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-slate-400 hover:text-yellow-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-slate-800/60">
                <div className="px-4 md:px-10 lg:px-16 py-5">
                    <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500">
                        <p>&copy; {currentYear} Tuma. Tous droits réservés.</p>
                        <p>Fait avec ❤️ en Côte d&apos;Ivoire</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;