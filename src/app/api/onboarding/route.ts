import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/database';
import User from '@/lib/models/User';
import { config } from '@/lib/config';

interface JWTPayload {
  userId: string;
  email: string;
  userType: string;
}

export async function POST(request: NextRequest) {
  try {
    let token = request.cookies.get('auth-token')?.value;

    // Fallback: Authorization header (Bearer)
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, config.auth.jwtSecret) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { step, data } = body;

    if (!step || !data) {
      return NextResponse.json(
        { error: 'Étape et données requises' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updateData: Record<string, unknown> = { onboardingStep: step };

    switch (step) {
      case 1:
        if (data.professions) updateData.professions = data.professions;
        break;
      case 2:
        if (data.bio !== undefined) updateData.bio = data.bio;
        if (data.yearsOfExperience !== undefined) updateData.yearsOfExperience = data.yearsOfExperience;
        if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
        break;
      case 3:
        if (data.skills) updateData.skills = data.skills;
        break;
      case 4:
        if (data.availability) updateData.availability = data.availability;
        if (data.preferredDays) updateData.preferredDays = data.preferredDays;
        updateData.onboardingCompleted = true;
        break;
      default:
        return NextResponse.json(
          { error: 'Étape invalide' },
          { status: 400 }
        );
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Étape enregistrée',
      step,
      onboardingCompleted: user.onboardingCompleted,
      user: {
        id: user._id,
        professions: user.professions,
        bio: user.bio,
        yearsOfExperience: user.yearsOfExperience,
        hourlyRate: user.hourlyRate,
        skills: user.skills,
        availability: user.availability,
        preferredDays: user.preferredDays,
        onboardingStep: user.onboardingStep,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
