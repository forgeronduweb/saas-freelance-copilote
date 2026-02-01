import { NextResponse } from "next/server";

const SELF_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

export async function GET(request: Request) {
  // Vérifier le secret pour sécuriser l'endpoint (optionnel mais recommandé)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ping l'endpoint health pour garder l'app active
    if (SELF_URL) {
      await fetch(`${SELF_URL}/api/health`);
    }

    return NextResponse.json({
      status: "ok",
      message: "Keep-alive ping successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
