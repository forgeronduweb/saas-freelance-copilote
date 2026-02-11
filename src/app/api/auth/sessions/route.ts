import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import UserSession from '@/lib/models/UserSession';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
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
      
      // Format moderne: "Android 13; SM-S918B)" ou "Android 13; Pixel 6)"
      const androidModern = ua.match(/Android\s*[\d.]*;\s*([^;)]+)/i);
      if (androidModern?.[1]) {
        const model = androidModern[1].trim();
        // Éviter de retourner juste "K" ou des valeurs trop courtes
        if (model.length > 2 && model.toLowerCase() !== 'linux') return model;
      }
      
      // Format ancien: "Android 10; SM-G973F Build/QP1A"
      const androidLegacy = ua.match(/Android[^;]*;\s*([^;]+?)\s*Build\//i);
      if (androidLegacy?.[1]) return androidLegacy[1].trim();
      
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

    let rotatedToken: string | null = null;

    if (!decoded?.sessionId) {
      const sessionId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
      const expiresAt = getExpiresAt();

      // Révoquer les anciennes sessions du même appareil (même userAgent)
      if (userAgent) {
        await UserSession.updateMany(
          {
            userId: decoded.userId,
            userAgent,
            revokedAt: null,
          },
          { $set: { revokedAt: new Date() } }
        );
      }

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
      const deviceType = getDeviceType(userAgent);
      const deviceModel = getDeviceModel(userAgent);
      const deviceName = getDeviceName(deviceType, userAgent);

      const updateFields: Record<string, unknown> = {
        lastSeenAt: new Date(),
      };

      if (ip) updateFields.ip = ip;
      if (deviceModel) updateFields.deviceModel = deviceModel;
      if (deviceName) updateFields.deviceName = deviceName;

      const session = await UserSession.findOneAndUpdate(
        {
          userId: decoded.userId,
          sessionId: decoded.sessionId,
          revokedAt: null,
          expiresAt: { $gt: new Date() },
        },
        { $set: updateFields },
        { new: true }
      );

      if (!session) {
        return NextResponse.json({ error: 'Session révoquée ou expirée' }, { status: 401 });
      }

      // Révoquer les autres sessions du même appareil (même userAgent) pour éviter les doublons
      if (userAgent) {
        await UserSession.updateMany(
          {
            userId: decoded.userId,
            userAgent,
            sessionId: { $ne: decoded.sessionId },
            revokedAt: null,
          },
          { $set: { revokedAt: new Date() } }
        );
      }
    }

    const sessions = await UserSession.find({
      userId: decoded.userId,
      revokedAt: null,
    })
      .sort({ lastSeenAt: -1, createdAt: -1 })
      .lean();

    const now = Date.now();

    const response = NextResponse.json(
      {
        sessions: sessions.map((s: any) => ({
          sessionId: s.sessionId,
          deviceName: s.deviceName || null,
          deviceModel: s.deviceModel || null,
          userAgent: s.userAgent || null,
          ip: s.ip || null,
          deviceType: s.deviceType,
          lastSeenAt: s.lastSeenAt,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          isExpired: s.expiresAt ? new Date(s.expiresAt).getTime() <= now : false,
        })),
        currentSessionId: decoded?.sessionId || null,
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

    response.headers.set('Accept-CH', 'Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Mobile');

    return response;
  } catch (error) {
    console.error('Erreur API sessions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
