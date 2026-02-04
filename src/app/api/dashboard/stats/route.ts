import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Invoice from '@/lib/models/Invoice';
import Client from '@/lib/models/Client';
import Task from '@/lib/models/Task';
import TimeEntry from '@/lib/models/TimeEntry';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    // Vérifier et décoder le token
    let userIdFromToken: string;
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret);
      if (typeof decoded !== 'object' || decoded === null || !("userId" in decoded)) {
        return NextResponse.json(
          { error: 'Token invalide' },
          {
            status: 401,
            headers: {
              'Cache-Control': 'no-store, max-age=0',
            },
          }
        );
      }

      userIdFromToken = (decoded as jwt.JwtPayload & { userId: string }).userId;
    } catch {
      return NextResponse.json(
        { error: 'Token invalide' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    await connectDB();

    // Récupérer l'utilisateur
    const user = await User.findById(userIdFromToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    const userId = user._id;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Récupérer les vraies données depuis MongoDB
    const [
      invoices,
      pendingInvoices,
      overdueInvoices,
      clients,
      tasksData,
      timeEntries,
      lastMonthInvoices,
    ] = await Promise.all([
      Invoice.find({ userId, status: 'Payée' }),
      Invoice.find({ userId, status: { $in: ['Envoyée', 'Brouillon'] } }),
      Invoice.find({ userId, status: 'En retard' }),
      Client.find({ userId }),
      Task.find({ userId }).sort({ createdAt: -1 }).limit(10),
      TimeEntry.find({ userId, date: { $gte: startOfMonth } }),
      Invoice.find({ userId, status: 'Payée', paidDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    // Calculs des statistiques réelles
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const lastMonthRevenue = lastMonthInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const revenueTrend = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const activeClients = clients.filter(c => c.status === 'Actif').length;

    // Calcul du délai de paiement moyen
    const paidInvoicesWithDelay = invoices.filter(inv => inv.paidDate && inv.issueDate);
    const avgPaymentDelay = paidInvoicesWithDelay.length > 0
      ? Math.round(paidInvoicesWithDelay.reduce((sum, inv) => {
          const delay = (new Date(inv.paidDate!).getTime() - new Date(inv.issueDate).getTime()) / (1000 * 60 * 60 * 24);
          return sum + delay;
        }, 0) / paidInvoicesWithDelay.length)
      : 0;

    // Objectif mensuel
    const hourlyRate = user.hourlyRate || 25000;
    const monthlyTarget = user.monthlyTarget || 5000000;
    const monthlyRevenue = invoices
      .filter(inv => inv.paidDate && new Date(inv.paidDate) >= startOfMonth)
      .reduce((sum, inv) => sum + inv.total, 0);
    const objectivePercent = Math.min(100, Math.round((monthlyRevenue / monthlyTarget) * 100));

    // Données du graphique (revenus des 7 derniers jours)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRevenue = invoices
        .filter(inv => inv.paidDate && new Date(inv.paidDate) >= date && new Date(inv.paidDate) < nextDate)
        .reduce((sum, inv) => sum + inv.total, 0);

      const dayHours = timeEntries
        .filter(entry => new Date(entry.date) >= date && new Date(entry.date) < nextDate)
        .reduce((sum, entry) => sum + entry.hours, 0);

      chartData.push({
        date: date.toISOString().split('T')[0],
        revenus: dayRevenue,
        heures: dayHours,
      });
    }

    // Formater les tâches
    const tasks = tasksData.map(task => ({
      id: task._id.toString(),
      displayId: task._id.toString().slice(-8).toUpperCase(),
      title: task.title,
      type: task.type,
      status: task.status,
      priority: task.priority,
    }));

    const stats = {
      revenue: {
        total: totalRevenue,
        trend: Math.round(revenueTrend * 10) / 10,
        label: "Revenus total"
      },
      objective: {
        current: monthlyRevenue,
        target: monthlyTarget,
        percent: objectivePercent,
        label: "Objectif mensuel"
      },
      hourlyRate: {
        total: hourlyRate,
        trend: 0,
        label: "Taux horaire"
      },
      pendingInvoices: {
        total: pendingInvoices.length,
        amount: pendingAmount,
        label: "Factures en attente"
      },
      paymentDelay: {
        total: avgPaymentDelay,
        trend: 0,
        label: "Délai paiement moyen"
      },
      clients: {
        total: activeClients,
        trend: 0,
        label: "Clients actifs"
      },
      projects: {
        total: user.completedProjects || 0,
        trend: 0,
        label: "Projets"
      },
      hours: {
        total: Math.round(totalHours),
        trend: 0,
        label: "Heures ce mois"
      },
      overduePayments: {
        total: overdueInvoices.length,
        amount: overdueAmount,
        label: "Paiements en retard"
      }
    };

    return NextResponse.json(
      {
        stats,
        chartData,
        tasks,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          planType: user.planType || 'gratuit',
          avatar: user.avatar,
          professions: user.professions || [],
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );

  } catch (error) {
    console.error('Erreur stats dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
