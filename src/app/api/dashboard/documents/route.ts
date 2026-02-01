import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import ProjectDocument from '@/lib/models/ProjectDocument';
import { config } from '@/lib/config';

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

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };

    await connectDB();

    const docsData = await ProjectDocument.find({ userId: decoded.userId }).sort({ updatedAt: -1 });

    const documents = docsData.map(d => ({
      id: d._id.toString(),
      title: d.title,
      type: d.type,
      updatedAt: formatRelativeDate(d.updatedAt),
      fileName: d.fileName,
      fileSize: d.fileSize,
    }));

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Erreur API documents:', error);
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

    const result = await ProjectDocument.findOneAndDelete({ _id: id, userId: decoded.userId });

    if (!result) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Document supprimé' });
  } catch (error) {
    console.error('Erreur suppression document:', error);
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

    const newDoc = await ProjectDocument.create({
      userId: decoded.userId,
      title: body.title,
      type: body.type || 'Autre',
      description: body.description,
      missionId: body.missionId,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize,
    });

    return NextResponse.json({
      document: {
        id: newDoc._id.toString(),
        title: newDoc.title,
        type: newDoc.type,
        updatedAt: "Aujourd'hui",
      },
      message: 'Document créé'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création document:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
