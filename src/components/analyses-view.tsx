"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Calculator, Loader2, Target, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent } from "@/components/ui/tabs";

type ReportingData = {
  objective: { current: number; target: number; percent: number };
  stats: {
    projectsCompleted: number;
    projectsGrowth: number;
    hoursBilled: number;
    hoursGrowth: number;
    hourlyRate: number;
  };
  revenueByMonth: { month: string; amount: number; percent: number }[];
  revenueByType: { type: string; percent: number; color: string }[];
  topClients: { name: string; revenue: number; projects: number }[];
  performance: {
    conversionRate: number;
    avgPaymentDelay: number;
    clientSatisfaction: number;
    retentionRate: number;
  };
};

export type AnalysesTab = "rapports" | "tjm" | "academy";

function formatFCFA(amount: number): string {
  return amount.toLocaleString("fr-FR") + " FCFA";
}

export function AnalysesView({ activeTab }: { activeTab: AnalysesTab }) {
  const [data, setData] = useState<ReportingData | null>(null);
  const [loading, setLoading] = useState(true);

  const [targetNetMonthly, setTargetNetMonthly] = useState("1500000");
  const [chargesRatePct, setChargesRatePct] = useState("35");
  const [billableDays, setBillableDays] = useState("18");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/reporting", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Erreur fetch analyses:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tjm = useMemo(() => {
    const net = Number(targetNetMonthly) || 0;
    const charges = Math.min(Math.max(Number(chargesRatePct) || 0, 0), 95) / 100;
    const days = Math.max(Number(billableDays) || 0, 1);

    const grossNeeded = net / (1 - charges);
    const tjmValue = grossNeeded / days;

    return {
      grossNeeded,
      tjm: tjmValue,
    };
  }, [targetNetMonthly, chargesRatePct, billableDays]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="rapports" className="mt-6">
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
                <CardDescription>Conversion devis</CardDescription>
                <CardTitle className="text-2xl">{data.performance.conversionRate}%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Basé sur les devis envoyés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Délai paiement moyen</CardDescription>
                <CardTitle className="text-2xl">{data.performance.avgPaymentDelay}j</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">À surveiller pour la trésorerie</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Satisfaction</CardDescription>
                <CardTitle className="text-2xl">{data.performance.clientSatisfaction}/5</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Indicateur de fidélisation</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenus par mois</CardTitle>
                <CardDescription>Évolution sur 6 mois</CardDescription>
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
                <CardTitle>Provenance / types</CardTitle>
                <CardDescription>Répartition des revenus</CardDescription>
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
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Top clients</CardTitle>
              <CardDescription>Vos meilleurs clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.topClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between p-3 rounded-lg border">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tjm" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" /> Calculateur de TJM
              </CardTitle>
              <CardDescription>
                Ajuste ton tarif à partir de ton objectif de salaire et de tes charges.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Objectif net mensuel (FCFA)</label>
                  <Input
                    value={targetNetMonthly}
                    onChange={(e) => setTargetNetMonthly(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Taux de charges (%)</label>
                  <Input
                    value={chargesRatePct}
                    onChange={(e) => setChargesRatePct(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jours facturables / mois</label>
                  <Input
                    value={billableDays}
                    onChange={(e) => setBillableDays(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Chiffre d'affaires mensuel à viser</p>
                  <p className="text-2xl font-semibold">{formatFCFA(Math.round(tjm.grossNeeded))}</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">TJM recommandé</p>
                  <p className="text-2xl font-semibold">{formatFCFA(Math.round(tjm.tjm))} / jour</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Plus tu augmentes tes jours facturables, plus ton TJM nécessaire baisse (et inversement).
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academy" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Academy
                </CardTitle>
                <CardDescription>Ressources pour améliorer ta prospection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <p className="font-medium text-sm">Construire un pipeline simple</p>
                  <p className="text-xs text-muted-foreground">Contacté → Discussion → Devis → Gagné</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="font-medium text-sm">Relancer sans harceler</p>
                  <p className="text-xs text-muted-foreground">Cadencer les relances et apporter de la valeur</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="font-medium text-sm">Améliorer ton TJM</p>
                  <p className="text-xs text-muted-foreground">Positionnement, packaging, preuves sociales</p>
                </div>
                <Button variant="outline" className="w-full">Bientôt disponible</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>À connecter plus tard</CardTitle>
                <CardDescription>Quand tu brancheras du contenu réel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 rounded-lg border">
                  <p className="text-sm">Guides (markdown), templates, checklists</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm">Parcours onboarding “commercial”</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm">Mini-cours / vidéos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
