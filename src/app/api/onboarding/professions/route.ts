import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";

export const POST = withAuth(async (request: NextRequest, context: { user: any }) => {
  try {
    const body = await request.json();
    const professionsRaw = body?.professions;

    if (!Array.isArray(professionsRaw)) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }

    const professions = Array.from(
      new Set(
        professionsRaw
          .map((p: unknown) => (typeof p === "string" ? p.trim() : ""))
          .filter((p: string) => p)
      )
    );

    if (!professions.length) {
      return NextResponse.json({ error: "Choisissez au moins une profession" }, { status: 400 });
    }

    const userDoc = context.user?.userData;
    if (!userDoc) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    userDoc.professions = professions;
    userDoc.onboardingCompleted = true;
    await userDoc.save();

    return NextResponse.json(
      {
        message: "Professions enregistrées",
        user: {
          id: userDoc._id,
          professions: userDoc.professions,
          onboardingCompleted: userDoc.onboardingCompleted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur onboarding professions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
});
