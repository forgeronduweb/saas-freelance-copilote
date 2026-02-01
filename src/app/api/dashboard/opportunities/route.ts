import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Opportunity from '@/lib/models/Opportunity';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };

    await connectDB();

    const opportunitiesData = await Opportunity.find({ userId: decoded.userId })
      .sort({ publishedAt: -1 })
      .limit(20);

    const opportunities = opportunitiesData.map(op => ({
      id: op._id.toString(),
      source: op.source,
      title: op.title,
      company: op.company,
      description: op.description,
      url: op.url || '',
      budget: op.budget,
      status: op.status,
      publishedAt: formatRelativeDate(op.publishedAt),
    }));

    // Statistiques
    const stats = {
      total: opportunitiesData.length,
      nouvelles: opportunitiesData.filter(o => o.status === 'Nouvelle').length,
      contactees: opportunitiesData.filter(o => o.status === 'Contactée').length,
      enDiscussion: opportunitiesData.filter(o => o.status === 'En discussion').length,
      gagnees: opportunitiesData.filter(o => o.status === 'Gagnée').length,
    };

    return NextResponse.json({ opportunities, stats });
  } catch (error) {
    console.error('Erreur API opportunities:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await connectDB();

    const result = await Opportunity.findOneAndDelete({ _id: id, userId: decoded.userId });

    if (!result) {
      return NextResponse.json({ error: 'Opportunité non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Opportunité supprimée' });
  } catch (error) {
    console.error('Erreur suppression opportunity:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };
    const body = await request.json();

    await connectDB();

    const newOpportunity = await Opportunity.create({
      userId: decoded.userId,
      source: body.source || 'Web',
      title: body.title,
      company: body.company,
      description: body.description,
      url: body.url,
      budget: body.budget,
      status: 'Nouvelle',
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
    });

    return NextResponse.json({
      opportunity: {
        id: newOpportunity._id.toString(),
        source: newOpportunity.source,
        title: newOpportunity.title,
        company: newOpportunity.company,
        url: newOpportunity.url || '',
        status: newOpportunity.status,
        publishedAt: "Aujourd'hui",
      },
      message: 'Opportunité créée'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création opportunity:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };
    const body = await request.json();
    const { id, status, notes } = body;

    await connectDB();

    const updateData: { status?: string; notes?: string; contactedAt?: Date } = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (status === 'Contactée') updateData.contactedAt = new Date();

    const opportunity = await Opportunity.findOneAndUpdate(
      { _id: id, userId: decoded.userId },
      updateData,
      { new: true }
    );

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunité non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      opportunity: {
        id: opportunity._id.toString(),
        title: opportunity.title,
        status: opportunity.status,
      },
      message: `Opportunité mise à jour`
    });
  } catch (error) {
    console.error('Erreur mise à jour opportunity:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
  return date.toLocaleDateString('fr-FR');
}
