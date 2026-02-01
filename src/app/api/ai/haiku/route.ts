import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({} as unknown));
  const input =
    typeof (body as any)?.input === "string" && (body as any).input.trim().length > 0
      ? (body as any).input
      : "write a haiku about ai";

  const openai = new OpenAI({ apiKey });

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input,
  });

  return NextResponse.json({ text: response.output_text });
}
