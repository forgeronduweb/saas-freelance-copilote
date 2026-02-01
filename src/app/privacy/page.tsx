"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Politique de Confidentialité</h1>
          <p className="text-slate-600">Dernière mise à jour : Janvier 2026</p>
        </div>

        <div className="space-y-8">
          
          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Notre engagement</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                Tuma s&apos;engage à protéger vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations conformément à la loi ivoirienne n°2013-450 du 19 juin 2013.
              </p>
              <p className="text-yellow-600 font-medium">
                Nous ne vendons jamais vos données à des tiers.
              </p>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Données collectées</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-900 font-medium mb-1">Informations de compte</p>
                <ul className="text-slate-600 space-y-1">
                  <li>• Nom et prénom</li>
                  <li>• Adresse email</li>
                  <li>• Numéro de téléphone</li>
                  <li>• Photo de profil (optionnel)</li>
                </ul>
              </div>
              <div>
                <p className="text-slate-900 font-medium mb-1">Données d&apos;activité</p>
                <ul className="text-slate-600 space-y-1">
                  <li>• Projets et tâches</li>
                  <li>• Factures et devis</li>
                  <li>• Temps de travail</li>
                  <li>• Contacts clients</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Utilisation des données</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>Vos données sont utilisées uniquement pour :</p>
              <ul className="space-y-1">
                <li>• Fournir et améliorer nos services</li>
                <li>• Personnaliser votre expérience</li>
                <li>• Vous envoyer des notifications importantes</li>
                <li>• Assurer la sécurité de votre compte</li>
              </ul>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Sécurité</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                <p className="text-slate-900 font-medium">Chiffrement</p>
                <p className="text-slate-500 text-xs">SSL/TLS 256-bit</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                <p className="text-slate-900 font-medium">Hébergement</p>
                <p className="text-slate-500 text-xs">Serveurs sécurisés</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                <p className="text-slate-900 font-medium">Sauvegardes</p>
                <p className="text-slate-500 text-xs">Quotidiennes</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Vos droits</h2>
            <div className="space-y-3 text-sm">
              <p className="text-slate-600">Conformément à la loi, vous disposez des droits suivants :</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-slate-900 font-medium">Accès</p>
                  <p className="text-slate-500 text-xs">Consulter vos données</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-slate-900 font-medium">Rectification</p>
                  <p className="text-slate-500 text-xs">Corriger vos informations</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-slate-900 font-medium">Suppression</p>
                  <p className="text-slate-500 text-xs">Effacer vos données</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-slate-900 font-medium">Portabilité</p>
                  <p className="text-slate-500 text-xs">Exporter vos données</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Contact</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                Pour exercer vos droits ou pour toute question : <a href="mailto:contact@tuma.app" className="text-yellow-600 hover:underline">contact@tuma.app</a>
              </p>
              <p>
                <strong className="text-slate-900">Autorité de contrôle :</strong> ARTCI (Autorité de Régulation des Télécommunications de Côte d&apos;Ivoire)
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
