"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Tuma
          </Link>
          <Link 
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-yellow-600 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Conditions Générales d&apos;Utilisation</h1>
          <p className="text-slate-600">Dernière mise à jour : Janvier 2026</p>
        </div>

        <div className="space-y-8">
          
          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">1. Objet</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                Tuma est une plateforme SaaS de gestion d&apos;activité pour freelances. Elle fournit des outils de CRM, facturation, suivi de projets et gestion administrative.
              </p>
              <p>
                L&apos;utilisation de la plateforme implique l&apos;acceptation des présentes CGU.
              </p>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">2. Services proposés</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-900 font-medium mb-1">Gestion commerciale</p>
                <ul className="text-slate-600 space-y-1">
                  <li>• CRM et gestion de contacts</li>
                  <li>• Pipeline de vente</li>
                  <li>• Devis et propositions</li>
                </ul>
              </div>
              <div>
                <p className="text-slate-900 font-medium mb-1">Administration</p>
                <ul className="text-slate-600 space-y-1">
                  <li>• Facturation automatisée</li>
                  <li>• Suivi des paiements</li>
                  <li>• Gestion des documents</li>
                </ul>
              </div>
              <div>
                <p className="text-slate-900 font-medium mb-1">Productivité</p>
                <ul className="text-slate-600 space-y-1">
                  <li>• Suivi du temps</li>
                  <li>• Gestion de projets</li>
                  <li>• Tableau de bord</li>
                </ul>
              </div>
              <div>
                <p className="text-slate-900 font-medium mb-1">Analyses</p>
                <ul className="text-slate-600 space-y-1">
                  <li>• Rapports financiers</li>
                  <li>• Statistiques d&apos;activité</li>
                  <li>• Prévisionnel</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">3. Tarification</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                Tuma fonctionne sur un modèle d&apos;abonnement mensuel ou annuel. <strong className="text-slate-900">Aucune commission n&apos;est prélevée</strong> sur vos revenus ou transactions avec vos clients.
              </p>
              <p>
                Vous conservez 100% de votre chiffre d&apos;affaires. Les détails des plans tarifaires sont disponibles sur notre page de tarification.
              </p>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Obligations et responsabilités</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-900 font-medium mb-2">Vos engagements :</p>
                <ul className="text-slate-600 space-y-1">
                  <li>• Fournir des informations exactes lors de l&apos;inscription</li>
                  <li>• Maintenir la confidentialité de vos identifiants</li>
                  <li>• Respecter la législation en vigueur</li>
                  <li>• Ne pas utiliser la plateforme à des fins illégales</li>
                </ul>
              </div>
              <div>
                <p className="text-slate-900 font-medium mb-2">Nos engagements :</p>
                <ul className="text-slate-600 space-y-1">
                  <li>• Assurer la disponibilité et la sécurité de la plateforme</li>
                  <li>• Protéger vos données personnelles</li>
                  <li>• Fournir un support client réactif</li>
                  <li>• Ne jamais revendre vos données</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">5. Droit applicable</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                Les présentes CGU sont régies par le droit ivoirien. Tout litige sera soumis à la juridiction des tribunaux d&apos;Abidjan, Côte d&apos;Ivoire.
              </p>
              <p>
                Pour toute question : <a href="mailto:contact@tuma.app" className="text-yellow-600 hover:underline">contact@tuma.app</a>
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Tuma. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
