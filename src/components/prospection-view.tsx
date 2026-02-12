"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  Building2,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
  Plus,
  Tag,
} from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { NotionPropertyRow } from "@/components/ui/notion-property-row";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "Actif" | "Inactif" | "Prospect" | "Perdu";
  projects: number;
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

type Opportunity = {
  id: string;
  source: string;
  title: string;
  company: string;
  url: string;
  publishedAt: string;
  status?: string;
};

type ScriptTemplate = {
  id: string;
  title: string;
  content: string;
};

export type ProspectionTab = "pipeline" | "contacts" | "opportunites" | "scripts";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(amount);
}

export function ProspectionView({ activeTab }: { activeTab: ProspectionTab }) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scriptTemplates, setScriptTemplates] = useState<ScriptTemplate[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ScriptTemplate | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [aiObjective, setAiObjective] = useState("Mail de prise de contact");
  const [aiContext, setAiContext] = useState("");
  const [aiTone, setAiTone] = useState("Professionnel");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientStatus, setNewClientStatus] = useState<"Prospect" | "Actif">("Prospect");
  const [creating, setCreating] = useState(false);

  const clientsColumns = useMemo<ColumnDef<Client>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Client",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {row.original.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{row.getValue("name")}</p>
              <p className="text-xs text-muted-foreground">{row.original.company}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" /> {row.getValue("email")}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" /> {row.original.phone}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const colors: Record<string, string> = {
            Actif: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
            Inactif: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-700",
            Prospect: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800",
            Perdu: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800",
          };
          return (
            <Badge variant="secondary" className={colors[status]}>
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "projects",
        header: "Projets",
        cell: ({ row }) => <span>{row.getValue("projects")} projet(s)</span>,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setDeleteTarget(row.original);
                  setDeleteConfirmOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];
  }, []);

  const defaultTemplates = useMemo<ScriptTemplate[]>(() => {
    return [
      {
        id: "TPL-001",
        title: "Mail de prise de contact",
        content:
          "Bonjour,\n\nJe me permets de vous contacter car j'accompagne des entreprises sur [type de besoin].\n\nSeriez-vous disponible pour un échange de 15 minutes cette semaine ?\n\nCordialement",
      },
      {
        id: "TPL-002",
        title: "Relance après devis",
        content:
          "Bonjour,\n\nJe reviens vers vous suite au devis envoyé le [date].\n\nSouhaitez-vous que l'on en discute ou avez-vous des ajustements à prévoir ?\n\nBien à vous",
      },
      {
        id: "TPL-003",
        title: "Relance finale",
        content:
          "Bonjour,\n\nJe me permets une dernière relance concernant notre proposition.\n\nSans retour de votre part d'ici [date], je considérerai le dossier en pause.\n\nMerci",
      },
    ];
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("tuma:scripts:templates");
      if (!raw) {
        setScriptTemplates(defaultTemplates);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const safe = parsed
          .filter((t): t is ScriptTemplate => {
            const tpl = t as ScriptTemplate;
            return (
              typeof tpl?.id === "string" &&
              typeof tpl?.title === "string" &&
              typeof tpl?.content === "string"
            );
          })
          .slice(0, 200);

        setScriptTemplates(safe.length > 0 ? safe : defaultTemplates);
      } else {
        setScriptTemplates(defaultTemplates);
      }
    } catch {
      setScriptTemplates(defaultTemplates);
    }
  }, [defaultTemplates]);

  useEffect(() => {
    try {
      window.localStorage.setItem("tuma:scripts:templates", JSON.stringify(scriptTemplates));
    } catch {
      // noop
    }
  }, [scriptTemplates]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/dashboard/clients?id=${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      }
    } catch (error) {
      console.error("Erreur suppression client:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, quotesRes, oppsRes] = await Promise.all([
          fetch("/api/dashboard/clients", { credentials: "include" }),
          fetch("/api/dashboard/quotes", { credentials: "include" }),
          fetch("/api/dashboard/opportunities", { credentials: "include" }),
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(Array.isArray(data?.clients) ? data.clients : []);
        }

        if (quotesRes.ok) {
          const data = await quotesRes.json();
          setQuotes(Array.isArray(data?.quotes) ? data.quotes : []);
        }

        if (oppsRes.ok) {
          const data = await oppsRes.json();
          setOpportunities(Array.isArray(data?.opportunities) ? data.opportunities : []);
        }
      } catch (error) {
        console.error("Erreur chargement prospection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshClients = async () => {
    try {
      const clientsRes = await fetch("/api/dashboard/clients", { credentials: "include" });
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(Array.isArray(data?.clients) ? data.clients : []);
      }
    } catch (error) {
      console.error("Erreur chargement clients:", error);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newClientName,
          email: newClientEmail,
          phone: newClientPhone,
          company: newClientCompany,
          status: newClientStatus,
        }),
      });

      if (res.ok) {
        setCreateDialogOpen(false);
        setNewClientName("");
        setNewClientEmail("");
        setNewClientPhone("");
        setNewClientCompany("");
        setNewClientStatus("Prospect");
        await refreshClients();
      }
    } catch (error) {
      console.error("Erreur création client:", error);
    } finally {
      setCreating(false);
    }
  };

  const pipeline = useMemo(() => {
    const prospects = clients.filter((c) => c.status === "Prospect");
    const discussion = quotes.filter((q) => q.status === "Brouillon");
    const sent = quotes.filter((q) => q.status === "Envoyé");
    const won = quotes.filter((q) => q.status === "Accepté");

    return {
      prospects,
      discussion,
      sent,
      won,
    };
  }, [clients, quotes]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1200);
    } catch (error) {
      console.error("Erreur copie:", error);
    }
  };

  const openCreateTemplate = (preset?: { title?: string; content?: string }) => {
    setEditingTemplate(null);
    setTemplateTitle(preset?.title ?? "");
    setTemplateContent(preset?.content ?? "");
    setTemplateDialogOpen(true);
  };

  const openEditTemplate = (tpl: ScriptTemplate) => {
    setEditingTemplate(tpl);
    setTemplateTitle(tpl.title);
    setTemplateContent(tpl.content);
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    const title = templateTitle.trim();
    const content = templateContent.trim();
    if (!title || !content) return;

    if (editingTemplate) {
      setScriptTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplate.id ? { ...t, title, content } : t))
      );
    } else {
      const id = `TPL-${Date.now().toString(36).toUpperCase()}`;
      setScriptTemplates((prev) => [{ id, title, content }, ...prev]);
    }

    setTemplateDialogOpen(false);
    setEditingTemplate(null);
    setTemplateTitle("");
    setTemplateContent("");
  };

  const handleDeleteTemplate = (tpl: ScriptTemplate) => {
    const ok = window.confirm(`Supprimer "${tpl.title}" ?`);
    if (!ok) return;
    setScriptTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
  };

  const handleGenerateScript = async () => {
    setAiGenerating(true);
    setAiResult("");
    try {
      const res = await fetch("/api/ai/prospection-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: aiObjective,
          context: aiContext,
          tone: aiTone,
        }),
      });

      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMessage =
          typeof json === "object" &&
          json !== null &&
          "error" in json &&
          typeof (json as { error?: unknown }).error === "string"
            ? (json as { error: string }).error
            : "Erreur génération IA";

        throw new Error(errorMessage);
      }

      const nextText =
        typeof json === "object" &&
        json !== null &&
        "text" in json &&
        typeof (json as { text?: unknown }).text === "string"
          ? (json as { text: string }).text
          : "";

      setAiResult(nextText);
    } catch (error) {
      console.error("Erreur génération IA:", error);
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Sheet
        open={templateDialogOpen}
        onOpenChange={(open) => {
          setTemplateDialogOpen(open);
          if (!open) {
            setEditingTemplate(null);
            setTemplateTitle("");
            setTemplateContent("");
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingTemplate ? "Modifier le modèle" : "Nouveau modèle"}</SheetTitle>
            <SheetDescription>Créez un script réutilisable pour vos emails et relances.</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="px-1">
                <Input
                  id="tpl-title"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  placeholder="Titre du modèle"
                  className="h-12 px-0 border-0 bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2">
                <Textarea
                  id="tpl-content"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="Écrivez votre script..."
                  className="min-h-[180px] px-0 border-0 bg-transparent focus-visible:ring-0 resize-none"
                />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" type="button" onClick={() => setTemplateDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleSaveTemplate}>
              Enregistrer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce client ?</DialogTitle>
            <DialogDescription>Cette action est définitive.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteTarget(null);
              }}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="pipeline" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contacté</CardTitle>
                <CardDescription>Prospects à relancer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {pipeline.prospects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun prospect.</p>
                ) : (
                  pipeline.prospects.slice(0, 6).map((p) => (
                    <div key={p.id} className="p-3 rounded-lg border">
                      <p className="font-medium text-sm">{p.company || p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">En discussion</CardTitle>
                <CardDescription>Brouillons à finaliser</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {pipeline.discussion.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Rien à préparer.</p>
                ) : (
                  pipeline.discussion.slice(0, 6).map((q) => (
                    <div key={q.id} className="p-3 rounded-lg border">
                      <p className="font-medium text-sm">{q.clientName}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(q.total)}</p>
                      <Badge variant="outline" className="mt-2">
                        {q.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Devis envoyé</CardTitle>
                <CardDescription>Relances à planifier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {pipeline.sent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun devis envoyé.</p>
                ) : (
                  pipeline.sent.slice(0, 6).map((q) => (
                    <div key={q.id} className="p-3 rounded-lg border">
                      <p className="font-medium text-sm">{q.clientName}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(q.total)}</p>
                      <Badge variant="secondary" className="mt-2">
                        {q.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gagné</CardTitle>
                <CardDescription>Devis acceptés</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {pipeline.won.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune vente gagnée.</p>
                ) : (
                  pipeline.won.slice(0, 6).map((q) => (
                    <div key={q.id} className="p-3 rounded-lg border">
                      <p className="font-medium text-sm">{q.clientName}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(q.total)}</p>
                      <Badge className="mt-2">{q.status}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <DataTable
            columns={clientsColumns}
            data={clients}
            searchKey="name"
            searchPlaceholder="Rechercher un client..."
            onRowClick={(client) => router.push(`/dashboard/clients/${client.id}`)}
            mobileVisibleColumnIds={["name", "status"]}
            mobileInlineColumnIds={["status"]}
            actionButton={
              <Sheet open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <SheetTrigger asChild>
                  <Button>
                    <Plus data-icon="inline-start" />
                    <span className="hidden sm:inline">Nouveau client</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Nouveau client</SheetTitle>
                    <SheetDescription>Ajoutez un nouveau client à votre base.</SheetDescription>
                  </SheetHeader>
                  <form onSubmit={handleCreateClient}>
                    <div className="py-4 max-h-[60vh] overflow-y-auto">
                      <div className="space-y-4">
                        <div className="px-1">
                          <Input
                            id="name"
                            placeholder="Nom du client"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            required
                            className="h-12 px-0 border-0 bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight focus-visible:ring-0"
                          />
                        </div>

                        <div className="rounded-xl border bg-background divide-y">
                          <NotionPropertyRow label="Type" icon={<Tag className="h-4 w-4" />}>
                            <Select
                              value={newClientStatus}
                              onValueChange={(v) => setNewClientStatus(v as "Prospect" | "Actif")}
                            >
                              <SelectTrigger className="h-8 border-0 bg-transparent px-2">
                                <SelectValue placeholder="Choisir le type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Prospect">Prospect</SelectItem>
                                <SelectItem value="Actif">Client</SelectItem>
                              </SelectContent>
                            </Select>
                          </NotionPropertyRow>
                          <NotionPropertyRow label="Email" icon={<Mail className="h-4 w-4" />}>
                            <Input
                              id="email"
                              type="email"
                              placeholder="email@exemple.com"
                              value={newClientEmail}
                              onChange={(e) => setNewClientEmail(e.target.value)}
                              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                            />
                          </NotionPropertyRow>
                          <NotionPropertyRow label="Téléphone" icon={<Phone className="h-4 w-4" />}>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+33 6 00 00 00 00"
                              value={newClientPhone}
                              onChange={(e) => setNewClientPhone(e.target.value)}
                              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                            />
                          </NotionPropertyRow>
                          <NotionPropertyRow label="Entreprise" icon={<Building2 className="h-4 w-4" />}>
                            <Input
                              id="company"
                              placeholder="Nom de l'entreprise"
                              value={newClientCompany}
                              onChange={(e) => setNewClientCompany(e.target.value)}
                              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                            />
                          </NotionPropertyRow>
                        </div>
                      </div>
                    </div>
                    <SheetFooter>
                      <Button type="submit" disabled={creating}>
                        {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Ajouter le client
                      </Button>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>
            }
          />
        </TabsContent>

        <TabsContent value="opportunites" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Veille opportunités</CardTitle>
              <CardDescription>Flux agrégé (LinkedIn, Twitter/X, web)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {opportunities.map((op) => (
                <div key={op.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{op.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {op.company} • {op.source} • {op.publishedAt}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={op.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Voir
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 lg:sticky lg:top-6 self-start">
              <CardHeader>
                <CardTitle>Générer avec l&apos;IA</CardTitle>
                <CardDescription>Créez un script adapté à votre contexte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="ai-objective" className="text-sm">
                    Objectif
                  </label>
                  <Input
                    id="ai-objective"
                    value={aiObjective}
                    onChange={(e) => setAiObjective(e.target.value)}
                    placeholder="Ex: Relance après devis"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="ai-tone" className="text-sm">
                    Ton
                  </label>
                  <Input
                    id="ai-tone"
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    placeholder="Ex: Professionnel, direct, chaleureux"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="ai-context" className="text-sm">
                    Contexte
                  </label>
                  <Textarea
                    id="ai-context"
                    value={aiContext}
                    onChange={(e) => setAiContext(e.target.value)}
                    placeholder="Ex: Client: PME e-commerce. Besoin: refonte landing. Devis envoyé le 12/01. Pas de réponse depuis 7 jours..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" onClick={handleGenerateScript} disabled={aiGenerating}>
                    {aiGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Générer
                  </Button>
                  {aiResult ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCopy("AI", aiResult)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {copiedId === "AI" ? "Copié" : "Copier"}
                    </Button>
                  ) : null}
                </div>
                {aiResult ? (
                  <div className="space-y-2">
                    <pre className="text-xs whitespace-pre-wrap text-muted-foreground border rounded-lg p-3">
                      {aiResult}
                    </pre>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openCreateTemplate({ title: aiObjective, content: aiResult })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter à la bibliothèque
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>Modèles & scripts</CardTitle>
                    <CardDescription>Mails et scripts de vente réutilisables</CardDescription>
                  </div>
                  <Button type="button" onClick={() => openCreateTemplate()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {scriptTemplates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun modèle pour le moment.</p>
                ) : (
                  scriptTemplates.map((tpl) => (
                    <div key={tpl.id} className="p-3 rounded-lg border space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{tpl.title}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(tpl.id, tpl.content)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            {copiedId === tpl.id ? "Copié" : "Copier"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openEditTemplate(tpl)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTemplate(tpl)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <pre className="text-xs whitespace-pre-wrap text-muted-foreground">{tpl.content}</pre>
                      <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                        <Link
                          href={`mailto:?subject=${encodeURIComponent(tpl.title)}&body=${encodeURIComponent(tpl.content)}`}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Ouvrir email
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
