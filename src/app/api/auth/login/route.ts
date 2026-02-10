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

      const sessionId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
      const expiresAt = getExpiresAt();

      await UserSession.create({
        userId: user._id,
        sessionId,
        userAgent,
        ip: clientIP,
        deviceName: getDeviceName(getDeviceType(userAgent), userAgent),
        deviceModel: getDeviceModel(userAgent),
        deviceType: getDeviceType(userAgent),
        lastSeenAt: new Date(),
        expiresAt,
      });

      // Créer le token JWT
      const token = jwt.sign(
        {
          userId: user._id || user.id,
          email: user.email,
          userType: user.userType || user.role,
          sessionId,
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

    } else {
      // Mode sans base de données - retourner une erreur
      // Les utilisateurs statiques ne sont plus supportés pour des raisons de sécurité
      return NextResponse.json(
        { error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

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
