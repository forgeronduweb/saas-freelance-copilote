"use client";

import { useEffect, useRef } from "react";

const PING_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes (avant les 5-10 min de timeout typiques)

export function KeepAlive() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Ne pas activer en développement
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const ping = async () => {
      try {
        await fetch("/api/health", { method: "GET", cache: "no-store" });
      } catch {
        // Silencieux en cas d'erreur
      }
    };

    // Ping initial
    ping();

    // Ping périodique
    intervalRef.current = setInterval(ping, PING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null;
}
