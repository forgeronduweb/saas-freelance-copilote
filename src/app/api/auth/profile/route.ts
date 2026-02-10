import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import UserSession from '@/lib/models/UserSession';
import { config } from '@/lib/config';

export async function PUT(request: NextRequest) {
  try {
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
    const { firstName, lastName, email, phone, companyName } = body;

    // Validation de la longueur des champs
    if (firstName && (typeof firstName !== 'string' || firstName.length > 100)) {
      return NextResponse.json({ error: 'Prénom invalide (max 100 caractères)' }, { status: 400 });
    }
    if (lastName && (typeof lastName !== 'string' || lastName.length > 100)) {
      return NextResponse.json({ error: 'Nom invalide (max 100 caractères)' }, { status: 400 });
    }
    if (companyName && (typeof companyName !== 'string' || companyName.length > 200)) {
      return NextResponse.json({ error: 'Nom d\'entreprise invalide (max 200 caractères)' }, { status: 400 });
    }
    if (phone && (typeof phone !== 'string' || phone.length > 20)) {
      return NextResponse.json({ error: 'Téléphone invalide (max 20 caractères)' }, { status: 400 });
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

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: decoded.userId } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour les champs
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (companyName !== undefined) user.companyName = companyName;

    await user.save();

    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      professions: user.professions,
      onboardingCompleted: user.onboardingCompleted,
      planType: user.planType,
      companyName: user.companyName,
      skills: user.skills,
      bio: user.bio,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ user: userResponse, message: 'Profil mis à jour' }, { status: 200 });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
