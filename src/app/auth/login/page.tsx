'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
      } else {
        // Rediriger vers le dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (userType: 'admin' | 'freelance' | 'client') => {
    const user = config.staticUsers.find(u => u.role === userType);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à AfriLance
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accédez à votre dashboard
          </p>
        </div>

        {/* Comptes de démonstration */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-3">
            Comptes de démonstration :
          </h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin')}
              className="w-full text-left px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
            >
              👑 <strong>Admin:</strong> admin@afrilance.com / admin123
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('freelance')}
              className="w-full text-left px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded transition-colors"
            >
              💼 <strong>Freelance:</strong> freelance@afrilance.com / freelance123
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('client')}
              className="w-full text-left px-3 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 rounded transition-colors"
            >
              🏢 <strong>Client:</strong> client@afrilance.com / client123
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Mode démonstration - Aucune base de données requise
          </p>
        </div>
      </div>
    </div>
  );
}
