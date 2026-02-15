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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clientId = searchParams.get('clientId');

    await connectDB();

    if (id) {
      const mission = await Mission.findOne({ _id: id, userId: decoded.userId });
      if (!mission) {
        return NextResponse.json({ error: 'Mission non trouvée' }, { status: 404 });
      }

      return NextResponse.json({
        mission: {
          id: mission._id.toString(),
          clientId: mission.clientId?.toString() || '',
          title: mission.title,
          client: mission.clientName,
          description: mission.description,
          status: mission.status,
          priority: mission.priority,
          dueDate: mission.dueDate ? mission.dueDate.toISOString().split('T')[0] : undefined,
          budget: mission.budget,
          timeSpent: mission.timeSpent || 0,
          evidenceUrls: mission.evidenceUrls || [],
          checklist: mission.checklist || [],
          verificationStatus: mission.verificationStatus || 'Aucun',
          verificationMessage: mission.verificationMessage,
          createdAt: mission.createdAt?.toISOString?.() ?? undefined,
          updatedAt: mission.updatedAt?.toISOString?.() ?? undefined,
        },
      });
    }

    const query: Record<string, unknown> = { userId: decoded.userId };
    if (clientId) query.clientId = clientId;

    const missionsData = await Mission.find(query).sort({ createdAt: -1 });

    const missions = missionsData.map(m => ({
      id: m._id.toString(),
      clientId: m.clientId?.toString() || '',
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
    const body = (await request.json()) as Record<string, unknown>;
    const id = typeof body.id === 'string' ? body.id : String(body.id ?? '');
    const status = typeof body.status === 'string' ? body.status : undefined;
    const title = typeof body.title === 'string' ? body.title : undefined;
    const description = typeof body.description === 'string' ? body.description : undefined;
    const priority = typeof body.priority === 'string' ? body.priority : undefined;
    const clientId = typeof body.clientId === 'string' ? body.clientId : undefined;
    const clientName =
      typeof body.clientName === 'string'
        ? body.clientName
        : typeof body.client === 'string'
          ? body.client
          : undefined;

    const hasDueDateKey = Object.prototype.hasOwnProperty.call(body, 'dueDate');
    const dueDateRaw = hasDueDateKey ? body.dueDate : undefined;

    const hasBudgetKey = Object.prototype.hasOwnProperty.call(body, 'budget');
    const budgetRaw = hasBudgetKey ? body.budget : undefined;

    const timeSpent = typeof body.timeSpent === 'number' ? body.timeSpent : undefined;
    const evidenceUrls = Array.isArray(body.evidenceUrls) ? (body.evidenceUrls as unknown[]) : undefined;
    const checklist = Array.isArray(body.checklist) ? (body.checklist as unknown[]) : undefined;
    const requestVerification = body.requestVerification === true;

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await connectDB();

    const existing = await Mission.findOne({ _id: id, userId: decoded.userId });
    if (!existing) {
      return NextResponse.json({ error: 'Mission non trouvée' }, { status: 404 });
    }

    const updateData: {
      status?: string;
      title?: string;
      description?: string;
      priority?: 'Basse' | 'Moyenne' | 'Haute';
      clientId?: string;
      clientName?: string;
      dueDate?: Date;
      budget?: number;
      timeSpent?: number;
      evidenceUrls?: string[];
      checklist?: Array<{ text: string; done: boolean }>;
      verificationStatus?: 'Aucun' | 'En vérification' | 'Validée' | 'Refusée';
      verificationMessage?: string;
    } = {};

    if (typeof title === 'string') {
      const trimmed = title.trim();
      if (trimmed.length > 0) updateData.title = trimmed;
    }

    if (typeof description === 'string') {
      const trimmed = description.trim();
      updateData.description = trimmed.length > 0 ? trimmed : undefined;
    }

    if (typeof priority === 'string') {
      if (priority === 'Basse' || priority === 'Moyenne' || priority === 'Haute') {
        updateData.priority = priority;
      }
    }

    if (typeof clientId === 'string' && clientId.trim().length > 0) {
      updateData.clientId = clientId;
    }

    if (typeof clientName === 'string') {
      const trimmed = clientName.trim();
      if (trimmed.length > 0) updateData.clientName = trimmed;
    }

    if (hasDueDateKey) {
      const asString = typeof dueDateRaw === 'string' ? dueDateRaw.trim() : '';
      if (!asString) {
        updateData.dueDate = undefined;
      } else {
        const parsed = new Date(asString);
        if (!Number.isNaN(parsed.getTime())) updateData.dueDate = parsed;
      }
    }

    if (hasBudgetKey) {
      const next = typeof budgetRaw === 'number' ? budgetRaw : Number(budgetRaw);
      updateData.budget = Number.isFinite(next) ? next : undefined;
    }

    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;

    if (Array.isArray(evidenceUrls)) {
      updateData.evidenceUrls = evidenceUrls
        .map((u) => (typeof u === 'string' ? u : String(u ?? '')))
        .filter(Boolean);
    }

    if (Array.isArray(checklist)) {
      updateData.checklist = checklist
        .map((i) => {
          const record = (typeof i === 'object' && i !== null ? (i as Record<string, unknown>) : {}) as Record<
            string,
            unknown
          >;
          return {
            text: typeof record.text === 'string' ? record.text : String(record.text ?? ''),
            done: Boolean(record.done),
          };
        })
        .filter((i) => i.text.trim().length > 0);
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
      ? (updateData.evidenceUrls ?? [])
      : (existing.evidenceUrls || []);
    const nextChecklist = Array.isArray(checklist)
      ? (updateData.checklist ?? [])
      : (existing.checklist || []);
    const nextTimeSpent = timeSpent !== undefined ? timeSpent : (existing.timeSpent || 0);

    const hasEvidence = Array.isArray(nextEvidenceUrls) && nextEvidenceUrls.length > 0;
    const hasChecklistAnyDone =
      Array.isArray(nextChecklist) && nextChecklist.some((i) => Boolean((i as { done?: boolean } | undefined)?.done));
    const hasTimeSpent = typeof nextTimeSpent === 'number' && nextTimeSpent > 0;
    const hasProgress = hasEvidence || hasChecklistAnyDone || hasTimeSpent;

    if (requestVerification !== true && existing.status !== 'Terminé') {
      if (status === 'To-do' || status === 'En cours') {
        updateData.status = status;
      } else if (status === undefined) {
        updateData.status = hasProgress ? 'En cours' : 'To-do';
      }
    }

    if (requestVerification !== true && (Array.isArray(evidenceUrls) || Array.isArray(checklist))) {
      updateData.verificationStatus = 'Aucun';
      updateData.verificationMessage = undefined;
    }

    if (requestVerification === true) {
      const hasChecklistDone =
        Array.isArray(nextChecklist) &&
        nextChecklist.length > 0 &&
        nextChecklist.every((i) => Boolean((i as { done?: boolean } | undefined)?.done));

      if (!hasEvidence && !hasChecklistDone) {
        updateData.verificationStatus = 'Refusée';
        updateData.verificationMessage =
          "Ajoute au moins une preuve (lien) ou complète une checklist avant soumission.";
      } else {
        updateData.verificationStatus = 'Validée';
        updateData.verificationMessage = 'Preuves validées.';
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
        clientId: mission.clientId?.toString() || '',
        title: mission.title,
        client: mission.clientName,
        description: mission.description,
        status: mission.status,
        priority: mission.priority,
        dueDate: mission.dueDate ? mission.dueDate.toISOString().split('T')[0] : undefined,
        budget: mission.budget,
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
