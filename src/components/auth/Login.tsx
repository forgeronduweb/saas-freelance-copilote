"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Erreur de connexion');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('token', result.token);

      toast.success("Connexion réussie", {
        description: "Redirection en cours...",
      });
      router.replace('/dashboard');
      
    } catch {
      setError('Erreur de connexion au serveur');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    console.log('Google login attempt');
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleLinkedInLogin = async () => {
    setIsLoading(true);
    console.log('LinkedIn login attempt');
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <CardTitle className="text-xl">Connexion</CardTitle>
                <CardDescription className="mt-1">Entrez vos identifiants pour accéder à Tuma</CardDescription>
              </div>
              <Link href="/signup" className="text-sm font-medium hover:underline shrink-0">
                Créer un compte
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...form.register('email')}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary ${form.formState.errors.email ? 'border-destructive' : 'border-input'}`}
                  placeholder="m@example.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </label>
                  <Link href="/reset-password" className="text-sm text-muted-foreground hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  {...form.register('password')}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary ${form.formState.errors.password ? 'border-destructive' : 'border-input'}`}
                  placeholder="••••••••"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2 px-4 border border-input bg-background text-foreground font-medium rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Se connecter avec Google
              </button>

              <button
                type="button"
                onClick={handleLinkedInLogin}
                disabled={isLoading}
                className="w-full py-2 px-4 border border-input bg-background text-foreground font-medium rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.476-.9 1.637-1.85 3.37-1.85 3.602 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zM6.814 20.452H3.86V9h2.954v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
                Se connecter avec LinkedIn
              </button>
            </form>
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
