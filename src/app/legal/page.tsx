"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LegalPage() {
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
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Informations sur l&apos;éditeur</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Nom de la société :</strong> AfriLance</p>
              <p><strong>Forme juridique :</strong> Société à Responsabilité Limitée (SARL)</p>
              <p><strong>Capital social :</strong> 10 000 000 FCFA</p>
              <p><strong>Siège social :</strong> Cocody Angré, Rue des Jardins, Abidjan, Côte d&apos;Ivoire</p>
              <p><strong>RCCM :</strong> CI-ABJ-2024-B-12345</p>
              <p><strong>Numéro de compte contribuable :</strong> 2024123456789</p>
              <p><strong>Numéro d&apos;identification fiscale :</strong> CI-2024-123456</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Directeur de la publication</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Nom :</strong> Baho Philomé Evrard</p>
              <p><strong>Qualité :</strong> Gérant et Fondateur</p>
              <p><strong>Email :</strong> contact@afrilance.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hébergement</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
              <p><strong>Site web :</strong> <a href="https://vercel.com" className="text-orange-600 hover:underline">vercel.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Propriété intellectuelle</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                L&apos;ensemble de ce site relève de la législation ivoirienne et internationale sur le droit d&apos;auteur 
                et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour 
                les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p>
                La reproduction de tout ou partie de ce site sur un support électronique quel qu&apos;il soit est 
                formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Données personnelles</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Conformément à la loi ivoirienne sur la protection des données personnelles (Loi n°2013-450 du 19 juin 2013) 
                et aux standards internationaux de protection des données, vous disposez d&apos;un droit d&apos;accès, de rectification, 
                de suppression et d&apos;opposition aux données personnelles vous concernant.
              </p>
              <p>
                Pour exercer ces droits, vous pouvez nous contacter à l&apos;adresse : 
                <a href="mailto:dpo@afrilance.com" className="text-orange-600 hover:underline ml-1">
                  dpo@afrilance.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Responsabilité</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour 
                à différentes périodes de l&apos;année, mais peut toutefois contenir des inexactitudes ou des omissions.
              </p>
              <p>
                Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien 
                vouloir le signaler par email, à l&apos;adresse support@afrilance.com, en décrivant le problème de 
                la manière la plus précise possible.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email :</strong> <a href="mailto:contact@afrilance.com" className="text-orange-600 hover:underline">contact@afrilance.com</a></p>
              <p><strong>Téléphone :</strong> +225 07 XX XX XX XX</p>
              <p><strong>Adresse :</strong> Cocody Angré, Rue des Jardins, Abidjan, Côte d&apos;Ivoire</p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
