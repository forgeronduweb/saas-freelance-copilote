import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Client from '@/lib/models/Client';
import { config } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };
    const { id } = await params;

    await connectDB();

    const client = await Client.findOne({ _id: id, userId: decoded.userId });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      client: {
        id: client._id.toString(),
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        company: client.company || '',
        status: client.status,
        projects: client.totalProjects || 0,
        totalSpent: client.totalRevenue || 0,
        joinedDate: client.createdAt?.toISOString() || new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Erreur API client detail:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
