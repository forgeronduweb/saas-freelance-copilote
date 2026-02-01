"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header simplifié pour contrat */}
            <header className="bg-white border-b border-gray-200 py-6">
                <div className="flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32">
                    <Link href="/" className="flex items-center gap-2 text-xl sm:text-xl md:text-2xl font-bold text-black">
                        <Image 
                            src="/logo.png" 
                            alt="Tuma Logo" 
                            width={32} 
                            height={32}
                            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                        />
                        Tuma
                    </Link>
                    <Link 
                        href="/#footer" 
                        className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
                    >
                        Retour
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white border border-gray-300 p-12">
                    {/* En-tête contractuel */}
                    <div className="text-center mb-12 pb-8 border-b border-gray-200">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            À PROPOS
                        </h1>
                        <div className="text-lg text-gray-700 space-y-2">
                            <p><strong>Tuma</strong></p>
                            <p>Plateforme de mise en relation freelances-clients</p>
                            <p className="text-sm text-gray-500 mt-4">
                                Présentation de la plateforme - Version du {new Date().toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-orange-600 mb-4">Notre Mission</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Tuma est une plateforme innovante qui met en relation les freelances africains avec des entreprises, particuliers et organisations ayant besoin de services professionnels.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-orange-600 mb-4">Notre Objectif</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Pour les freelances :</h3>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                                        <li>Offrir une visibilité accrue</li>
                                        <li>Proposer des opportunités de collaboration rémunérées et sécurisées</li>
                                        <li>Fournir un accompagnement pour développer leur activité</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Pour les clients :</h3>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                                        <li>Faciliter la recherche et l&apos;embauche de freelances qualifiés</li>
                                        <li>Proposer un système de paiement sécurisé</li>
                                        <li>Garantir la livraison des projets</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-orange-600 mb-4">Ce qui nous distingue</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Paiements adaptés</h3>
                                    <p className="text-gray-700">
                                        L&apos;intégration des paiements via Mobile Money, adaptés aux réalités locales africaines.
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Talents diversifiés</h3>
                                    <p className="text-gray-700">
                                        Une sélection de talents dans divers domaines : développement web, design, rédaction, marketing digital.
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Suivi transparent</h3>
                                    <p className="text-gray-700">
                                        Un suivi transparent et une communication fluide entre freelances et clients.
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Impact local</h3>
                                    <p className="text-gray-700">
                                        Une volonté de valoriser les compétences locales et de contribuer au développement de l&apos;économie numérique africaine.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-orange-600 mb-4">Notre Vision</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Nous croyons en un avenir où les talents africains peuvent accéder aux opportunités mondiales tout en contribuant au développement économique local. Tuma est plus qu&apos;une plateforme - c&apos;est un pont vers l&apos;autonomisation professionnelle et la croissance économique durable.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
