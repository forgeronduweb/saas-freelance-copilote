"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Services = () => {
    const services = [
        {
            icon: (
                <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            title: "Agenda & Temps",
            description: "Calendrier intelligent, time tracking, optimisation des créneaux productifs et rappels automatiques.",
            features: [
                "Vue calendrier mensuelle/semaine",
                "Time tracking par projet/client",
                "Blocage temps profond automatique",
                "Alertes deadlines et rendez-vous"
            ]
        },
        {
            icon: (
                <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: "Gestion Clients",
            description: "CRM complet, pipeline commercial, historique communications et suivi des paiements.",
            features: [
                "Fiches clients 360°",
                "Pipeline commercial visuel",
                "Historique communications",
                "Portail client sécurisé"
            ]
        },
        {
            icon: (
                <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            title: "Marketing & Com",
            description: "Planification réseaux sociaux, templates emails, gestion portfolio et veille concurrentielle.",
            features: [
                "Planification contenu réseaux sociaux",
                "Templates emails automatisés",
                "Gestion portfolio et études de cas",
                "Veille concurrentielle IA"
            ]
        },
        {
            icon: (
                <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: "Finance & Reporting",
            description: "Facturation automatique, suivi trésorerie, prévisionnels IA et analytics détaillés.",
            features: [
                "Facturation et relances automatiques",
                "Suivi trésorerie en temps réel",
                "Prévisionnels basés sur l'IA",
                "Analytics et KPIs détaillés"
            ]
        },
    ];

    return (
        <section id="services" className="py-16 bg-slate-900">
            <div className="max-w-7xl mx-auto px-2 md:px-3 lg:px-4 xl:px-5">
                <div className="text-center mb-16">
                    <p className="text-base font-medium text-orange-600 mb-2">Fonctionnalités</p>
                    <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                        Les 5 modules de votre business
                    </h2>
                    <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                        Tous les aspects de votre activité freelance centralisés dans une seule plateforme. Plus besoin de jongler entre 10 outils différents.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                    {services.map((service, index) => (
                        <Card 
                            key={index} 
                            className="bg-slate-800 border-slate-700 hover:border-orange-500 hover:shadow-xl transition-all duration-300"
                        >
                            <CardHeader className="text-center md:text-left">
                                <div className="flex items-center justify-center w-16 h-16 bg-orange-600/20 rounded-xl mb-4 mx-auto md:mx-0">
                                    {service.icon}
                                </div>
                                <CardTitle className="text-white">
                                    {service.title}
                                </CardTitle>
                                <CardDescription className="text-slate-300">
                                    {service.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {service.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start">
                                            <svg className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-slate-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">
                    <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-8 text-white shadow-2xl">
                        <h3 className="text-2xl font-semibold mb-4">
                            Prêt à centraliser votre activité ?
                        </h3>
                        <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                            Commencez gratuitement avec un plan limité, puis passez à Pro pour débloquer toutes les fonctionnalités.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="/signup" className="bg-white hover:bg-orange-50 text-orange-600 px-8 py-3 rounded-full font-medium transition-colors shadow-lg">
                                Commencer gratuitement
                            </a>
                            <a href="#pricing" className="border-2 border-white hover:bg-white hover:text-orange-600 text-white px-8 py-3 rounded-full font-medium transition-colors">
                                Voir les plans
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
