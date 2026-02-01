import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * Configuration centralisée des cookies pour AfriLance
 */
export const cookieConfig = {
  auth: {
    name: 'auth-token',
    options: {
      httpOnly: true,
      secure: config.app.environment === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 jours en secondes
      path: '/',
    },
  },
  session: {
    name: 'session-id',
    options: {
      httpOnly: true,
      secure: config.app.environment === 'production',
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60, // 24 heures
      path: '/',
    },
  },
  preferences: {
    name: 'user-preferences',
    options: {
      httpOnly: false, // Accessible côté client pour les préférences UI
      secure: config.app.environment === 'production',
      sameSite: 'strict' as const,
      maxAge: 30 * 24 * 60 * 60, // 30 jours
      path: '/',
    },
  },
} as const;

/**
 * Définit le cookie d'authentification
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(
    cookieConfig.auth.name,
    token,
    cookieConfig.auth.options
  );
}

/**
 * Supprime le cookie d'authentification
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(
    cookieConfig.auth.name,
    '',
    {
      ...cookieConfig.auth.options,
      maxAge: 0, // Expire immédiatement
    }
  );
}

/**
 * Définit le cookie de session
 */
export function setSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set(
    cookieConfig.session.name,
    sessionId,
    cookieConfig.session.options
  );
}

/**
 * Supprime le cookie de session
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(
    cookieConfig.session.name,
    '',
    {
      ...cookieConfig.session.options,
      maxAge: 0,
    }
  );
}

/**
 * Définit les préférences utilisateur
 */
export function setPreferencesCookie(
  response: NextResponse, 
  preferences: Record<string, any>
): void {
  response.cookies.set(
    cookieConfig.preferences.name,
    JSON.stringify(preferences),
    cookieConfig.preferences.options
  );
}

/**
 * Supprime tous les cookies d'authentification et de session
 */
export function clearAllAuthCookies(response: NextResponse): void {
  clearAuthCookie(response);
  clearSessionCookie(response);
}

/**
 * Valide la sécurité des cookies selon l'environnement
 */
export function validateCookieSecurity(): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  if (config.app.environment === 'production') {
    if (!cookieConfig.auth.options.secure) {
      warnings.push('Les cookies d\'authentification devraient être sécurisés en production');
    }
    
    if (!cookieConfig.session.options.secure) {
      warnings.push('Les cookies de session devraient être sécurisés en production');
    }
  }
  
  if (cookieConfig.auth.options.maxAge < 60 * 60) {
    warnings.push('La durée de vie du cookie d\'authentification est très courte');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
