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
    const rateLimitResult = checkRateLimit(`auth:register:${clientIP}`, RATE_LIMITS.auth);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          }
        }
      );
    }

    // Vérifier si la base de données est activée
    if (!config.database.enabled) {
      return NextResponse.json(
        { error: 'L\'inscription nécessite MongoDB. Démarrez MongoDB et activez USE_DATABASE=true dans .env.local' },
        { status: 503 }
      );
    }

    // Se connecter à la base de données
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Erreur connexion MongoDB:', dbError);
      return NextResponse.json(
        { error: 'Impossible de se connecter à la base de données. Vérifiez que MongoDB est démarré.' },
        { status: 503 }
      );
    }

    // Récupérer les données du formulaire
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      userType,
      phone,
      companyName,
      industry,
      skills,
      bio
    } = body;

    // Validation des champs requis (email et password uniquement)
    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'Email et mot de passe sont requis',
        },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Validation du mot de passe (règles renforcées)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Vérifier la complexité du mot de passe
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasNumber || !hasLetter) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins une lettre et un chiffre' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    // Note: Message générique pour éviter l'énumération des emails
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // Délai constant pour éviter les timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return NextResponse.json(
        { error: 'Impossible de créer le compte. Vérifiez vos informations.' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, config.auth.bcryptSaltRounds);

    // Préparer les données utilisateur (freelance par défaut)
    const userData: any = {
      firstName: firstName?.trim() || email.split('@')[0],
      lastName: lastName?.trim() || 'Freelance',
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      userType: 'freelance',
      phone: phone?.trim() || null,
      isEmailVerified: false,
      isActive: true,
      professions: [],
      onboardingCompleted: false,
      skills: skills && Array.isArray(skills) ? skills.map((s: string) => s.trim()).filter((s: string) => s) : [],
      bio: bio?.trim() || null,
      rating: 0,
      totalEarnings: 0,
      completedProjects: 0,
      planType: 'gratuit',
    };

    // Créer l'utilisateur
    const newUser = new User(userData);
    await newUser.save();

    // Retourner la réponse de succès (sans le mot de passe)
    const userResponse = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      userType: newUser.userType,
      phone: newUser.phone,
      isEmailVerified: newUser.isEmailVerified,
      professions: newUser.professions || [],
      onboardingCompleted: newUser.onboardingCompleted || false,
      createdAt: newUser.createdAt,
    };

    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        userType: newUser.userType,
      },
      config.auth.jwtSecret as Secret,
      { expiresIn: config.auth.jwtExpiresIn as SignOptions['expiresIn'] }
    );

    const response = NextResponse.json(
      {
        message: 'Compte créé avec succès',
        user: userResponse,
        token,
      },
      { status: 201 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);

    // Gestion des erreurs de validation Mongoose
    if (error?.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          error: 'Erreur de validation',
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // Gestion des erreurs de duplication (email déjà existant)
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'Un compte avec cette adresse email existe déjà' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Méthode GET pour vérifier que l'endpoint fonctionne
export async function GET() {
  return NextResponse.json(
    { message: 'API d\'inscription disponible' },
    { status: 200 }
  );
}
