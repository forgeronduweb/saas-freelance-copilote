"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import InvoiceForm from "@/components/finance/InvoiceForm";
import { ArrowLeft, Mail, Phone, Building2, Calendar, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const [rdvDialogOpen, setRdvDialogOpen] = useState(false);
  const [rdvTitle, setRdvTitle] = useState("");
  const [rdvDate, setRdvDate] = useState("");
  const [rdvTime, setRdvTime] = useState("");
  const [rdvType, setRdvType] = useState<"Réunion" | "Appel" | "Deadline" | "Autre">("Réunion");
  const [rdvCreating, setRdvCreating] = useState(false);

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
    "Actif": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
    "Inactif": "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-700",
    "Prospect": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800",
  };

  const handleCreateInvoice = async (data: {
    clientNom: string;
    clientTelephone: string;
    clientEmail: string;
    referenceDevis: string;
    description: string;
    montantTotal: number;
    montantPaye: number;
    modePaiement: string;
    statut: string;
  }) => {
    try {
      const res = await fetch("/api/dashboard/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clientId: client.id,
          clientName: data.clientNom?.trim() || client.name,
          clientEmail: data.clientEmail?.trim() || client.email,
          notes: data.description,
          items: [{ description: data.description, quantity: 1, unitPrice: data.montantTotal }],
        }),
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const invoiceId = json?.invoice?.id as string | undefined;
        setInvoiceDialogOpen(false);
        toast.success("Facture créée");
        if (invoiceId) router.push(`/dashboard/finance/${invoiceId}`);
        return;
      }

      const payload = await res.json().catch(() => null);
      toast.error(payload?.error || "Erreur création facture");
    } catch (err) {
      console.error("Erreur création facture:", err);
      toast.error("Erreur de connexion au serveur");
    }
  };

  const handleCreateRdv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rdvTitle.trim()) return;

    setRdvCreating(true);
    try {
      const res = await fetch("/api/dashboard/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: rdvTitle,
          date: rdvDate || new Date().toISOString().split("T")[0],
          time: rdvTime || "09:00",
          type: rdvType,
          status: "Planifié",
          clientId: client.id,
        }),
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const eventId = json?.event?.id as string | undefined;

        setRdvDialogOpen(false);
        setRdvTitle("");
        setRdvDate("");
        setRdvTime("");
        setRdvType("Réunion");

        toast.success("RDV planifié");
        if (eventId) router.push(`/dashboard/planning/${eventId}`);
        return;
      }

      const payload = await res.json().catch(() => null);
      toast.error(payload?.error || "Erreur lors de la création");
    } catch (err) {
      console.error("Erreur création événement:", err);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setRdvCreating(false);
    }
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  window.location.href = `mailto:${client.email}`;
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Envoyer un email
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setInvoiceDialogOpen(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Créer une facture
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  setRdvTitle(`RDV - ${client.name}`);
                  setRdvDate(new Date().toISOString().split("T")[0]);
                  setRdvTime("09:00");
                  setRdvType("Réunion");
                  setRdvDialogOpen(true);
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Planifier un RDV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle facture</DialogTitle>
            <DialogDescription>Créez une facture associée à ce client.</DialogDescription>
          </DialogHeader>
          <InvoiceForm onSubmit={handleCreateInvoice} onCancel={() => setInvoiceDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={rdvDialogOpen} onOpenChange={setRdvDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planifier un RDV</DialogTitle>
            <DialogDescription>
              Ajoutez un événement dans votre planning pour ce client. Une fois créé, vous pourrez modifier l’heure ou annuler le RDV depuis sa page de détail.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRdv}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="rdv-title" className="text-sm">Titre *</label>
                <Input
                  id="rdv-title"
                  placeholder="Nom du RDV"
                  value={rdvTitle}
                  onChange={(e) => setRdvTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="rdv-date" className="text-sm">Date</label>
                  <Input
                    id="rdv-date"
                    type="date"
                    value={rdvDate}
                    onChange={(e) => setRdvDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="rdv-time" className="text-sm">Heure</label>
                  <Input
                    id="rdv-time"
                    type="time"
                    value={rdvTime}
                    onChange={(e) => setRdvTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="rdv-type" className="text-sm">Type</label>
                <select
                  id="rdv-type"
                  value={rdvType}
                  onChange={(e) => setRdvType(e.target.value as typeof rdvType)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Réunion">Réunion</option>
                  <option value="Appel">Appel</option>
                  <option value="Deadline">Deadline</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRdvDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={rdvCreating}>
                {rdvCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Planifier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
