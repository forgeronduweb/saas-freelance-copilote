"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement actual reset password logic
    console.log('Reset password for:', email);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <CardTitle className="text-xl">Mot de passe oublié</CardTitle>
                <CardDescription className="mt-1">Entrez votre email pour réinitialiser</CardDescription>
              </div>
              <Link href="/login" className="text-sm font-medium hover:underline shrink-0">
                Connexion
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary border-input"
                    placeholder="m@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-emerald-600 font-medium mb-2">Email envoyé !</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
                </p>
                <p className="text-xs text-muted-foreground">
                  Vérifiez votre boîte de réception et votre dossier spam.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <p className="text-sm text-muted-foreground text-center">
              <Link href="/" className="text-primary hover:underline">
                ← Retour à l'accueil
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
