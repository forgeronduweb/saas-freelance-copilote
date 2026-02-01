import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import { config } from '@/lib/config';

import User from '@/lib/models/User';
import Client from '@/lib/models/Client';
import Invoice from '@/lib/models/Invoice';
import Task from '@/lib/models/Task';
import Quote from '@/lib/models/Quote';
import Event from '@/lib/models/Event';
import TimeEntry from '@/lib/models/TimeEntry';
import Opportunity from '@/lib/models/Opportunity';
import Mission from '@/lib/models/Mission';
import ProjectDocument from '@/lib/models/ProjectDocument';
import Project from '@/lib/models/Project';
import Application from '@/lib/models/Application';
import Message from '@/lib/models/Message';
import Review from '@/lib/models/Review';

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };

    await connectDB();

    const userId = decoded.userId;

    await Promise.all([
      Client.deleteMany({ userId }),
      Invoice.deleteMany({ userId }),
      Task.deleteMany({ userId }),
      Quote.deleteMany({ userId }),
      Event.deleteMany({ userId }),
      TimeEntry.deleteMany({ userId }),
      Opportunity.deleteMany({ userId }),
      Mission.deleteMany({ userId }),
      ProjectDocument.deleteMany({ userId }),

      // Données marketplace (si présentes)
      Project.deleteMany({ clientId: userId }),
      Project.deleteMany({ freelancerId: userId }),
      Application.deleteMany({ freelancerId: userId }),
      Message.deleteMany({ senderId: userId }),
      Message.deleteMany({ receiverId: userId }),
      Review.deleteMany({ reviewerId: userId }),
      Review.deleteMany({ reviewedId: userId }),
    ]);

    await User.findByIdAndDelete(userId);

    const response = NextResponse.json({ message: 'Compte supprimé' }, { status: 200 });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur suppression compte:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
