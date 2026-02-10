import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import UserSession from '@/lib/models/UserSession';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (token && config.database.enabled) {
      try {
        const decoded = jwt.verify(token, config.auth.jwtSecret) as any;
        if (decoded?.userId && decoded?.sessionId) {
          await connectDB();
          await UserSession.findOneAndUpdate(
            { userId: decoded.userId, sessionId: decoded.sessionId, revokedAt: null, expiresAt: { $gt: new Date() } },
            { $set: { revokedAt: new Date() } }
          );
        }
      } catch {
        // ignore
      }
    }

    // Créer la réponse
    const response = NextResponse.json(
      { message: 'Déconnexion réussie' },
      { status: 200 }
    );

    // Supprimer le cookie d'authentification
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immédiatement
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Méthode GET pour vérifier que l'endpoint fonctionne
export async function GET() {
  return NextResponse.json(
    { message: 'API de déconnexion disponible' },
    { status: 200 }
  );
}
