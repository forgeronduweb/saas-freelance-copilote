import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Invoice from "@/lib/models/Invoice";
import Mission from "@/lib/models/Mission";
import Quote from "@/lib/models/Quote";
import Review from "@/lib/models/Review";
import TimeEntry from "@/lib/models/TimeEntry";
import User from "@/lib/models/User";
import { config } from "@/lib/config";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };

    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = addMonths(thisMonthStart, -1);

    const [paidInvoices, quotes, missions, timeEntries, reviews] = await Promise.all([
      Invoice.find({ userId: user._id, status: "Payée" }),
      Quote.find({ userId: user._id }),
      Mission.find({ userId: user._id }),
      TimeEntry.find({ userId: user._id }),
      Review.find({ reviewedId: user._id, reviewType: "client-to-freelance" }),
    ]);

    const paidThisMonth = paidInvoices.filter(
      (inv) => inv.paidDate && new Date(inv.paidDate) >= thisMonthStart
    );
    const monthlyRevenue = paidThisMonth.reduce((sum, inv) => sum + (inv.total || 0), 0);

    const monthlyTarget = Number(user.monthlyTarget) || 0;
    const objectivePercent =
      monthlyTarget > 0 ? Math.min(100, Math.round((monthlyRevenue / monthlyTarget) * 100)) : 0;

    const completedThisMonth = missions.filter(
      (m) => m.status === "Terminé" && m.updatedAt && new Date(m.updatedAt) >= thisMonthStart
    ).length;
    const completedLastMonth = missions.filter(
      (m) =>
        m.status === "Terminé" &&
        m.updatedAt &&
        new Date(m.updatedAt) >= lastMonthStart &&
        new Date(m.updatedAt) < thisMonthStart
    ).length;

    const billableThisMonthHours = timeEntries
      .filter((t) => t.billable && t.date && new Date(t.date) >= thisMonthStart)
      .reduce((sum, t) => sum + (t.hours || 0), 0);

    const billableLastMonthHours = timeEntries
      .filter(
        (t) => t.billable && t.date && new Date(t.date) >= lastMonthStart && new Date(t.date) < thisMonthStart
      )
      .reduce((sum, t) => sum + (t.hours || 0), 0);

    const paidInvoicesWithDelay = paidInvoices.filter((inv) => inv.paidDate && inv.issueDate);
    const avgPaymentDelay =
      paidInvoicesWithDelay.length > 0
        ? Math.round(
            paidInvoicesWithDelay.reduce((sum, inv) => {
              const delayDays =
                (new Date(inv.paidDate!).getTime() - new Date(inv.issueDate).getTime()) /
                (1000 * 60 * 60 * 24);
              return sum + delayDays;
            }, 0) / paidInvoicesWithDelay.length
          )
        : 0;

    const quotesConsidered = quotes.filter((q) => q.status !== "Brouillon");
    const conversionRate =
      quotesConsidered.length > 0
        ? Math.round((quotesConsidered.filter((q) => q.status === "Accepté").length / quotesConsidered.length) * 100)
        : 0;

    const reviewRatings = reviews.map((r) => Number(r.rating) || 0).filter((n) => n > 0);
    const clientSatisfaction =
      reviewRatings.length > 0
        ? Math.round((reviewRatings.reduce((sum, r) => sum + r, 0) / reviewRatings.length) * 10) / 10
        : 0;

    const revenueByClient = new Map<string, number>();
    const invoicesByClient = new Map<string, number>();
    for (const inv of paidInvoices) {
      const name = inv.clientName || "Client";
      revenueByClient.set(name, (revenueByClient.get(name) || 0) + (inv.total || 0));
      invoicesByClient.set(name, (invoicesByClient.get(name) || 0) + 1);
    }

    const uniquePaidClients = Array.from(invoicesByClient.keys());
    const retainedClients = uniquePaidClients.filter((name) => (invoicesByClient.get(name) || 0) >= 2).length;
    const retentionRate =
      uniquePaidClients.length > 0 ? Math.round((retainedClients / uniquePaidClients.length) * 100) : 0;

    const topClients = Array.from(revenueByClient.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, revenue]) => ({
        name,
        revenue,
        projects: invoicesByClient.get(name) || 0,
      }));

    const monthSeries = Array.from({ length: 6 }).map((_, i) => {
      const monthStart = addMonths(thisMonthStart, -i);
      const nextMonthStart = addMonths(thisMonthStart, -i + 1);
      const amount = paidInvoices
        .filter((inv) => inv.paidDate && new Date(inv.paidDate) >= monthStart && new Date(inv.paidDate) < nextMonthStart)
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
      return {
        month: MONTHS_FR[monthStart.getMonth()],
        amount,
      };
    });

    const maxMonthRevenue = Math.max(1, ...monthSeries.map((m) => m.amount));
    const revenueByMonth = monthSeries.map((m) => ({
      month: m.month,
      amount: m.amount,
      percent: Math.round((m.amount / maxMonthRevenue) * 100),
    }));

    const revenueTotal = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const colorCycle = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500"];
    const revenueByType = Array.from(revenueByClient.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([type, amount], index) => ({
        type,
        percent: revenueTotal > 0 ? Math.round((amount / revenueTotal) * 100) : 0,
        color: colorCycle[index % colorCycle.length],
      }))
      .filter((x) => x.percent > 0);

    const reportingData = {
      objective: {
        current: monthlyRevenue,
        target: monthlyTarget,
        percent: objectivePercent,
      },
      stats: {
        projectsCompleted: missions.filter((m) => m.status === "Terminé").length,
        projectsGrowth: completedThisMonth - completedLastMonth,
        hoursBilled: Math.round(billableThisMonthHours),
        hoursGrowth: Math.round(billableThisMonthHours - billableLastMonthHours),
        hourlyRate: Number(user.hourlyRate) || 0,
      },
      revenueByMonth,
      revenueByType,
      topClients,
      performance: {
        conversionRate,
        avgPaymentDelay,
        clientSatisfaction,
        retentionRate,
      },
    };

    return NextResponse.json(reportingData);
  } catch (error) {
    console.error("Erreur API reporting:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
