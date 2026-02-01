"use client";
import React from "react";

const HowItWorks = () => {
    const steps = [
        {
            number: "01",
            title: "Essai gratuit 14 jours",
            description: "Créez votre compte et explorez toutes les fonctionnalités. Aucune carte bancaire requise.",
            icon: (
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            )
        },
        {
            number: "02",
            title: "Configurez vos 3 piliers",
            description: "Activez l'autonomie commerciale, la rigueur administrative et l'efficacité opérationnelle selon vos besoins.",
            icon: (
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            number: "03",
            title: "Importez vos données",
            description: "Migration assistée de vos clients, projets et facturations existantes. Zéro perte de données.",
            icon: (
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            number: "04",
            title: "Développez votre activité",
            description: "Gagnez 15h/semaine, concentrez-vous sur votre cœur de métier et augmentez votre rentabilité sans commission.",
            icon: (
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            )
        }
    ];

    return (
        <section id="how-it-works" className="py-16 bg-white">
            <div className="px-4 md:px-16 lg:px-24 xl:px-32">
                <div className="text-center mb-16">
                    <p className="text-base font-medium text-yellow-500 mb-2">Démarrage</p>
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-4">
                        Votre copilote en 4 étapes simples
                    </h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                        Démarrez gratuitement et transformez votre activité freelance en pilote automatique dès aujourd'hui.
                    </p>
                </div>

                <div className="relative min-h-[280px]">
                    {/* Ligne de connexion pour desktop */}
                    <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                {/* Connecteur vertical pour mobile/tablet */}
                                {index < steps.length - 1 && (
                                    <div className="lg:hidden absolute left-1/2 top-32 w-0.5 h-16 bg-yellow-200 transform -translate-x-1/2"></div>
                                )}
                                
                                <div className="flex flex-col items-center text-center relative z-10">
                                    {/* Numéro et icône */}
                                    <div className="relative mb-6">
                                        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-lg mb-4">
                                            {step.number}
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                            {step.icon}
                                        </div>
                                    </div>
                                    
                                    {/* Contenu */}
                                    <div className="mt-4">
                                        <h3 className="text-xl font-semibold text-slate-800 mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl p-8">
                        <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                            Prêt à passer en pilote automatique ?
                        </h3>
                        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                            Rejoignez les freelances qui ont déjà récupéré 15h par semaine avec leur copilote business. Sans commission sur votre CA.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full font-medium transition-colors">
                                Commencer l'essai gratuit
                            </button>
                            <button className="border border-yellow-300 hover:bg-yellow-50 text-yellow-700 px-8 py-3 rounded-full font-medium transition-colors">
                                Planifier une démo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
