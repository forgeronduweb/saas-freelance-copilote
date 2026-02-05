import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { config } from '@/lib/config';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`auth:login:${clientIP}`, RATE_LIMITS.auth);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    // Tenter de se connecter à MongoDB si activé
    let useDatabase = config.database.enabled;
    if (useDatabase) {
      try {
        await connectDB();
      } catch (dbError) {
        console.warn('⚠️ MongoDB non disponible, utilisation des utilisateurs statiques');
        useDatabase = false;
      }
    }

    // Récupérer les données du formulaire
    const body = await request.json();
    const { email, password } = body;

    // Validation des champs requis
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      );
    }

    let user;

    if (useDatabase) {
      // Authentification avec base de données
      user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }

      // Vérifier si le compte est actif
      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Votre compte a été désactivé' },
          { status: 403 }
        );
      }

      // Mettre à jour la dernière connexion
      user.lastLoginAt = new Date();
      await user.save();

    } else {
      // Mode sans base de données - retourner une erreur
      // Les utilisateurs statiques ne sont plus supportés pour des raisons de sécurité
      return NextResponse.json(
        { error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    // Créer le token JWT
    const token = jwt.sign(
      {
        userId: user._id || user.id,
        email: user.email,
        userType: user.userType || user.role,
      },
      config.auth.jwtSecret as Secret,
      { expiresIn: config.auth.jwtExpiresIn as SignOptions['expiresIn'] }
    );

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
      rating: user.rating,
      completedProjects: user.completedProjects,
    };

    // Créer la réponse avec le cookie
    const response = NextResponse.json(
      {
        message: 'Connexion réussie',
        user: userResponse,
        token,
      },
      { status: 200 }
    );

    // Définir le cookie JWT
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Méthode GET pour vérifier que l'endpoint fonctionne
export async function GET() {
  return NextResponse.json(
    { message: 'API de connexion disponible' },
    { status: 200 }
  );
}
