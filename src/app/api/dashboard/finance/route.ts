import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
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
      const invoiceDoc = await Invoice.findOne({ userId: decoded.userId, invoiceNumber: id });

      if (!invoiceDoc) {
        return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
      }

      return NextResponse.json({
        invoice: {
          id: invoiceDoc.invoiceNumber,
          clientId: invoiceDoc.clientId?.toString() || '',
          client: invoiceDoc.clientName,
          amount: invoiceDoc.amount,
          tax: invoiceDoc.tax,
          total: invoiceDoc.total,
          status: normalizeInvoiceStatus(invoiceDoc.status),
          statusRaw: invoiceDoc.status,
          issueDate: invoiceDoc.issueDate.toISOString().split('T')[0],
          dueDate: invoiceDoc.dueDate.toISOString().split('T')[0],
          paidDate: invoiceDoc.paidDate ? invoiceDoc.paidDate.toISOString().split('T')[0] : undefined,
          items: Array.isArray(invoiceDoc.items)
            ? invoiceDoc.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
              }))
            : [],
          notes: invoiceDoc.notes,
        },
      });
    }

    const query: Record<string, unknown> = { userId: decoded.userId };
    if (clientId) query.clientId = clientId;

    const invoicesData = await Invoice.find(query).sort({ issueDate: -1 });

    const invoices = invoicesData.map((inv) => ({
      id: inv.invoiceNumber,
      clientId: inv.clientId?.toString() || '',
      client: inv.clientName,
      amount: inv.total,
      date: inv.issueDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0],
      status: normalizeInvoiceStatus(inv.status),
    }));

    const totalRevenue = invoicesData.filter(i => i.status === "Payée").reduce((sum, i) => sum + i.total, 0);
    const pending = invoicesData.filter(i => i.status === "Envoyée").reduce((sum, i) => sum + i.total, 0);
    const overdue = invoicesData.filter(i => i.status === "En retard").reduce((sum, i) => sum + i.total, 0);

    const paymentRate = invoicesData.length > 0
      ? Math.round((invoicesData.filter(i => i.status === 'Payée').length / invoicesData.length) * 100)
      : 0;

    return NextResponse.json({ 
      invoices,
      stats: {
        totalRevenue,
        pending,
        overdue,
        paymentRate
      }
    });
  } catch (error) {
    console.error('Erreur API finance:', error);
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

    const result = await Invoice.findOneAndDelete({ userId: decoded.userId, invoiceNumber: id });

    if (!result) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Facture supprimée' });
  } catch (error) {
    console.error('Erreur suppression facture:', error);
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

    const count = await Invoice.countDocuments({ userId: decoded.userId });
    const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const total = body.items?.reduce((sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + (item.quantity * item.unitPrice), 0) || 0;

    const newInvoice = await Invoice.create({
      userId: decoded.userId,
      clientId: body.clientId,
      clientName: body.clientName,
      invoiceNumber,
      amount: total,
      tax: body.tax || 0,
      total: total + (body.tax || 0),
      status: 'Brouillon',
      issueDate: new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: body.items || [],
      notes: body.notes,
    });

    return NextResponse.json({
      invoice: {
        id: newInvoice.invoiceNumber,
        client: newInvoice.clientName,
        amount: newInvoice.total,
        date: newInvoice.issueDate.toISOString().split('T')[0],
        dueDate: newInvoice.dueDate.toISOString().split('T')[0],
        status: normalizeInvoiceStatus(newInvoice.status),
      },
      message: 'Facture créée'
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function normalizeInvoiceStatus(status: string): "Payée" | "En attente" | "En retard" | "Brouillon" {
  switch (status) {
    case 'Payée':
      return 'Payée';
    case 'En retard':
      return 'En retard';
    case 'Envoyée':
      return 'En attente';
    case 'Brouillon':
    default:
      return 'Brouillon';
  }
}
