import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import UserSession from '@/lib/models/UserSession';
import { config } from '@/lib/config';

export async function DELETE(request: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, config.auth.jwtSecret);
    } catch {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    if (!config.database.enabled) {
      return NextResponse.json({ error: 'Base de données non disponible' }, { status: 503 });
    }

    await connectDB();

    if (decoded?.sessionId) {
      const currentSession = await UserSession.findOne({
        userId: decoded.userId,
        sessionId: decoded.sessionId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      });

      if (!currentSession) {
        return NextResponse.json({ error: 'Session révoquée ou expirée' }, { status: 401 });
      }
    }

    const { sessionId } = await context.params;

    const target = await UserSession.findOne({
      userId: decoded.userId,
      sessionId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!target) {
      return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    }

    target.revokedAt = new Date();
    await target.save();

    const response = NextResponse.json({ message: 'Session révoquée' }, { status: 200 });

    if (decoded?.sessionId && sessionId === decoded.sessionId) {
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Erreur révocation session:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
