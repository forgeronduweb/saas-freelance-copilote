"use client";
import React, { useState } from "react";
import Link from "next/link";

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);
    
    const getPlans = () => [
        {
            name: "Starter",
            priceMonthly: "0",
            priceAnnual: "0",
            description: "Découvrez votre copilote gratuitement",
            features: [
                "Jusqu'à 3 clients actifs",
                "Agenda intelligent",
                "5 factures / mois",
                "Time tracking simple",
                "Dashboard essentiel",
                "Support communautaire"
            ],
            cta: "Commencer gratuitement",
            popular: false,
            buttonStyle: "border border-yellow-200 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 text-yellow-500 transition-all duration-300 transform hover:scale-105"
        },
        {
            name: "Pro",
            priceMonthly: "29",
            priceAnnual: "290",
            description: "Votre copilote complet pour gagner 15h/semaine",
            features: [
                "Clients illimités",
                "Les 3 piliers : Commercial, Admin, Opérationnel",
                "Factures illimitées + relances auto",
                "Calcul impôts/charges en temps réel",
                "CRM + pipeline commercial",
                "Intégrations (Google Calendar, Slack)",
                "Support prioritaire",
                ...(isAnnual ? [
                    "2 mois offerts",
                    "Templates premium inclus"
                ] : [])
            ],
            cta: "Essai gratuit 14 jours",
            popular: true,
            buttonStyle: "bg-yellow-400 hover:bg-yellow-500 text-black transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
        },
        {
            name: "Business",
            priceMonthly: "59",
            priceAnnual: "590",
            description: "Pour experts et petites équipes",
            features: [
                "Tout le plan Pro +",
                "Multi-utilisateurs (jusqu'à 5)",
                "IA avancée (prévisions, optimisation)",
                "API accès complet",
                "Portail client personnalisé",
                "Onboarding dédié",
                "Support prioritaire 24/7",
                ...(isAnnual ? [
                    "3 mois offerts",
                    "Consultation stratégie incluse"
                ] : [])
            ],
            cta: "Essai gratuit 14 jours",
            popular: false,
            buttonStyle: "border border-yellow-200 hover:bg-yellow-500 hover:text-white hover:border-yellow-500 text-yellow-500 transition-all duration-300 transform hover:scale-105"
        }
    ];

    return (
        <section id="pricing" className="py-16 bg-slate-50">
            <div className="px-4 md:px-16 lg:px-24 xl:px-32">
                <div className="text-center mb-16">
                    <p className="text-base font-medium text-yellow-600 mb-2">Tarifs</p>
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-4">
                        Choisissez votre copilote
                    </h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
                        Sans commission sur votre chiffre d'affaires. Gagnez 15h par semaine avec votre assistant business personnel.
                    </p>
                    
                    {/* Toggle Mensuel/Annuel */}
                    <div className="flex flex-col items-center justify-center mb-8 space-y-3">
                        <div className="flex items-center justify-center">
                            <span className={`mr-3 ${!isAnnual ? 'text-yellow-600 font-medium' : 'text-slate-600'}`}>Mensuel</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                                    isAnnual ? 'bg-yellow-500' : 'bg-slate-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        isAnnual ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                            <span className={`ml-3 ${isAnnual ? 'text-yellow-600 font-medium' : 'text-slate-600'}`}>Annuel</span>
                        </div>
                        <div className="flex justify-center">
                            <span className={`bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium transition-opacity ${
                                isAnnual ? 'opacity-100' : 'opacity-0'
                            }`}>
                                Jusqu&apos;à -25% + bonus exclusifs
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {getPlans().map((plan, index) => (
                        <div 
                            key={index} 
                            className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 flex flex-col ${
                                plan.popular 
                                    ? 'border-yellow-500' 
                                    : 'border-slate-200 hover:border-yellow-200'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-medium">
                                        Le plus populaire
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-semibold text-slate-800 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center mb-2 h-16">
                                    <span className="text-4xl font-bold text-slate-800">
                                        {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                                    </span>
                                    <span className="text-slate-600 ml-1">
                                        FCFA{isAnnual ? '/an' : '/mois'}
                                    </span>
                                </div>
                                <p className="text-slate-600">{plan.description}</p>
                            </div>

                            <div className="flex-grow">
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start">
                                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-slate-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                href="/signup"
                                className={`w-full px-8 py-3 rounded-full font-medium transition-colors mt-auto text-center ${plan.buttonStyle}`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">
                    <div className="bg-yellow-400 rounded-2xl p-8 text-black">
                        <h3 className="text-2xl font-semibold mb-4">
                            Prêt à optimiser votre activité ? 
                        </h3>
                        <p className="mb-6 max-w-2xl mx-auto">
                            Accès anticipé : rejoignez la liste d’attente et soyez parmi les premiers à tester Tuma.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/signup"
                                className="bg-black hover:bg-slate-800 text-white px-8 py-3 rounded-full font-medium transition-colors text-center"
                            >
                                Essai gratuit 14 jours
                            </Link>
                            <Link
                                href="/contact"
                                className="border-2 border-black hover:bg-black hover:text-white text-black px-8 py-3 rounded-full font-medium transition-colors text-center"
                            >
                                Planifier une démo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
