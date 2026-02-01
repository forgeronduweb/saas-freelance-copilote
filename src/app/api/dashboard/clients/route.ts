import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Client from '@/lib/models/Client';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };

    await connectDB();

    const clientsData = await Client.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    const clients = clientsData.map(c => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      company: c.company || '',
      status: c.status,
      projects: c.totalProjects || 0,
    }));

    // Statistiques clients
    const stats = {
      total: clients.length,
      actifs: clients.filter(c => c.status === "Actif").length,
      prospects: clients.filter(c => c.status === "Prospect").length,
      inactifs: clients.filter(c => c.status === "Inactif").length,
      perdus: clients.filter(c => c.status === "Perdu").length,
    };

    return NextResponse.json({ clients, stats });
  } catch (error) {
    console.error('Erreur API clients:', error);
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

    const result = await Client.findOneAndDelete({ _id: id, userId: decoded.userId });

    if (!result) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Client supprimé' });
  } catch (error) {
    console.error('Erreur suppression client:', error);
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

    const newClient = await Client.create({
      userId: decoded.userId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      status: body.status || 'Prospect',
      totalProjects: 0,
      totalRevenue: 0,
    });

    return NextResponse.json({
      client: {
        id: newClient._id.toString(),
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone || '',
        company: newClient.company || '',
        status: newClient.status,
        projects: 0,
      },
      message: 'Client créé'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création client:', error);
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
    const { id, status } = body;

    await connectDB();

    const client = await Client.findOne({ _id: id, userId: decoded.userId });
    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    const oldStatus = client.status;

    // Si passage de Prospect à Actif, incrémenter les projets
    const updateData: { status: string; totalProjects?: number } = { status };
    if (oldStatus === "Prospect" && status === "Actif") {
      updateData.totalProjects = (client.totalProjects || 0) + 1;
    }

    const updatedClient = await Client.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({ 
      client: {
        id: updatedClient!._id.toString(),
        name: updatedClient!.name,
        email: updatedClient!.email,
        status: updatedClient!.status,
        projects: updatedClient!.totalProjects || 0,
      },
      message: `Client passé de ${oldStatus} à ${status}` 
    });
  } catch (error) {
    console.error('Erreur mise à jour client:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
