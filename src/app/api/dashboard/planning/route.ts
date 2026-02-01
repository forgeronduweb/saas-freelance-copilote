import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };

    await connectDB();

    const eventsData = await Event.find({ userId: decoded.userId })
      .sort({ date: 1 })
      .limit(20);

    const events = eventsData.map(event => ({
      id: event._id.toString(),
      title: event.title,
      date: event.date.toISOString().split('T')[0],
      time: event.time || '',
      type: event.type,
      status: event.status,
      description: event.description,
      location: event.location,
      collaborators: event.collaborators || [],
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Erreur API planning:', error);
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

    const newEvent = await Event.create({
      userId: decoded.userId,
      title: body.title,
      description: body.description,
      type: body.type || 'Autre',
      status: body.status || 'Planifié',
      date: new Date(body.date),
      time: body.time,
      duration: body.duration,
      location: body.location,
      clientId: body.clientId,
      projectId: body.projectId,
      collaborators: body.collaborators || [],
    });

    return NextResponse.json({
      event: {
        id: newEvent._id.toString(),
        title: newEvent.title,
        date: newEvent.date.toISOString().split('T')[0],
        time: newEvent.time,
        type: newEvent.type,
        status: newEvent.status,
      },
      message: 'Événement créé'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création événement:', error);
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await connectDB();

    // Build update object with only allowed fields
    const allowedFields = ['title', 'description', 'type', 'status', 'date', 'time', 'location', 'collaborators'];
    const updateData: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'date') {
          updateData[field] = new Date(updates[field]);
        } else {
          updateData[field] = updates[field];
        }
      }
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, userId: decoded.userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      event: {
        id: updatedEvent._id.toString(),
        title: updatedEvent.title,
        date: updatedEvent.date.toISOString().split('T')[0],
        time: updatedEvent.time,
        type: updatedEvent.type,
        status: updatedEvent.status,
        description: updatedEvent.description,
        location: updatedEvent.location,
        collaborators: updatedEvent.collaborators || [],
      },
      message: 'Événement modifié'
    });
  } catch (error) {
    console.error('Erreur modification événement:', error);
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

    const result = await Event.findOneAndDelete({ _id: id, userId: decoded.userId });

    if (!result) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Événement supprimé' });
  } catch (error) {
    console.error('Erreur suppression événement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
