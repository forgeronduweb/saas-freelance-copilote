import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import connectDB from "@/lib/mongodb"
import Feedback from "@/lib/models/Feedback"
import { config } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, config.auth.jwtSecret) as any
    } catch {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }

    const body = await request.json()

    const type = body?.type
    const message = body?.message
    const email = body?.email
    const pageUrl = body?.pageUrl

    if (type !== "bug" && type !== "idea" && type !== "other") {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 })
    }

    if (typeof message !== "string" || message.trim().length < 3) {
      return NextResponse.json(
        { error: "Le message doit contenir au moins 3 caractères" },
        { status: 400 }
      )
    }

    if (message.length > 4000) {
      return NextResponse.json({ error: "Message trop long" }, { status: 400 })
    }

    if (email !== undefined && email !== null && typeof email !== "string") {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    if (pageUrl !== undefined && pageUrl !== null && typeof pageUrl !== "string") {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 })
    }

    await connectDB()

    const feedback = await Feedback.create({
      userId: decoded.userId,
      type,
      message: message.trim(),
      email: typeof email === "string" && email.trim() ? email.trim() : undefined,
      pageUrl: typeof pageUrl === "string" && pageUrl.trim() ? pageUrl.trim() : undefined,
    })

    return NextResponse.json(
      {
        message: "Feedback envoyé",
        feedback: { id: feedback._id.toString() },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur API feedback:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
