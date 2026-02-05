"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getReferrerHost(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    const url = new URL(document.referrer);
    if (!url.host) return undefined;
    if (url.host === window.location.host) return undefined;
    return url.host;
  } catch {
    return undefined;
  }
}

function sanitizeUtmValue(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 64);
}

function getUtmParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = sanitizeUtmValue(params.get("utm_source"));
    const utmMedium = sanitizeUtmValue(params.get("utm_medium"));
    const utmCampaign = sanitizeUtmValue(params.get("utm_campaign"));
    const utmTerm = sanitizeUtmValue(params.get("utm_term"));
    const utmContent = sanitizeUtmValue(params.get("utm_content"));

    return { utmSource, utmMedium, utmCampaign, utmTerm, utmContent };
  } catch {
    return {
      utmSource: undefined,
      utmMedium: undefined,
      utmCampaign: undefined,
      utmTerm: undefined,
      utmContent: undefined,
    };
  }
}

function sendEvent(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      (navigator as Navigator).sendBeacon("/api/analytics/track", blob);
      return;
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // ignore
  }
}

function isExcludedPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const startRef = useRef<number | null>(null);
  const currentPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || isExcludedPath(pathname)) {
      currentPathRef.current = null;
      startRef.current = null;
      return;
    }

    const visitorStorageKey = "analyticsVisitorId";
    const sessionStorageKey = "analyticsSession";
    const attributionStorageKey = "analyticsAttribution";

    let visitorId = localStorage.getItem(visitorStorageKey);
    if (!visitorId) {
      visitorId = randomId();
      localStorage.setItem(visitorStorageKey, visitorId);
    }

    const now = Date.now();
    const rawSession = sessionStorage.getItem(sessionStorageKey);
    let sessionId: string;
    let lastActivity = now;

    try {
      const parsed = rawSession ? (JSON.parse(rawSession) as { id?: string; lastActivity?: number }) : null;
      const parsedId = parsed?.id;
      const parsedLast = typeof parsed?.lastActivity === "number" ? parsed.lastActivity : now;
      const isExpired = now - parsedLast > 30 * 60 * 1000;

      if (parsedId && !isExpired) {
        sessionId = parsedId;
        lastActivity = now;
      } else {
        sessionId = randomId();
        lastActivity = now;
      }
    } catch {
      sessionId = randomId();
      lastActivity = now;
    }

    sessionStorage.setItem(sessionStorageKey, JSON.stringify({ id: sessionId, lastActivity }));

    const rawAttribution = sessionStorage.getItem(attributionStorageKey);
    let attribution: {
      referrerHost?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      utmTerm?: string;
      utmContent?: string;
    } = {};

    try {
      attribution = rawAttribution ? (JSON.parse(rawAttribution) as typeof attribution) : {};
    } catch {
      attribution = {};
    }

    const hasAnyUtm =
      Boolean(attribution.utmSource) ||
      Boolean(attribution.utmMedium) ||
      Boolean(attribution.utmCampaign) ||
      Boolean(attribution.utmTerm) ||
      Boolean(attribution.utmContent);

    if (!attribution.referrerHost) {
      attribution.referrerHost = getReferrerHost();
    }

    if (!hasAnyUtm) {
      const utm = getUtmParams();
      attribution = { ...attribution, ...utm };
    }

    sessionStorage.setItem(attributionStorageKey, JSON.stringify(attribution));

    const prevPath = currentPathRef.current;
    const prevStart = startRef.current;

    if (prevPath && prevStart) {
      const durationMs = Math.max(0, now - prevStart);
      if (durationMs >= 1000) {
        sendEvent({
          siteKey: "public",
          event: "duration",
          path: prevPath,
          referrerHost: attribution.referrerHost,
          utmSource: attribution.utmSource,
          utmMedium: attribution.utmMedium,
          utmCampaign: attribution.utmCampaign,
          utmTerm: attribution.utmTerm,
          utmContent: attribution.utmContent,
          visitorId,
          sessionId,
          durationMs,
        });
      }
    }

    currentPathRef.current = pathname;
    startRef.current = now;

    sendEvent({
      siteKey: "public",
      event: "pageview",
      path: pathname,
      referrerHost: attribution.referrerHost,
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      utmTerm: attribution.utmTerm,
      utmContent: attribution.utmContent,
      visitorId,
      sessionId,
    });
  }, [pathname]);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState !== "hidden") return;
      const pathnameNow = currentPathRef.current;
      const start = startRef.current;
      if (!pathnameNow || !start) return;
      if (isExcludedPath(pathnameNow)) return;

      const visitorId = localStorage.getItem("analyticsVisitorId");
      const rawSession = sessionStorage.getItem("analyticsSession");
      const rawAttribution = sessionStorage.getItem("analyticsAttribution");
      let sessionId = "";
      let attribution: {
        referrerHost?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        utmTerm?: string;
        utmContent?: string;
      } = {};
      try {
        const parsed = rawSession ? (JSON.parse(rawSession) as { id?: string }) : null;
        sessionId = parsed?.id || "";
      } catch {
        sessionId = "";
      }

      try {
        attribution = rawAttribution ? (JSON.parse(rawAttribution) as typeof attribution) : {};
      } catch {
        attribution = {};
      }

      if (!visitorId || !sessionId) return;

      const durationMs = Math.max(0, Date.now() - start);
      if (durationMs < 1000) return;

      sendEvent({
        siteKey: "public",
        event: "duration",
        path: pathnameNow,
        referrerHost: attribution.referrerHost,
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        utmTerm: attribution.utmTerm,
        utmContent: attribution.utmContent,
        visitorId,
        sessionId,
        durationMs,
      });
    };

    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);

  return null;
}
