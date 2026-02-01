import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Créer la réponse
    const response = NextResponse.json(
      { message: 'Déconnexion réussie' },
      { status: 200 }
    );

    // Supprimer le cookie d'authentification
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immédiatement
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Méthode GET pour vérifier que l'endpoint fonctionne
export async function GET() {
  return NextResponse.json(
    { message: 'API de déconnexion disponible' },
    { status: 200 }
  );
}
