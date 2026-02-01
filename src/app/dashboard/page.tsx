"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Clock, Target, DollarSign, FileText, Calendar, AlertTriangle, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  revenue: { total: number; trend: number; label: string };
  objective: { current: number; target: number; percent: number; label: string };
  hourlyRate: { total: number; trend: number; label: string };
  pendingInvoices: { total: number; amount: number; label: string };
  paymentDelay: { total: number; trend: number; label: string };
  clients: { total: number; trend: number; label: string };
  projects: { total: number; trend: number; label: string };
  hours: { total: number; trend: number; label: string };
  overduePayments: { total: number; amount: number; label: string };
}

type PlanningEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  status: string;
};

type Mission = {
  id: string;
  title: string;
  client: string;
  status: "To-do" | "En cours" | "Terminé";
  dueDate?: string;
  verificationStatus?: "Aucun" | "En vérification" | "Validée" | "Refusée";
  verificationMessage?: string;
};

type Quote = {
  id: string;
  clientId: string;
  clientName: string;
  total: number;
  validUntil: string;
  status: "Brouillon" | "Envoyé" | "Accepté" | "Refusé" | "Expiré";
  createdAt: string;
};

type Invoice = {
  id: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "Payée" | "En attente" | "En retard" | "Brouillon";
};

type ActivityItem =
  | {
      key: string;
      kind: "planning";
      title: string;
      date?: string;
      time?: string;
      status: string;
      meta?: string;
    }
  | {
      key: string;
      kind: "mission";
      title: string;
      date?: string;
      status: string;
      meta?: string;
      verificationStatus?: Mission["verificationStatus"];
    }
  | {
      key: string;
      kind: "quote";
      title: string;
      date?: string;
      status: string;
      meta?: string;
    }
  | {
      key: string;
      kind: "invoice";
      title: string;
      date?: string;
      status: string;
      meta?: string;
    };

const chartConfig = {
  revenus: {
    label: "Revenus",
    color: "#f97316",
  },
  heures: {
    label: "Heures",
    color: "#fbbf24",
  },
} satisfies ChartConfig;


 

type ChartDataPoint = {
  date: string;
  revenus: number;
  heures: number;
};

interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  planType: string;
  professions?: string[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<PlanningEvent[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Formater le montant en FCFA
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(amount);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, planningRes, quotesRes, financeRes, missionsRes] = await Promise.all([
          fetch("/api/dashboard/stats", { credentials: "include" }),
          fetch("/api/dashboard/planning", { credentials: "include" }),
          fetch("/api/dashboard/quotes", { credentials: "include" }),
          fetch("/api/dashboard/finance", { credentials: "include" }),
          fetch("/api/dashboard/missions", { credentials: "include" }),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
          setChartData(data.chartData || []);
          setUser(data.user || null);
        }

        if (planningRes.ok) {
          const data = await planningRes.json();
          const nextEvents = Array.isArray(data?.events) ? (data.events as PlanningEvent[]) : [];
          setEvents(nextEvents);
        }

        if (quotesRes.ok) {
          const data = await quotesRes.json();
          setQuotes(Array.isArray(data?.quotes) ? data.quotes : []);
        }

        if (financeRes.ok) {
          const data = await financeRes.json();
          setInvoices(Array.isArray(data?.invoices) ? data.invoices : []);
        }

        if (missionsRes.ok) {
          const data = await missionsRes.json();
          setMissions(Array.isArray(data?.missions) ? (data.missions as Mission[]) : []);
        }
      } catch (error) {
        console.error("Erreur fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quotesToFollowUp = quotes.filter((q) => q.status === "Envoyé");
  const nextEvents = [...events]
    .sort((a, b) => {
      const aKey = `${a.date} ${a.time || "00:00"}`;
      const bKey = `${b.date} ${b.time || "00:00"}`;
      return aKey.localeCompare(bKey);
    })
    .slice(0, 4);

  // Obtenir le moment de la journée pour le message de bienvenue
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const activityFeed = useMemo<ActivityItem[]>(() => {
    const startOfWeek = (d: Date) => {
      const date = new Date(d);
      const day = (date.getDay() + 6) % 7;
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const endOfWeek = (d: Date) => {
      const start = startOfWeek(d);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return end;
    };

    const toTs = (date?: string, time?: string) => {
      if (!date) return 0;
      const iso = `${date}T${time || "00:00"}:00`;
      const d = new Date(iso);
      const ts = d.getTime();
      return Number.isNaN(ts) ? 0 : ts;
    };

    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const inCurrentWeek = (date?: string, time?: string) => {
      const ts = toTs(date, time);
      if (!ts) return false;
      return ts >= weekStart.getTime() && ts <= weekEnd.getTime();
    };

    const isOverdue = (date?: string, time?: string) => {
      const ts = toTs(date, time);
      if (!ts) return false;
      return ts < todayStart.getTime();
    };

    const daysUntil = (date?: string, time?: string) => {
      const ts = toTs(date, time);
      if (!ts) return Number.POSITIVE_INFINITY;
      const diff = ts - now.getTime();
      return Math.ceil(diff / (24 * 60 * 60 * 1000));
    };

    const scoreItem = (item: ActivityItem) => {
      const time = "time" in item ? item.time : undefined;
      const dueInDays = daysUntil(item.date, time);

      let score = 0;

      if (isOverdue(item.date, time)) score += 200;
      if (inCurrentWeek(item.date, time)) score += 80;
      if (dueInDays <= 2) score += 60;
      if (item.kind === "mission" && item.status === "En cours") score += 50;
      if (item.kind === "planning" && (item.status || "").toLowerCase().includes("plan")) score += 10;
      if (item.kind === "invoice" && item.status === "En retard") score += 120;
      if (item.kind === "invoice" && item.status === "En attente") score += 60;
      if (item.kind === "quote" && item.status === "Envoyé") score += 50;

      return score;
    };

    const items: ActivityItem[] = [
      ...events.map((e) => ({
        key: `planning-${e.id}`,
        kind: "planning" as const,
        title: e.title,
        date: e.date,
        time: e.time || undefined,
        status: e.status,
        meta: e.type,
      })),
      ...missions.map((m) => ({
        key: `mission-${m.id}`,
        kind: "mission" as const,
        title: m.title,
        date: m.dueDate,
        status: m.status,
        meta: m.client,
        verificationStatus: m.verificationStatus,
      })),
      ...quotes.map((q) => ({
        key: `quote-${q.id}`,
        kind: "quote" as const,
        title: `Devis ${q.id}`,
        date: q.validUntil,
        status: q.status,
        meta: q.clientName,
      })),
      ...invoices.map((inv) => ({
        key: `invoice-${inv.id}`,
        kind: "invoice" as const,
        title: `Facture ${inv.id}`,
        date: inv.dueDate,
        status: inv.status,
        meta: inv.client,
      })),
    ];

    const filtered = items.filter((item) => {
      const time = "time" in item ? item.time : undefined;

      if (item.kind === "planning") {
        const statusLower = (item.status || "").toLowerCase();
        if (statusLower.includes("termin")) return false;
        return inCurrentWeek(item.date, time) || isOverdue(item.date, time);
      }

      if (item.kind === "mission") {
        if (item.status === "Terminé") return false;
        if (item.status === "En cours") return true;
        return inCurrentWeek(item.date) || isOverdue(item.date);
      }

      if (item.kind === "quote") {
        return item.status === "Envoyé" && (inCurrentWeek(item.date) || isOverdue(item.date));
      }

      if (item.kind === "invoice") {
        if (item.status === "Payée") return false;
        return inCurrentWeek(item.date) || isOverdue(item.date);
      }

      return false;
    });

    return filtered
      .map((item) => ({ item, score: scoreItem(item) }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aTs = toTs(a.item.date, "time" in a.item ? a.item.time : undefined);
        const bTs = toTs(b.item.date, "time" in b.item ? b.item.time : undefined);
        return aTs - bTs;
      })
      .map(({ item }) => item)
      .slice(0, 5);
  }, [events, missions, quotes, invoices]);

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      {user && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user.firstName} 👋
            </h1>
            <p className="text-muted-foreground">
              {user.userType === 'freelance' 
                ? "Voici un aperçu de votre activité freelance"
                : "Voici un aperçu de vos projets en cours"
              }
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {user.planType || 'Gratuit'}
          </Badge>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Objectif mensuel */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {stats?.objective?.label || "Objectif mensuel"}
            </CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? "..." : `${stats?.objective?.percent || 0}%`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-2">
              {formatCurrency(stats?.objective?.current || 0)} / {formatCurrency(stats?.objective?.target || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Revenus */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {stats?.revenue.label || "Revenus total"}
              </div>
              <span className={`flex items-center text-xs ${(stats?.revenue.trend || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {(stats?.revenue.trend || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {(stats?.revenue.trend || 0) >= 0 ? '+' : ''}{stats?.revenue.trend || 0}%
              </span>
            </CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? "..." : formatCurrency(stats?.revenue.total || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {(stats?.revenue.trend || 0) >= 0 ? "En hausse ce mois" : "En baisse ce mois"}
            </p>
          </CardContent>
        </Card>

        {/* Taux horaire */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {stats?.hourlyRate?.label || "Taux horaire moyen"}
              </div>
              <span className={`flex items-center text-xs ${(stats?.hourlyRate?.trend || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {(stats?.hourlyRate?.trend || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {(stats?.hourlyRate?.trend || 0) >= 0 ? '+' : ''}{stats?.hourlyRate?.trend || 0}%
              </span>
            </CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? "..." : `${(stats?.hourlyRate?.total || 0).toLocaleString('fr-FR')} FCFA/h`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {(stats?.hourlyRate?.trend || 0) >= 0 ? "Bon positionnement" : "À revoir"}
            </p>
          </CardContent>
        </Card>

        {/* Factures en attente */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {stats?.pendingInvoices?.label || "Factures en attente"}
            </CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? "..." : stats?.pendingInvoices?.total || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats?.pendingInvoices?.amount || 0)} en attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-start">
        {/* Bloc large: activité */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Aperçu d&apos;activité</CardTitle>
              <CardDescription>Vue du mois en cours</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <ChartContainer config={chartConfig} className="h-[140px] sm:h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart accessibilityLayer data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={4}
                      axisLine={false}
                      tickFormatter={(value) => {
                        return new Date(value).toLocaleDateString("fr-FR", {
                          weekday: "short",
                        });
                      }}
                    />
                    <Bar
                      dataKey="revenus"
                      fill="var(--color-revenus)"
                      radius={[4, 4, 0, 0]}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={false}
                      defaultIndex={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between">
                {stats?.hours.label || "Heures ce mois"}
                <span className={`flex items-center text-xs ${(stats?.hours.trend || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {(stats?.hours.trend || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {(stats?.hours.trend || 0) >= 0 ? '+' : ''}{stats?.hours.trend || 0}%
                </span>
              </CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? "..." : `${stats?.hours.total || 0}h`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Performance {(stats?.hours.trend || 0) >= 0 ? "stable" : "en baisse"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertes urgentes
              </CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? "..." : (stats?.overduePayments?.total || 0) + (quotesToFollowUp.length > 0 ? 1 : 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Factures en retard</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stats?.overduePayments?.amount || 0)}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/finance">Voir</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Relances prospects</p>
                  <p className="text-xs text-muted-foreground">
                    {quotesToFollowUp.length} devis à relancer
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/prospection">Ouvrir</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {stats?.paymentDelay?.label || "Délai paiement moyen"}
                </div>
                <span className={`flex items-center text-xs ${(stats?.paymentDelay?.trend || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {(stats?.paymentDelay?.trend || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {(stats?.paymentDelay?.trend || 0) >= 0 ? '+' : ''}{stats?.paymentDelay?.trend || 0}j
                </span>
              </CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? "..." : `${stats?.paymentDelay?.total || 0}j`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {(stats?.paymentDelay?.trend || 0) >= 0 ? "Délais longs" : "Bon rythme"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Calendrier</CardTitle>
              <CardDescription>Vos prochaines échéances et rendez-vous</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/projets/planning">Voir le planning</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun événement à afficher.</p>
            ) : (
              nextEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString("fr-FR")} {e.time ? `• ${e.time}` : ""} • {e.type}
                    </p>
                  </div>
                  <Badge variant="outline">{e.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Relances à faire</CardTitle>
            <CardDescription>Devis envoyés</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quotesToFollowUp.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune relance.</p>
            ) : (
              quotesToFollowUp.slice(0, 4).map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{q.clientName}</p>
                    <p className="text-xs text-muted-foreground">{q.id} • {formatCurrency(q.total)}</p>
                  </div>
                  <Badge variant="secondary">{q.status}</Badge>
                </div>
              ))
            )}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/prospection">Ouvrir Prospection & CRM</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Flux d'activité</CardTitle>
            <CardDescription>Rappels urgents de la semaine.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {activityFeed.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune activité à afficher.</p>
          ) : (
            <div className="space-y-2">
              {activityFeed.map((item) => {
                const href =
                  item.kind === "planning"
                    ? "/dashboard/projets/planning"
                    : item.kind === "mission"
                      ? "/dashboard/projets/missions"
                      : item.kind === "quote"
                        ? "/dashboard/prospection"
                        : "/dashboard/finance";

                const titleIcon =
                  item.kind === "planning" ? (
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  ) : item.kind === "mission" ? (
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  ) : item.kind === "quote" ? (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  );

                const formattedDate = item.date
                  ? new Date(item.date).toLocaleDateString("fr-FR")
                  : "";
                const timePart =
                  item.kind === "planning" && item.time ? ` • ${item.time}` : "";

                return (
                  <Link
                    key={item.key}
                    href={href}
                    className="block rounded-lg border p-3 hover:bg-accent/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {titleIcon}
                          <p className="text-sm font-medium truncate">{item.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.meta ? item.meta : ""}
                          {formattedDate ? ` • ${formattedDate}${timePart}` : ""}
                          {item.kind === "mission" && item.verificationStatus
                            ? ` • Vérification: ${item.verificationStatus}`
                            : ""}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {item.status}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
