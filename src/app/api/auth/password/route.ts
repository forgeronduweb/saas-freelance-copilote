import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import UserSession from '@/lib/models/UserSession';
import { config } from '@/lib/config';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`auth:password:${clientIP}`, RATE_LIMITS.auth);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.auth.jwtSecret) as any;
    } catch {
      return NextResponse.json(
        { error: 'Token d\'authentification invalide' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mot de passe actuel et nouveau requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Vérifier la complexité du mot de passe
    const hasNumber = /\d/.test(newPassword);
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    if (!hasNumber || !hasLetter) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins une lettre et un chiffre' },
        { status: 400 }
      );
    }

    if (!config.database.enabled) {
      return NextResponse.json(
        { error: 'Base de données non activée' },
        { status: 503 }
      );
    }

    await connectDB();

    if (decoded?.sessionId) {
      const session = await UserSession.findOne({
        userId: decoded.userId,
        sessionId: decoded.sessionId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session révoquée ou expirée' },
          { status: 401 }
        );
      }

      session.lastSeenAt = new Date();
      await session.save();
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      );
    }

    // Hasher et sauvegarder le nouveau mot de passe
    user.password = await bcrypt.hash(newPassword, config.auth.bcryptSaltRounds);
    await user.save();

    return NextResponse.json({ message: 'Mot de passe modifié avec succès' }, { status: 200 });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
