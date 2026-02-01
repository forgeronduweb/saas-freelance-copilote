import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { config } from '@/lib/config';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  userType: 'freelance' | 'client';
}

export type ApiHandler = (
  request: NextRequest,
  user: AuthenticatedUser
) => Promise<NextResponse>;

/**
 * Extrait et vérifie l'utilisateur authentifié depuis le token JWT
 * Retourne null si non authentifié ou token invalide
 */
export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser | null {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as AuthenticatedUser;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Wrapper pour les routes API protégées
 * Vérifie l'authentification et passe l'utilisateur au handler
 */
export function withAuth(handler: ApiHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

/**
 * Réponse d'erreur standardisée pour les APIs
 */
export function apiError(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Réponse de succès standardisée pour les APIs
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}
