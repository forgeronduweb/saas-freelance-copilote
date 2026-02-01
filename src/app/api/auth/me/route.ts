import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    let token = request.cookies.get('auth-token')?.value;

    // Fallback: Authorization header (Bearer)
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    // Vérifier et décoder le token
    let decoded;
    try {
      decoded = jwt.verify(token, config.auth.jwtSecret) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token d\'authentification invalide' },
        { status: 401 }
      );
    }

    let user;

    if (config.database.enabled) {
      // Récupérer l'utilisateur depuis la base de données
      await connectDB();
      user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Compte désactivé' },
          { status: 403 }
        );
      }
    } else {
      // Utiliser les utilisateurs statiques
      user = config.staticUsers.find(u => u.id === decoded.userId || u.email === decoded.email);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }
    }

    // Préparer la réponse utilisateur (sans le mot de passe)
    const userResponse = {
      id: user._id || user.id,
      firstName: user.firstName || user.name?.split(' ')[0],
      lastName: user.lastName || user.name?.split(' ')[1] || '',
      email: user.email,
      userType: user.userType || user.role,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified || true,
      professions: user.professions || [],
      onboardingCompleted: user.onboardingCompleted || false,
      planType: user.planType,
      companyName: user.companyName,
      industry: user.industry,
      skills: user.skills,
      bio: user.bio,
      yearsOfExperience: user.yearsOfExperience,
      hourlyRate: user.hourlyRate,
      availability: user.availability,
      preferredDays: user.preferredDays,
      onboardingStep: user.onboardingStep,
      rating: user.rating,
      completedProjects: user.completedProjects,
      totalEarnings: user.totalEarnings,
      totalSpent: user.totalSpent,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      {
        user: userResponse,
        authenticated: true,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
