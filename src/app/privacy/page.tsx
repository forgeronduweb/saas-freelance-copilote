"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header simplifié pour contrat */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32">
          <Link href="/" className="flex items-center gap-2 text-xl sm:text-xl md:text-2xl font-bold text-black">
            <Image 
              src="/logo.png" 
              alt="AfriLance Logo" 
              width={32} 
              height={32}
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
            />
            afrilance
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
          <p className="text-gray-600 mt-2">Dernière mise à jour : 7 septembre 2025</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                AfriLance s&apos;engage à protéger la confidentialité et la sécurité des données personnelles 
                de ses utilisateurs. Cette politique explique comment nous collectons, utilisons, stockons 
                et protégeons vos données personnelles.
              </p>
              <p>
                Cette politique de confidentialité décrit comment AfriLance collecte, utilise et protège 
                vos données personnelles lors de l&apos;utilisation de notre plateforme de freelancing. 
                Nous nous engageons à respecter votre vie privée et à protéger vos informations 
                conformément à la loi ivoirienne sur la protection des données personnelles 
                (Loi n°2013-450 du 19 juin 2013) et aux standards internationaux de protection des données.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Responsable de la Protection des Données :</strong> Baho Philomé Evrard</p>
              <p><strong>Email :</strong> <a href="mailto:dpo@afrilance.com" className="text-orange-600 hover:underline">dpo@afrilance.com</a></p>
              <p><strong>Adresse :</strong> Cocody Angré, Rue des Jardins, Abidjan, Côte d&apos;Ivoire</p>
              <p><strong>Téléphone :</strong> +225 07 XX XX XX XX</p>
              
              <p className="mt-4">
                <strong>Autorité de contrôle :</strong> Vous avez également le droit de déposer une plainte 
                auprès de l&apos;Autorité de Régulation des Télécommunications de Côte d&apos;Ivoire (ARTCI) 
                ou de toute autorité compétente en matière de protection des données.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
