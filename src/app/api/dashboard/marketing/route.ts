import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Pour l'instant, retourner des données statiques
    // TODO: Remplacer par une requête MongoDB
    const marketingData = {
      visitors: {
        total: 1224,
        growth: 5.2,
        chartData: [
          { month: "January", desktop: 186, mobile: 80 },
          { month: "February", desktop: 305, mobile: 200 },
          { month: "March", desktop: 237, mobile: 120 },
          { month: "April", desktop: 73, mobile: 190 },
          { month: "May", desktop: 209, mobile: 130 },
          { month: "June", desktop: 214, mobile: 140 },
        ]
      },
      socialMedia: [
        { platform: "Instagram", followers: 1234, growth: 12 },
        { platform: "LinkedIn", followers: 892, growth: 8 },
        { platform: "Twitter", followers: 456, growth: 2 },
        { platform: "Facebook", followers: 265, growth: 0 },
      ],
      recentPosts: [
        { platform: "Instagram", content: "Nouveau projet client terminé ! 🎉", status: "Publié", engagement: "124 likes", date: "Il y a 2 heures" },
        { platform: "LinkedIn", content: "5 conseils pour réussir en freelance", status: "Programmé", engagement: null, date: "Demain à 10:00" },
        { platform: "Twitter", content: "Thread: Comment j'ai doublé mes revenus", status: "Programmé", engagement: null, date: "28 Jan à 14:00" },
      ]
    };

    return NextResponse.json(marketingData);
  } catch (error) {
    console.error('Erreur API marketing:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
