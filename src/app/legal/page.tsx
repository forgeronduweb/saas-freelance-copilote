"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mentions Légales</h1>
          <p className="text-slate-600">Informations légales concernant Tuma</p>
        </div>

        <div className="space-y-8">
          
          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Éditeur du site</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Société</p>
                <p className="text-slate-900 font-medium">Tuma SAS</p>
              </div>
              <div>
                <p className="text-slate-500">Forme juridique</p>
                <p className="text-slate-900 font-medium">Société par Actions Simplifiée</p>
              </div>
              <div>
                <p className="text-slate-500">Siège social</p>
                <p className="text-slate-900 font-medium">Abidjan, Côte d&apos;Ivoire</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <a href="mailto:contact@tuma.app" className="text-yellow-600 hover:underline font-medium">contact@tuma.app</a>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Hébergement</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Hébergeur</p>
                <p className="text-slate-900 font-medium">Vercel Inc.</p>
              </div>
              <div>
                <p className="text-slate-500">Adresse</p>
                <p className="text-slate-900 font-medium">San Francisco, CA, USA</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-500">Site web</p>
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline font-medium">vercel.com</a>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Propriété intellectuelle</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                L&apos;ensemble du contenu de ce site (textes, images, logos, icônes, logiciels) est protégé par le droit d&apos;auteur et la propriété intellectuelle, conformément à la législation ivoirienne et internationale.
              </p>
              <p>
                Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie du contenu est strictement interdite sans accord préalable écrit.
              </p>
            </div>
          </section>

          <section className="bg-slate-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Données personnelles</h2>
            <div className="space-y-3 text-slate-600 text-sm">
              <p>
                Conformément à la loi ivoirienne n°2013-450 du 19 juin 2013 sur la protection des données personnelles, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition concernant vos données.
              </p>
              <p>
                Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@tuma.app" className="text-yellow-600 hover:underline">contact@tuma.app</a>
              </p>
              <p>
                Pour plus d&apos;informations, consultez notre <Link href="/privacy" className="text-yellow-600 hover:underline">politique de confidentialité</Link>.
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
