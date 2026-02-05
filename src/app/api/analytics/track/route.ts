import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AnalyticsEvent from "@/lib/models/AnalyticsEvent";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting pour éviter le spam d'events
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`analytics:${clientIP}`, RATE_LIMITS.analytics);
    
    if (!rateLimitResult.success) {
      return jsonError("Trop de requêtes", 429);
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonError("Payload invalide", 400);
    }

    const {
      siteKey,
      event,
      path,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      visitorId,
      sessionId,
      durationMs,
    } = body as Record<string, unknown>;

    const normalizedSiteKey =
      typeof siteKey === "string" && siteKey.trim().length > 0 ? siteKey.trim() : "public";

    if (normalizedSiteKey.length > 64) {
      return jsonError("siteKey invalide", 400);
    }

    if (event !== "pageview" && event !== "duration") {
      return jsonError("event invalide", 400);
    }

    if (typeof path !== "string" || !path.startsWith("/") || path.length > 512) {
      return jsonError("path invalide", 400);
    }

    if (typeof visitorId !== "string" || visitorId.trim().length < 8 || visitorId.length > 128) {
      return jsonError("visitorId invalide", 400);
    }

    if (typeof sessionId !== "string" || sessionId.trim().length < 8 || sessionId.length > 128) {
      return jsonError("sessionId invalide", 400);
    }

    let normalizedReferrerHost: string | undefined = undefined;
    if (typeof referrerHost === "string" && referrerHost.trim().length > 0) {
      normalizedReferrerHost = referrerHost.trim().slice(0, 128);
    }

    const normalizeUtm = (value: unknown): string | undefined => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      return trimmed.slice(0, 64);
    };

    const normalizedUtmSource = normalizeUtm(utmSource);
    const normalizedUtmMedium = normalizeUtm(utmMedium);
    const normalizedUtmCampaign = normalizeUtm(utmCampaign);
    const normalizedUtmTerm = normalizeUtm(utmTerm);
    const normalizedUtmContent = normalizeUtm(utmContent);

    let normalizedDurationMs: number | undefined = undefined;
    if (event === "duration") {
      if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs < 0) {
        return jsonError("durationMs invalide", 400);
      }

      normalizedDurationMs = Math.min(durationMs, 6 * 60 * 60 * 1000);
    }

    await connectDB();

    await AnalyticsEvent.create({
      siteKey: normalizedSiteKey,
      event,
      path,
      referrerHost: normalizedReferrerHost,
      utmSource: normalizedUtmSource,
      utmMedium: normalizedUtmMedium,
      utmCampaign: normalizedUtmCampaign,
      utmTerm: normalizedUtmTerm,
      utmContent: normalizedUtmContent,
      visitorId,
      sessionId,
      durationMs: normalizedDurationMs,
    });

    return NextResponse.json(
      { ok: true },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Analytics track error:", error);
    return jsonError("Erreur interne du serveur", 500);
  }
}
