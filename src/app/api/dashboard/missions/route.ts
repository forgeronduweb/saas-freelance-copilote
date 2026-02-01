import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Mission from '@/lib/models/Mission';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };

    await connectDB();

    const missionsData = await Mission.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    const missions = missionsData.map(m => ({
      id: m._id.toString(),
      title: m.title,
      client: m.clientName,
      status: m.status,
      priority: m.priority,
      dueDate: m.dueDate ? m.dueDate.toISOString().split('T')[0] : undefined,
      timeSpent: m.timeSpent || 0,
      evidenceUrls: m.evidenceUrls || [],
      checklist: m.checklist || [],
      verificationStatus: m.verificationStatus || 'Aucun',
      verificationMessage: m.verificationMessage,
    }));

    // Statistiques
    const stats = {
      total: missions.length,
      todo: missions.filter(m => m.status === 'To-do').length,
      enCours: missions.filter(m => m.status === 'En cours').length,
      termine: missions.filter(m => m.status === 'Terminé').length,
    };

    return NextResponse.json({ missions, stats });
  } catch (error) {
    console.error('Erreur API missions:', error);
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

    const initialStatus = body.status === 'Terminé' ? 'To-do' : body.status;

    const newMission = await Mission.create({
      userId: decoded.userId,
      title: body.title,
      clientName: body.client || body.clientName,
      clientId: body.clientId,
      description: body.description,
      status: initialStatus || 'To-do',
      priority: body.priority || 'Moyenne',
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      budget: body.budget,
      evidenceUrls: Array.isArray(body.evidenceUrls) ? body.evidenceUrls : undefined,
      checklist: Array.isArray(body.checklist) ? body.checklist : undefined,
    });

    return NextResponse.json({
      mission: {
        id: newMission._id.toString(),
        title: newMission.title,
        client: newMission.clientName,
        status: newMission.status,
        dueDate: newMission.dueDate?.toISOString().split('T')[0],
        evidenceUrls: newMission.evidenceUrls || [],
        checklist: newMission.checklist || [],
        verificationStatus: newMission.verificationStatus || 'Aucun',
        verificationMessage: newMission.verificationMessage,
      },
      message: 'Mission créée'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création mission:', error);
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
    const { id, status, timeSpent, evidenceUrls, checklist, requestVerification } = body;

    await connectDB();

    const existing = await Mission.findOne({ _id: id, userId: decoded.userId });
    if (!existing) {
      return NextResponse.json({ error: 'Mission non trouvée' }, { status: 404 });
    }

    const updateData: { status?: string; timeSpent?: number } = {};
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;

    if (Array.isArray(evidenceUrls)) {
      (updateData as any).evidenceUrls = evidenceUrls;
    }

    if (Array.isArray(checklist)) {
      (updateData as any).checklist = checklist;
    }

    if (status === 'Terminé' && requestVerification !== true) {
      return NextResponse.json(
        {
          error: "Le statut 'Terminé' est géré automatiquement après vérification des preuves.",
        },
        { status: 400 }
      );
    }

    const nextEvidenceUrls = Array.isArray(evidenceUrls)
      ? evidenceUrls
      : (existing.evidenceUrls || []);
    const nextChecklist = Array.isArray(checklist)
      ? checklist
      : (existing.checklist || []);
    const nextTimeSpent = timeSpent !== undefined ? timeSpent : (existing.timeSpent || 0);

    const hasEvidence = Array.isArray(nextEvidenceUrls) && nextEvidenceUrls.length > 0;
    const hasChecklistAnyDone =
      Array.isArray(nextChecklist) && nextChecklist.some((i: any) => Boolean(i?.done));
    const hasTimeSpent = typeof nextTimeSpent === 'number' && nextTimeSpent > 0;
    const hasProgress = hasEvidence || hasChecklistAnyDone || hasTimeSpent;

    if (requestVerification !== true && existing.status !== 'Terminé') {
      updateData.status = hasProgress ? 'En cours' : 'To-do';
    }

    if (requestVerification !== true && (Array.isArray(evidenceUrls) || Array.isArray(checklist))) {
      (updateData as any).verificationStatus = 'Aucun';
      (updateData as any).verificationMessage = undefined;
    }

    if (requestVerification === true) {
      const hasChecklistDone =
        Array.isArray(nextChecklist) &&
        nextChecklist.length > 0 &&
        nextChecklist.every((i: any) => Boolean(i?.done));

      if (!hasEvidence && !hasChecklistDone) {
        (updateData as any).verificationStatus = 'Refusée';
        (updateData as any).verificationMessage =
          "Ajoute au moins une preuve (lien) ou complète une checklist avant soumission.";
      } else {
        (updateData as any).verificationStatus = 'Validée';
        (updateData as any).verificationMessage = 'Preuves validées.';
        updateData.status = 'Terminé';
      }
    }

    const mission = await Mission.findOneAndUpdate(
      { _id: id, userId: decoded.userId },
      updateData,
      { new: true }
    );

    if (!mission) {
      return NextResponse.json({ error: 'Mission non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      mission: {
        id: mission._id.toString(),
        title: mission.title,
        status: mission.status,
        timeSpent: mission.timeSpent,
        evidenceUrls: mission.evidenceUrls || [],
        checklist: mission.checklist || [],
        verificationStatus: mission.verificationStatus || 'Aucun',
        verificationMessage: mission.verificationMessage,
      },
      message: 'Mission mise à jour'
    });
  } catch (error) {
    console.error('Erreur mise à jour mission:', error);
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

    const result = await Mission.findOneAndDelete({ _id: id, userId: decoded.userId });

    if (!result) {
      return NextResponse.json({ error: 'Mission non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Mission supprimée' });
  } catch (error) {
    console.error('Erreur suppression mission:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
