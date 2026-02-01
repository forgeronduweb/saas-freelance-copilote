"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, ExternalLink, Landmark, MessageSquare, Link2 } from "lucide-react";

type IntegrationKey = "google_calendar" | "slack" | "bank";

type IntegrationItem = {
  key: IntegrationKey;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  learnMoreUrl: string;
};

const integrations: IntegrationItem[] = [
  {
    key: "google_calendar",
    title: "Google Calendar",
    description: "Synchronisez vos RDV et vos échéances.",
    icon: Calendar,
    learnMoreUrl: "https://developers.google.com/calendar/api",
  },
  {
    key: "slack",
    title: "Slack",
    description: "Recevez des notifications en temps réel.",
    icon: MessageSquare,
    learnMoreUrl: "https://api.slack.com/",
  },
  {
    key: "bank",
    title: "Connexion bancaire",
    description: "Rapprochez automatiquement paiements et factures.",
    icon: Landmark,
    learnMoreUrl: "https://plaid.com/docs/",
  },
];

export default function IntegrationsPage() {
  const [connected, setConnected] = useState<Record<IntegrationKey, boolean>>({
    google_calendar: false,
    slack: false,
    bank: false,
  });

  const toggle = (key: IntegrationKey) => {
    setConnected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" /> Intégrations
          </CardTitle>
          <CardDescription>
            Connectez vos outils pour centraliser votre activité et automatiser les suivis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((integration, index) => {
            const Icon = integration.icon;
            const isConnected = connected[integration.key];

            return (
              <div key={integration.key}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border bg-muted/30">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{integration.title}</p>
                        {isConnected ? (
                          <Badge>Connecté</Badge>
                        ) : (
                          <Badge variant="outline">Non connecté</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                      <a
                        href={integration.learnMoreUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        En savoir plus <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isConnected ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggle(integration.key)}
                    >
                      {isConnected ? "Déconnecter" : "Connecter"}
                    </Button>
                  </div>
                </div>

                {index < integrations.length - 1 && <Separator className="my-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
