"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Phone, Building2, Calendar, FileText, Loader2 } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  projects: number;
  totalSpent: number;
  joinedDate: string;
};

export default function ClientDetailPage() {
  const params = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/dashboard/clients/${params.id}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setClient(data.client);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Erreur chargement client:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchClient();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h1 className="text-2xl">Client non trouvé</h1>
        <Button asChild>
          <Link href="/dashboard/prospection/contacts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux clients
          </Link>
        </Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    "Actif": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Inactif": "bg-gray-50 text-gray-700 border-gray-200",
    "Prospect": "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/prospection/contacts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {client.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg">{client.name}</h1>
              <Badge variant="secondary" className={statusColors[client.status]}>{client.status}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">{client.company}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {client.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {client.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entreprise</p>
                    <p className="flex items-center gap-2"><Building2 className="h-4 w-4" /> {client.company}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Projets</p>
                    <p>{client.projects} projet(s)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total dépensé</p>
                    <p>{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(client.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client depuis</p>
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(client.joinedDate).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Envoyer un email
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Créer une facture
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Planifier un RDV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
