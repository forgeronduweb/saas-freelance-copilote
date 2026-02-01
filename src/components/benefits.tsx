"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Benefits = () => {
    const benefits = [
        {
            icon: (
                <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: "Autonomie Commerciale",
            description: "CRM simplifié, pipeline commercial, agrégateur d'opportunités et templates. Trouvez des clients sans dépendre des marketplaces."
        },
        {
            icon: (
                <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: "Rigueur Administrative",
            description: "Facturation intelligente, calcul impôts/charges en temps réel, documents légaux. Sécurisez votre situation financière et légale."
        },
        {
            icon: (
                <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            title: "Efficacité Opérationnelle",
            description: "Agenda intelligent, time tracking, gestion projets et organisation journées. Optimisez votre productivité et rentabilité."
        }
    ];

    return (
        <section id="benefits" className="pt-0 pb-16 bg-slate-50 -mt-8">
            <div className="px-4 md:px-16 lg:px-24 xl:px-32">
                <div className="text-center mb-12 pt-8">
                    <p className="text-base font-medium text-yellow-600 mb-2">Les 3 piliers</p>
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-4">
                        Votre copilote pour une activité en pilote automatique
                    </h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                        Réduisez votre charge mentale avec notre approche en 3 domaines : autonomie commerciale, rigueur administrative et efficacité opérationnelle.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <Card 
                            key={index} 
                            className="hover:shadow-lg transition-shadow duration-300 hover:border-text-yellow-500"
                        >
                            <CardHeader className="flex flex-col items-center text-center pb-2">
                                <div className="mb-4 p-3 bg-yellow-400 rounded-full">
                                    {benefit.icon}
                                </div>
                                <CardTitle className="text-slate-800 mb-2">
                                    {benefit.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <CardDescription className="text-slate-600 leading-relaxed text-sm">
                                    {benefit.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Benefits;