"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

export default function FreelanceSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    skills: '',
    experience: '',
    portfolio: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    
    // Validation côté client
    const clientErrors: string[] = [];
    
    if (!formData.firstName.trim()) clientErrors.push('Le prénom est requis');
    if (!formData.lastName.trim()) clientErrors.push('Le nom est requis');
    if (!formData.email.trim()) clientErrors.push('L\'email est requis');
    if (!formData.password) clientErrors.push('Le mot de passe est requis');
    if (formData.password !== formData.confirmPassword) {
      clientErrors.push('Les mots de passe ne correspondent pas');
    }
    
    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Préparer les données pour l'API
      const signupData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        userType: 'freelance',
        phone: formData.phone.trim() || null,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        bio: formData.experience.trim() || null,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        // Sauvegarder le user et token dans localStorage pour que useAuth le trouve
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        toast.success("Compte créé avec succès", {
          description: "Redirection en cours...",
        });
        router.replace('/onboarding/professions');
      } else {
        if (data.details && Array.isArray(data.details)) {
          setErrors(data.details);
        } else {
          setErrors([data.error || 'Une erreur est survenue']);
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors(['Erreur de connexion. Veuillez réessayer.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header simplifié */}
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-medium text-black">
              <Image 
                src="/logo.png" 
                alt="Tuma Logo" 
                width={32} 
                height={32}
                className="w-8 h-8"
              />
              Tuma
            </Link>
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-yellow-500 transition-colors font-medium"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h1 className="text-3xl font-normal text-gray-900 mb-2">Créer un compte Freelance</h1>
            <p className="text-gray-600">Rejoignez la communauté des freelances africains</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-base"
                placeholder="+225 XX XX XX XX"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Compétences principales *
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-base"
                placeholder="Ex: Développement web, Design graphique, Rédaction..."
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d&apos;expérience *
              </label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-base"
              >
                <option value="">Sélectionnez votre niveau</option>
                <option value="debutant">Débutant (0-1 an)</option>
                <option value="intermediaire">Intermédiaire (1-3 ans)</option>
                <option value="confirme">Confirmé (3-5 ans)</option>
                <option value="expert">Expert (5+ ans)</option>
              </select>
            </div>

            <div>
              <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
                Lien portfolio (optionnel)
              </label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                className="w-full px-4 py-3 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-base sm:text-base"
                placeholder="https://monportfolio.com"
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                J&apos;accepte les{' '}
                <Link href="/terms" className="text-yellow-500 hover:text-yellow-400">
                  conditions d&apos;utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-yellow-500 hover:text-yellow-400">
                  politique de confidentialité
                </Link>
              </label>
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
                      Erreur{errors.length > 1 ? 's' : ''} de validation
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                'Créer mon compte Freelance'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
