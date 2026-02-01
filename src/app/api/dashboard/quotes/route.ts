import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Quote from '@/lib/models/Quote';
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

    await connectDB();

    if (id) {
      const quote = await Quote.findOne({ userId: decoded.userId, quoteNumber: id });

      if (!quote) {
        return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
      }

      return NextResponse.json({
        quote: {
          id: quote.quoteNumber,
          clientId: quote.clientId?.toString() || '',
          clientName: quote.clientName,
          clientEmail: quote.clientEmail,
          publicToken: quote.publicToken,
          title: quote.title,
          description: quote.description,
          items: quote.items,
          total: quote.total,
          validUntil: quote.validUntil.toISOString().split('T')[0],
          status: quote.status,
          createdAt: quote.createdAt.toISOString().split('T')[0],
        },
      });
    }

    const quotesData = await Quote.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    const quotes = quotesData.map(q => ({
      id: q.quoteNumber,
      clientId: q.clientId?.toString() || '',
      clientName: q.clientName,
      items: q.items,
      total: q.total,
      publicToken: q.publicToken,
      validUntil: q.validUntil.toISOString().split('T')[0],
      status: q.status,
      createdAt: q.createdAt.toISOString().split('T')[0],
    }));

    // Statistiques
    const stats = {
      total: quotes.length,
      brouillon: quotes.filter(q => q.status === "Brouillon").length,
      envoye: quotes.filter(q => q.status === "Envoyé").length,
      accepte: quotes.filter(q => q.status === "Accepté").length,
      refuse: quotes.filter(q => q.status === "Refusé").length,
      montantEnAttente: quotes.filter(q => q.status === "Envoyé").reduce((sum, q) => sum + q.total, 0),
      montantAccepte: quotes.filter(q => q.status === "Accepté").reduce((sum, q) => sum + q.total, 0),
      tauxConversion: quotes.filter(q => q.status !== "Brouillon").length > 0 
        ? Math.round((quotes.filter(q => q.status === "Accepté").length / quotes.filter(q => q.status !== "Brouillon").length) * 100) 
        : 0,
    };

    return NextResponse.json({ quotes, stats });
  } catch (error) {
    console.error('Erreur API quotes:', error);
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

    // Générer le numéro de devis
    const count = await Quote.countDocuments({ userId: decoded.userId });
    const quoteNumber = `DEV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const publicToken = crypto.randomBytes(24).toString('hex');

    const items = (body.items || []).map((item: { description: string; quantity: number; unitPrice: number }) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      return {
        description: item.description,
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      };
    });

    const total = items.reduce((sum: number, item: { total: number }) => sum + (item.total || 0), 0) || 0;

    const newQuote = await Quote.create({
      userId: decoded.userId,
      clientId: body.clientId,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      quoteNumber,
      publicToken,
      title: body.title || 'Devis',
      description: body.description,
      amount: total,
      tax: body.tax || 0,
      total: total + (body.tax || 0),
      status: 'Brouillon',
      validUntil: body.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items,
      notes: body.notes,
    });

    return NextResponse.json({
      quote: {
        id: newQuote.quoteNumber,
        clientId: newQuote.clientId?.toString() || '',
        clientName: newQuote.clientName,
        items: newQuote.items,
        total: newQuote.total,
        publicToken: newQuote.publicToken,
        validUntil: newQuote.validUntil.toISOString().split('T')[0],
        status: newQuote.status,
        createdAt: newQuote.createdAt.toISOString().split('T')[0],
      },
      message: 'Devis créé'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création devis:', error);
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
    const { id, status, generatePublicToken } = body;

    await connectDB();

    const quote = await Quote.findOne({ userId: decoded.userId, quoteNumber: id });

    if (!quote) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
    }

    if (typeof status === 'string' && status.length > 0) {
      quote.status = status;
      if (status === 'Accepté') {
        quote.acceptedAt = new Date();
      }
      if (status === 'Refusé') {
        quote.refusedAt = new Date();
      }
    }

    if (generatePublicToken === true && !quote.publicToken) {
      let attempts = 0;
      while (!quote.publicToken && attempts < 5) {
        attempts += 1;
        const candidate = crypto.randomBytes(24).toString('hex');
        const existing = await Quote.findOne({ publicToken: candidate }).select('_id');
        if (!existing) {
          quote.publicToken = candidate;
        }
      }
    }

    await quote.save();

    return NextResponse.json({ 
      quote: {
        id: quote.quoteNumber,
        clientId: quote.clientId?.toString() || '',
        clientName: quote.clientName,
        total: quote.total,
        status: quote.status,
        publicToken: quote.publicToken,
      },
      message: status ? `Devis ${String(status).toLowerCase()}` : 'Devis mis à jour',
      updateClient: status === "Accepté" ? quote.clientId?.toString() : null
    });
  } catch (error) {
    console.error('Erreur mise à jour devis:', error);
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

    const result = await Quote.findOneAndDelete({ userId: decoded.userId, quoteNumber: id });

    if (!result) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Devis supprimé' });
  } catch (error) {
    console.error('Erreur suppression devis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
