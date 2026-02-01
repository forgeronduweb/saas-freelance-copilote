import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload & {
    userData?: any;
  };
}

/**
 * Middleware pour vérifier l'authentification
 */
export async function authenticateUser(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user?: JWTPayload;
  error?: string;
}> {
  try {
    // Essayer d'abord le cookie
    let token = request.cookies.get('auth-token')?.value;
    
    // Si pas de cookie, essayer le header Authorization
    if (!token) {
      const authHeader = request.headers.get('authorization');
      token = extractTokenFromHeader(authHeader) || undefined;
    }

    if (!token) {
      return {
        isAuthenticated: false,
        error: 'Token d\'authentification manquant',
      };
    }

    // Vérifier le token
    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        isAuthenticated: false,
        error: 'Token d\'authentification invalide',
      };
    }

    return {
      isAuthenticated: true,
      user: decoded,
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      isAuthenticated: false,
      error: 'Erreur d\'authentification',
    };
  }
}

/**
 * Middleware pour vérifier l'authentification et récupérer les données utilisateur
 */
export async function authenticateAndGetUser(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const authResult = await authenticateUser(request);
    
    if (!authResult.isAuthenticated || !authResult.user) {
      return authResult;
    }

    // Connecter à la base de données et récupérer l'utilisateur
    await connectDB();
    const user = await User.findById(authResult.user.userId).select('-password');
    
    if (!user || !user.isActive) {
      return {
        isAuthenticated: false,
        error: 'Utilisateur non trouvé ou inactif',
      };
    }

    return {
      isAuthenticated: true,
      user: {
        ...authResult.user,
        userData: user,
      },
    };

  } catch (error) {
    console.error('Authentication and user fetch error:', error);
    return {
      isAuthenticated: false,
      error: 'Erreur lors de la récupération des données utilisateur',
    };
  }
}

/**
 * Middleware pour vérifier le type d'utilisateur
 */
export function requireUserType(allowedTypes: ('freelance' | 'client')[]) {
  return (user: JWTPayload): boolean => {
    return allowedTypes.includes(user.userType);
  };
}

/**
 * Créer une réponse d'erreur d'authentification
 */
export function createAuthErrorResponse(error: string, status: number = 401): NextResponse {
  return NextResponse.json(
    { error },
    { status }
  );
}

/**
 * Wrapper pour les API routes qui nécessitent une authentification
 */
export function withAuth(
  handler: (request: NextRequest, context: { user: any }) => Promise<NextResponse>,
  options?: {
    userTypes?: ('freelance' | 'client')[];
  }
) {
  return async (request: NextRequest, context: any) => {
    try {
      const authResult = await authenticateAndGetUser(request);
      
      if (!authResult.isAuthenticated) {
        return createAuthErrorResponse(authResult.error || 'Non authentifié');
      }

      // Vérifier le type d'utilisateur si spécifié
      if (options?.userTypes && !options.userTypes.includes(authResult.user!.userType)) {
        return createAuthErrorResponse('Type d\'utilisateur non autorisé', 403);
      }

      // Appeler le handler avec l'utilisateur authentifié
      return await handler(request, { ...context, user: authResult.user });

    } catch (error) {
      console.error('Auth wrapper error:', error);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }
  };
}
