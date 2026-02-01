"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RefundPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Politique de Remboursement</h1>
          <p className="text-slate-600">Dernière mise à jour : Janvier 2026</p>
        </div>

        <div className="space-y-8">
          
          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Garantie satisfait ou remboursé</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                Tuma propose une <strong className="text-slate-900">garantie de 14 jours</strong> sur tous les abonnements. Si vous n&apos;êtes pas satisfait, vous pouvez demander un remboursement intégral sans justification.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 font-medium">Essai gratuit de 14 jours inclus</p>
                <p className="text-yellow-600 text-xs mt-1">Testez toutes les fonctionnalités avant de vous engager</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Conditions de remboursement</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-green-600">✓</span>
                <div>
                  <p className="text-slate-900 font-medium">Remboursement intégral</p>
                  <p className="text-slate-600">Dans les 14 premiers jours suivant le premier paiement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600">✓</span>
                <div>
                  <p className="text-slate-900 font-medium">Problème technique majeur</p>
                  <p className="text-slate-600">Si la plateforme est inaccessible pendant plus de 48h consécutives</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600">✓</span>
                <div>
                  <p className="text-slate-900 font-medium">Double facturation</p>
                  <p className="text-slate-600">En cas d&apos;erreur de notre part</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Cas non éligibles</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-red-500">✕</span>
                <p className="text-slate-600">Demande après les 14 jours de garantie</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500">✕</span>
                <p className="text-slate-600">Changement d&apos;avis sans rapport avec le service</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500">✕</span>
                <p className="text-slate-600">Violation des conditions d&apos;utilisation</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Délais de traitement</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
                <p className="text-2xl font-bold text-slate-900 mb-1">24h</p>
                <p className="text-slate-500 text-xs">Réponse à votre demande</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
                <p className="text-2xl font-bold text-slate-900 mb-1">3-5 jours</p>
                <p className="text-slate-500 text-xs">Traitement du remboursement</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
                <p className="text-2xl font-bold text-slate-900 mb-1">5-10 jours</p>
                <p className="text-slate-500 text-xs">Crédit sur votre compte</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Méthodes de remboursement</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>Le remboursement est effectué sur le même moyen de paiement utilisé lors de l&apos;achat :</p>
              <ul className="space-y-1">
                <li>• Carte bancaire : retour sur la carte utilisée</li>
                <li>• Mobile Money : retour sur le numéro utilisé</li>
                <li>• Virement : retour sur le compte d&apos;origine</li>
              </ul>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Demander un remboursement</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>Pour demander un remboursement, contactez-nous avec :</p>
              <ul className="space-y-1">
                <li>• Votre email de compte</li>
                <li>• La date de votre abonnement</li>
                <li>• Le motif de votre demande</li>
              </ul>
              <div className="pt-2">
                <a href="mailto:contact@tuma.app" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-4 py-2 rounded-lg transition-colors">
                  contact@tuma.app
                </a>
              </div>
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
