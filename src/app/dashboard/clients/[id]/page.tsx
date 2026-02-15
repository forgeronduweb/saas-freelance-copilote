"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { NotionPropertyRow } from "@/components/ui/notion-property-row";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InvoiceForm from "@/components/finance/InvoiceForm";
import { ArrowLeft, Mail, Phone, Building2, Calendar, Clock, FileText, Loader2, Tag } from "lucide-react";
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

type Mission = {
  id: string;
  clientId: string;
  title: string;
  client: string;
  status: "To-do" | "En cours" | "Terminé";
  priority?: "Basse" | "Moyenne" | "Haute";
  dueDate?: string;
  evidenceUrls?: string[];
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
  clientId: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "Payée" | "En attente" | "En retard" | "Brouillon";
};

type PlanningEvent = {
  id: string;
  clientId: string;
  title: string;
  date: string;
  time: string;
  type: string;
  status: string;
  description?: string;
};

function getEvidenceKind(url: string): "image" | "video" | "link" {
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  if (clean.endsWith(".png") || clean.endsWith(".jpg") || clean.endsWith(".jpeg") || clean.endsWith(".webp") || clean.endsWith(".gif")) {
    return "image";
  }
  if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".ogg")) {
    return "video";
  }
  return "link";
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [relatedLoading, setRelatedLoading] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [events, setEvents] = useState<PlanningEvent[]>([]);

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

  const loadRelated = async () => {
    if (!client?.id) return;

    setRelatedLoading(true);
    try {
      const [missionsRes, quotesRes, financeRes, planningRes] = await Promise.all([
        fetch(`/api/dashboard/missions?clientId=${encodeURIComponent(client.id)}`, { credentials: "include" })
          .then(async (r) => (r.ok ? r.json() : { missions: [] }))
          .then((d) => (Array.isArray(d?.missions) ? (d.missions as Mission[]) : [])),
        fetch(`/api/dashboard/quotes?clientId=${encodeURIComponent(client.id)}`, { credentials: "include" })
          .then(async (r) => (r.ok ? r.json() : { quotes: [] }))
          .then((d) => (Array.isArray(d?.quotes) ? (d.quotes as Quote[]) : [])),
        fetch(`/api/dashboard/finance?clientId=${encodeURIComponent(client.id)}`, { credentials: "include" })
          .then(async (r) => (r.ok ? r.json() : { invoices: [] }))
          .then((d) => (Array.isArray(d?.invoices) ? (d.invoices as Invoice[]) : [])),
        fetch(`/api/dashboard/planning?clientId=${encodeURIComponent(client.id)}`, { credentials: "include" })
          .then(async (r) => (r.ok ? r.json() : { events: [] }))
          .then((d) => (Array.isArray(d?.events) ? (d.events as PlanningEvent[]) : [])),
      ]);

      setMissions(missionsRes);
      setQuotes(quotesRes);
      setInvoices(financeRes);
      setEvents(planningRes);
    } catch (err) {
      console.error("Erreur chargement données client:", err);
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    void loadRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id]);

  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent<{ clientId?: string }>).detail;
      const targetClientId = typeof detail?.clientId === "string" ? detail.clientId : undefined;
      if (!client?.id) return;
      if (targetClientId && targetClientId !== client.id) return;
      void loadRelated();
    };

    window.addEventListener("missions:refresh", handler as EventListener);
    return () => {
      window.removeEventListener("missions:refresh", handler as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id]);

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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Missions</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/projets?tab=missions">Voir le board</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {relatedLoading ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                </div>
              ) : missions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune mission liée à ce contact.</p>
              ) : (
                <div className="space-y-3">
                  {missions.map((m) => (
                    <div key={m.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{m.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.status}
                            {m.priority ? ` • ${m.priority}` : ""}
                            {m.dueDate ? ` • ${m.dueDate}` : ""}
                          </p>
                        </div>
                      </div>

                      {Array.isArray(m.evidenceUrls) && m.evidenceUrls.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-muted-foreground">Preuves / médias</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {m.evidenceUrls.slice(0, 6).map((url) => {
                              const kind = getEvidenceKind(url);
                              if (kind === "image") {
                                return (
                                  <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block overflow-hidden rounded-md border bg-muted/20"
                                  >
                                    <Image
                                      src={url}
                                      alt="Preuve"
                                      width={800}
                                      height={320}
                                      sizes="(max-width: 640px) 100vw, 50vw"
                                      className="h-40 w-full object-cover"
                                      unoptimized
                                    />
                                  </a>
                                );
                              }
                              if (kind === "video") {
                                return (
                                  <div key={url} className="overflow-hidden rounded-md border bg-muted/20">
                                    <video src={url} controls className="h-40 w-full object-cover" />
                                  </div>
                                );
                              }
                              return (
                                <a
                                  key={url}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm underline break-all"
                                >
                                  {url}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Devis</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/finance/devis">Tous les devis</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {relatedLoading ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                </div>
              ) : quotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun devis pour ce contact.</p>
              ) : (
                <div className="space-y-2">
                  {quotes.slice(0, 6).map((q) => (
                    <Link
                      key={q.id}
                      href={`/dashboard/finance/devis/${q.id}`}
                      className="block rounded-lg border p-3 hover:bg-accent/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{q.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Intl.NumberFormat("fr-CI", {
                              style: "currency",
                              currency: "XOF",
                            }).format(q.total)}
                            {q.validUntil ? ` • Valide jusqu’au ${q.validUntil}` : ""}
                          </p>
                        </div>
                        <Badge variant="secondary">{q.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Factures</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/finance/factures">Toutes les factures</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {relatedLoading ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                </div>
              ) : invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune facture pour ce contact.</p>
              ) : (
                <div className="space-y-2">
                  {invoices.slice(0, 6).map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/dashboard/finance/${inv.id}`}
                      className="block rounded-lg border p-3 hover:bg-accent/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{inv.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Intl.NumberFormat("fr-CI", {
                              style: "currency",
                              currency: "XOF",
                            }).format(inv.amount)}
                            {inv.dueDate ? ` • Échéance ${inv.dueDate}` : ""}
                          </p>
                        </div>
                        <Badge variant="secondary">{inv.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Agenda</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/planning">Voir l’agenda</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {relatedLoading ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                </div>
              ) : events.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun événement planifié pour ce contact.</p>
              ) : (
                <div className="space-y-2">
                  {events.slice(0, 8).map((ev) => (
                    <Link
                      key={ev.id}
                      href={`/dashboard/planning/${ev.id}`}
                      className="block rounded-lg border p-3 hover:bg-accent/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {ev.date}
                            {ev.time ? ` • ${ev.time}` : ""}
                            {ev.type ? ` • ${ev.type}` : ""}
                          </p>
                        </div>
                        <Badge variant="secondary">{ev.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
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

      <Sheet open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Nouvelle facture</SheetTitle>
            <SheetDescription>Créez une facture associée à ce client.</SheetDescription>
          </SheetHeader>
          <InvoiceForm onSubmit={handleCreateInvoice} onCancel={() => setInvoiceDialogOpen(false)} />
        </SheetContent>
      </Sheet>

      <Sheet open={rdvDialogOpen} onOpenChange={setRdvDialogOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col">
          <SheetHeader className="pb-2 shrink-0">
            <SheetTitle>Planifier un RDV</SheetTitle>
            <SheetDescription>
              Ajoutez un événement dans votre planning pour ce client. Une fois créé, vous pourrez modifier l’heure ou annuler le RDV depuis sa page de détail.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreateRdv} className="flex flex-col flex-1 min-h-0 gap-4">
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
              <div className="space-y-4 pb-2">
                <div className="px-1">
                  <Input
                    id="rdv-title"
                    placeholder="Nom du RDV"
                    value={rdvTitle}
                    onChange={(e) => setRdvTitle(e.target.value)}
                    required
                    className="h-12 px-0 border-0 bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight focus-visible:ring-0"
                  />
                </div>

                <div className="rounded-xl border bg-background divide-y">
                  <NotionPropertyRow label="Date" icon={<Calendar className="h-4 w-4" />}>
                    <Input
                      id="rdv-date"
                      type="date"
                      value={rdvDate}
                      onChange={(e) => setRdvDate(e.target.value)}
                      className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                    />
                  </NotionPropertyRow>
                  <NotionPropertyRow label="Heure" icon={<Clock className="h-4 w-4" />}>
                    <Input
                      id="rdv-time"
                      type="time"
                      value={rdvTime}
                      onChange={(e) => setRdvTime(e.target.value)}
                      className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                    />
                  </NotionPropertyRow>
                  <NotionPropertyRow label="Type" icon={<Tag className="h-4 w-4" />}>
                    <Select value={rdvType} onValueChange={(v) => setRdvType(v as typeof rdvType)}>
                      <SelectTrigger className="h-8 border-0 bg-transparent px-2">
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Réunion">Réunion</SelectItem>
                        <SelectItem value="Appel">Appel</SelectItem>
                        <SelectItem value="Deadline">Deadline</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </NotionPropertyRow>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t bg-background shrink-0">
              <SheetFooter className="mt-0">
                <Button type="button" variant="outline" onClick={() => setRdvDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={rdvCreating}>
                  {rdvCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Planifier
                </Button>
              </SheetFooter>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
