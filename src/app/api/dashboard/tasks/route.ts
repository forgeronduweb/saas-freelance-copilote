import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import { config } from '@/lib/config';

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

    const result = await Task.findOneAndDelete({ _id: id, userId: decoded.userId });

    if (!result) {
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tâche supprimée' });
  } catch (error) {
    console.error('Erreur suppression tâche:', error);
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

    const newTask = await Task.create({
      userId: decoded.userId,
      title: body.title,
      description: body.description,
      type: body.type || 'Feature',
      status: body.status || 'À faire',
      priority: body.priority || 'Moyenne',
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    });

    return NextResponse.json({
      task: {
        id: newTask._id.toString(),
        displayId: newTask._id.toString().slice(-8).toUpperCase(),
        title: newTask.title,
        type: newTask.type,
        status: newTask.status,
        priority: newTask.priority,
      },
      message: 'Tâche créée'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création tâche:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
