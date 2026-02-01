"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, BarChart3, PieChart, LineChart, Target, Loader2 } from "lucide-react";

type ReportingData = {
  objective: { current: number; target: number; percent: number };
  stats: { projectsCompleted: number; projectsGrowth: number; hoursBilled: number; hoursGrowth: number; hourlyRate: number };
  revenueByMonth: { month: string; amount: number; percent: number }[];
  revenueByType: { type: string; percent: number; color: string }[];
  topClients: { name: string; revenue: number; projects: number }[];
  performance: { conversionRate: number; avgPaymentDelay: number; clientSatisfaction: number; retentionRate: number };
};

function formatFCFA(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA";
}

export default function ReportingPage() {
  const [data, setData] = useState<ReportingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/reporting");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Erreur fetch reporting:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Target className="h-3 w-3" /> Objectif mensuel
            </CardDescription>
            <CardTitle className="text-2xl">{data.objective.percent}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={data.objective.percent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatFCFA(data.objective.current)} / {formatFCFA(data.objective.target)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Projets terminés</CardDescription>
            <CardTitle className="text-2xl">{data.stats.projectsCompleted}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +{data.stats.projectsGrowth} vs mois dernier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Heures facturées</CardDescription>
            <CardTitle className="text-2xl">{data.stats.hoursBilled}h</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +{data.stats.hoursGrowth}% ce mois
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux horaire moyen</CardDescription>
            <CardTitle className="text-2xl">{data.stats.hourlyRate.toLocaleString("fr-FR")} FCFA/h</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">stable</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Revenus par mois
            </CardTitle>
            <CardDescription>Évolution de vos revenus sur 6 mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.revenueByMonth.map((item) => (
                <div key={item.month} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.month}</span>
                    <span className="font-medium">{formatFCFA(item.amount)}</span>
                  </div>
                  <Progress value={item.percent} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" /> Répartition par type
            </CardTitle>
            <CardDescription>Répartition de vos revenus par type de projet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.revenueByType.map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.type}</span>
                      <span className="font-medium">{item.percent}%</span>
                    </div>
                    <Progress value={item.percent} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" /> Top clients
            </CardTitle>
            <CardDescription>Vos meilleurs clients ce trimestre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.projects} projet(s)</p>
                    </div>
                  </div>
                  <Badge variant="outline">{formatFCFA(client.revenue)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Indicateurs clés de performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Taux de conversion prospects</span>
                <span className="font-medium text-emerald-600">{data.performance.conversionRate}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Délai moyen de paiement</span>
                <span className="font-medium">{data.performance.avgPaymentDelay} jours</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Satisfaction client</span>
                <span className="font-medium text-emerald-600">{data.performance.clientSatisfaction}/5</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Taux de fidélisation</span>
                <span className="font-medium text-emerald-600">{data.performance.retentionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
