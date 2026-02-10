import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import UserSession from '@/lib/models/UserSession';
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

    const userAgent = request.headers.get('user-agent') || undefined;
    const chPlatform = request.headers.get('sec-ch-ua-platform') || undefined;
    const chModel = request.headers.get('sec-ch-ua-model') || undefined;

    const normalizeCH = (value?: string) => {
      if (!value) return undefined;
      const v = value.trim();
      if (!v) return undefined;
      return v.replaceAll('"', '');
    };

    const getBrowserName = (ua?: string) => {
      if (!ua) return undefined;
      if (ua.includes('Edg/')) return 'Edge';
      if (ua.includes('Chrome/')) return 'Chrome';
      if (ua.includes('Firefox/')) return 'Firefox';
      if (ua.includes('Safari/') && ua.includes('Version/')) return 'Safari';
      return undefined;
    };

    const getDeviceModel = (ua?: string) => {
      const modelFromCH = normalizeCH(chModel);
      if (modelFromCH) return modelFromCH;
      if (!ua) return undefined;
      if (ua.includes('iPhone')) return 'iPhone';
      if (ua.includes('iPad')) return 'iPad';
      const androidMatch = ua.match(/Android[^;]*;\s*([^;]+?)\s*Build\//i);
      if (androidMatch?.[1]) return androidMatch[1].trim();
      const platform = normalizeCH(chPlatform);
      if (platform) return platform;
      return undefined;
    };

    const getDeviceName = (deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown', ua?: string) => {
      const platform = normalizeCH(chPlatform);
      const model = getDeviceModel(ua);
      if (deviceType === 'mobile' || deviceType === 'tablet') {
        return model || (deviceType === 'mobile' ? 'Mobile' : 'Tablette');
      }
      const browser = getBrowserName(ua);
      if (platform && browser) return `${browser} (${platform})`;
      if (platform) return `${platform} (Desktop)`;
      return 'Ordinateur';
    };

    const getDeviceType = (ua?: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' => {
      if (!ua) return 'unknown';
      const v = ua.toLowerCase();
      if (v.includes('ipad') || v.includes('tablet')) return 'tablet';
      if (v.includes('mobi') || v.includes('android') || v.includes('iphone')) return 'mobile';
      return 'desktop';
    };

    const getExpiresAt = (): Date => {
      const raw = String(config.auth.jwtExpiresIn || '7d');
      const match = raw.match(/^(\d+)([smhd])$/);
      if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const value = Number(match[1]);
      const unit = match[2];
      const ms =
        unit === 's' ? value * 1000 :
        unit === 'm' ? value * 60 * 1000 :
        unit === 'h' ? value * 60 * 60 * 1000 :
        value * 24 * 60 * 60 * 1000;
      return new Date(Date.now() + ms);
    };

    const sessionId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const expiresAt = getExpiresAt();

    await UserSession.create({
      userId: newUser._id,
      sessionId,
      userAgent,
      ip: clientIP,
      deviceName: getDeviceName(getDeviceType(userAgent), userAgent),
      deviceModel: getDeviceModel(userAgent),
      deviceType: getDeviceType(userAgent),
      lastSeenAt: new Date(),
      expiresAt,
    });

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
        sessionId,
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
