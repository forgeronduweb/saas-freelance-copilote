import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import UserSession from '@/lib/models/UserSession';
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
    let rotatedToken: string | null = null;

    if (config.database.enabled) {
      // Récupérer l'utilisateur depuis la base de données
      await connectDB();

      const userAgent = request.headers.get('user-agent') || undefined;
      const chPlatform = request.headers.get('sec-ch-ua-platform') || undefined;
      const chModel = request.headers.get('sec-ch-ua-model') || undefined;
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || undefined;

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

      const getDeviceType = (ua?: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' => {
        if (!ua) return 'unknown';
        const v = ua.toLowerCase();
        if (v.includes('ipad') || v.includes('tablet')) return 'tablet';
        if (v.includes('mobi') || v.includes('android') || v.includes('iphone')) return 'mobile';
        return 'desktop';
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

      if (!decoded?.sessionId) {
        const sessionId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
        const expiresAt = getExpiresAt();

        await UserSession.create({
          userId: decoded.userId,
          sessionId,
          userAgent,
          ip,
          deviceName: getDeviceName(getDeviceType(userAgent), userAgent),
          deviceModel: getDeviceModel(userAgent),
          deviceType: getDeviceType(userAgent),
          lastSeenAt: new Date(),
          expiresAt,
        });

        rotatedToken = jwt.sign(
          {
            userId: decoded.userId,
            email: decoded.email,
            userType: decoded.userType,
            sessionId,
          },
          config.auth.jwtSecret,
          { expiresIn: config.auth.jwtExpiresIn } as any
        );

        decoded.sessionId = sessionId;
      }

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
      // Mode sans base de données non supporté pour des raisons de sécurité
      return NextResponse.json(
        { error: 'Base de données non disponible' },
        { status: 503 }
      );
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

    const response = NextResponse.json(
      {
        user: userResponse,
        authenticated: true,
      },
      { status: 200 }
    );

    if (rotatedToken) {
      response.cookies.set('auth-token', rotatedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
