"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function NextAuthLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const { login, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    
    // Validation côté client
    const clientErrors: string[] = [];
    
    if (!formData.email.trim()) clientErrors.push('L\'email est requis');
    if (!formData.password) clientErrors.push('Le mot de passe est requis');
    
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (!result.success && result.error) {
      setErrors([result.error]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header simplifié */}
      <header className="bg-white border-b border-gray-200 py-4 md:py-6">
        <div className="flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32">
          <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-medium text-black">
            <Image 
              src="/logo.png" 
              alt="Tuma Logo" 
              width={32} 
              height={32}
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8"
            />
            Tuma
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/signup/client" 
              className="bg-gray-700 hover:bg-gray-800 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Compte </span>Client
            </Link>
            <Link 
              href="/signup/freelance" 
              className="bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Compte </span>Freelance
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto px-6 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-normal text-gray-900 mb-1">Connexion</h1>
            <p className="text-gray-600 text-sm">Accédez à votre compte Tuma</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-base"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <Link href="/reset-password" className="text-sm font-medium text-orange-600 hover:text-orange-500 text-center sm:text-right">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Messages d'erreur */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur de connexion
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              En vous connectant, vous acceptez nos{' '}
              <Link href="/terms" className="font-medium text-orange-600 hover:text-orange-500">
                Conditions d&apos;utilisation
              </Link>
              {' '}et notre{' '}
              <Link href="/privacy" className="font-medium text-orange-600 hover:text-orange-500">
                Politique de confidentialité
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
