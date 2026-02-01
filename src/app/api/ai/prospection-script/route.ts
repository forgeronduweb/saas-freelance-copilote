import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({} as any));
  const objective = typeof body?.objective === "string" ? body.objective.trim() : "";
  const context = typeof body?.context === "string" ? body.context.trim() : "";
  const tone = typeof body?.tone === "string" ? body.tone.trim() : "";

  if (!objective) {
    return NextResponse.json({ error: "Missing objective" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  const prompt =
    `Tu es un assistant commercial pour un freelance. ` +
    `Écris un message court, concret et actionnable.\n\n` +
    `Objectif: ${objective}\n` +
    (tone ? `Ton: ${tone}\n` : "") +
    (context ? `Contexte: ${context}\n` : "") +
    `\nContraintes:\n` +
    `- Langue: Français\n` +
    `- 120 à 220 mots\n` +
    `- Structure: accroche + valeur + question de RDV + signature\n` +
    `- Pas de blabla, pas d'emojis\n`;

  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: prompt,
    });

    return NextResponse.json({ text: response.output_text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
