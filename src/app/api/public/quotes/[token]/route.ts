import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Quote from "@/lib/models/Quote";
import User from "@/lib/models/User";

type PublicProvider = {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  skills?: string[];
};

function serializeProvider(user: any): PublicProvider {
  return {
    name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Freelance",
    email: user?.email || "",
    phone: user?.phone || undefined,
    city: user?.location?.city || undefined,
    country: user?.location?.country || undefined,
    skills: Array.isArray(user?.skills) ? user.skills : undefined,
  };
}

async function getProviderForQuote(quote: any): Promise<PublicProvider | null> {
  try {
    if (!quote?.userId) return null;
    const user = await User.findById(quote.userId).select("firstName lastName email phone location skills");
    if (!user) return null;
    return serializeProvider(user);
  } catch (e) {
    console.error("Erreur chargement prestataire:", e);
    return null;
  }
}

function serializeQuote(quote: any, provider: PublicProvider | null) {
  return {
    id: quote.quoteNumber,
    clientName: quote.clientName,
    title: quote.title,
    description: quote.description,
    items: quote.items,
    total: quote.total,
    validUntil: quote.validUntil?.toISOString?.().split("T")[0] ?? quote.validUntil,
    status: quote.status,
    provider,
    suggestions: (quote.suggestions || []).map((s: any) => ({
      message: s.message,
      createdAt: s.createdAt?.toISOString?.() ?? s.createdAt,
    })),
  };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    await connectDB();

    const { token } = await context.params;
    const quote = await Quote.findOne({ publicToken: token });

    if (!quote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
    }

    const provider = await getProviderForQuote(quote);
    return NextResponse.json({ quote: serializeQuote(quote, provider) });
  } catch (error) {
    console.error("Erreur API public quote GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    await connectDB();

    const { token } = await context.params;
    const body = await request.json();
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "Message manquant" }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "Message trop long" }, { status: 400 });
    }

    const quote = await Quote.findOneAndUpdate(
      { publicToken: token },
      { $push: { suggestions: { message, createdAt: new Date() } } },
      { new: true }
    );

    if (!quote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
    }

    const provider = await getProviderForQuote(quote);
    return NextResponse.json({ quote: serializeQuote(quote, provider) }, { status: 201 });
  } catch (error) {
    console.error("Erreur API public quote POST:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    await connectDB();

    const { token } = await context.params;
    const body = await request.json();
    const decision = String(body?.decision || "");

    if (decision !== "accept" && decision !== "refuse") {
      return NextResponse.json({ error: "Décision invalide" }, { status: 400 });
    }

    const quote = await Quote.findOne({ publicToken: token });

    if (!quote) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
    }

    if (quote.status === "Accepté" || quote.status === "Refusé") {
      return NextResponse.json({ error: "Décision déjà enregistrée" }, { status: 400 });
    }

    if (decision === "accept") {
      quote.status = "Accepté";
      quote.acceptedAt = new Date();
    }

    if (decision === "refuse") {
      quote.status = "Refusé";
      quote.refusedAt = new Date();
    }

    await quote.save();

    const provider = await getProviderForQuote(quote);
    return NextResponse.json({ quote: serializeQuote(quote, provider) });
  } catch (error) {
    console.error("Erreur API public quote PATCH:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
