"use client";

import { useMemo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  FileCheck,
  Upload,
  Shield,
  Calculator,
} from "lucide-react";
import QuoteForm from "@/components/finance/QuoteForm";
import InvoiceForm from "@/components/finance/InvoiceForm";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent } from "@/components/ui/tabs";

type Invoice = {
  id: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "Payée" | "En attente" | "En retard" | "Brouillon";
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

type FinanceStats = {
  totalRevenue: number;
  pending: number;
  overdue: number;
  paymentRate: number;
};

type QuoteStats = {
  montantEnAttente: number;
  montantAccepte: number;
  tauxConversion: number;
  envoye: number;
};

type Expense = {
  id: string;
  label: string;
  category: string;
  amount: number;
  date: string;
  receipt?: boolean;
};

type LegalDoc = {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
};

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export type FinanceTab = "factures" | "devis" | "depenses" | "charges" | "documents";

const expensesSeed: Expense[] = [
  { id: "FRA-001", label: "Hébergement", category: "Outils", amount: 12000, date: "2024-01-10", receipt: true },
  { id: "FRA-002", label: "Déplacement client", category: "Transport", amount: 18000, date: "2024-01-18", receipt: false },
  { id: "FRA-003", label: "Abonnement design", category: "Outils", amount: 9000, date: "2024-01-22", receipt: true },
];

const legalDocsSeed: LegalDoc[] = [
  { id: "DOC-LEG-001", title: "Assurance RC Pro", type: "Assurance", updatedAt: "Il y a 3 jours" },
  { id: "DOC-LEG-002", title: "Attestation de domiciliation", type: "Attestation", updatedAt: "Il y a 2 semaines" },
  { id: "DOC-LEG-003", title: "Kbis", type: "Légal", updatedAt: "Il y a 1 mois" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(amount);
}

export function FinanceView({ activeTab }: { activeTab: FinanceTab }) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<FinanceStats>({ totalRevenue: 0, pending: 0, overdue: 0, paymentRate: 0 });
  const [quoteStats, setQuoteStats] = useState<QuoteStats>({ montantEnAttente: 0, montantAccepte: 0, tauxConversion: 0, envoye: 0 });
  const [loading, setLoading] = useState(true);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [deleteInvoiceConfirmOpen, setDeleteInvoiceConfirmOpen] = useState(false);
  const [deleteInvoiceTarget, setDeleteInvoiceTarget] = useState<Invoice | null>(null);
  const [deleteQuoteConfirmOpen, setDeleteQuoteConfirmOpen] = useState(false);
  const [deleteQuoteTarget, setDeleteQuoteTarget] = useState<Quote | null>(null);

  const [expenses] = useState<Expense[]>(expensesSeed);
  const [legalDocs] = useState<LegalDoc[]>(legalDocsSeed);

  const fetchData = async () => {
    try {
      const [financeRes, quotesRes] = await Promise.all([
        fetch("/api/dashboard/finance"),
        fetch("/api/dashboard/quotes"),
      ]);

      if (financeRes.ok) {
        const data = await financeRes.json();
        setInvoices(data.invoices || []);
        setStats(data.stats || { totalRevenue: 0, pending: 0, overdue: 0, paymentRate: 0 });
      }

      if (quotesRes.ok) {
        const data = await quotesRes.json();
        setQuotes(data.quotes || []);
        setQuoteStats(data.stats || { montantEnAttente: 0, montantAccepte: 0, tauxConversion: 0, envoye: 0 });
      }
    } catch (error) {
      console.error("Erreur chargement finance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateQuoteStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/dashboard/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Erreur mise à jour:", error);
    }
  };

  const handleConfirmDeleteInvoice = async () => {
    if (!deleteInvoiceTarget) return;
    try {
      const res = await fetch(`/api/dashboard/finance?id=${deleteInvoiceTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setInvoices((prev) => prev.filter((i) => i.id !== deleteInvoiceTarget.id));
      }
    } catch (error) {
      console.error("Erreur suppression facture:", error);
    } finally {
      setDeleteInvoiceConfirmOpen(false);
      setDeleteInvoiceTarget(null);
    }
  };

  const handleConfirmDeleteQuote = async () => {
    if (!deleteQuoteTarget) return;
    try {
      const res = await fetch(`/api/dashboard/quotes?id=${deleteQuoteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setQuotes((prev) => prev.filter((q) => q.id !== deleteQuoteTarget.id));
      }
    } catch (error) {
      console.error("Erreur suppression devis:", error);
    } finally {
      setDeleteQuoteConfirmOpen(false);
      setDeleteQuoteTarget(null);
    }
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
          clientName: data.clientNom,
          clientEmail: data.clientEmail,
          notes: data.description,
          items: [{ description: data.description, quantity: 1, unitPrice: data.montantTotal }],
        }),
      });
      if (res.ok) {
        setInvoiceDialogOpen(false);
        fetchData();
      } else {
        console.error("Erreur création facture");
      }
    } catch (error) {
      console.error("Erreur création facture:", error);
    }
  };

  const handleCreateQuote = async (data: {
    clientId?: string;
    clientNom: string;
    clientTelephone: string;
    clientEmail: string;
    objet: string;
    description: string;
    delaiRealisation: string;
    dureeValidite: number;
    montant: number;
    acompte: number;
    conditions: string;
    actions: Array<{ label: string; amount: number }>;
  }) => {
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + data.dureeValidite);

      const res = await fetch("/api/dashboard/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clientId: data.clientId,
          clientName: data.clientNom,
          clientEmail: data.clientEmail,
          title: data.objet,
          description: data.description,
          validUntil: validUntil.toISOString(),
          items: data.actions.map((a) => ({
            description: a.label,
            quantity: 1,
            unitPrice: a.amount,
          })),
          notes: data.conditions,
        }),
      });
      if (res.ok) {
        let createdQuoteId: string | undefined;
        try {
          const json = await res.json();
          createdQuoteId = json?.quote?.id;
        } catch {
          // ignore parse error
        }

        setQuoteDialogOpen(false);
        fetchData();

        if (createdQuoteId) {
          router.push(`/dashboard/finance/devis/${createdQuoteId}`);
        } else {
          router.push("/dashboard/finance/devis");
        }
      } else {
        console.error("Erreur création devis");
      }
    } catch (error) {
      console.error("Erreur création devis:", error);
    }
  };

  const invoiceColumns = useMemo<ColumnDef<Invoice>[]>(() => {
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
        accessorKey: "id",
        header: "Facture",
        cell: ({ row }) => <span className="font-medium">{row.getValue("id")}</span>,
      },
      {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(row.getValue("client") as string)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">{row.getValue("client")}</p>
              <p className="text-xs text-muted-foreground">
                Échéance {new Date(row.original.dueDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Montant",
        cell: ({ row }) => {
          const amount = row.getValue("amount") as number;
          return (
            <span className="font-medium">
              {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(amount)}
            </span>
          );
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString("fr-FR"),
      },
      {
        accessorKey: "dueDate",
        header: "Échéance",
        cell: ({ row }) => new Date(row.getValue("dueDate")).toLocaleDateString("fr-FR"),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const colors: Record<string, string> = {
            Payée: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
            "En attente": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-800",
            "En retard": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800",
            Brouillon: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-700",
          };
          return (
            <Badge variant="secondary" className={colors[status]}>
              {status}
            </Badge>
          );
        },
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
                  setDeleteInvoiceTarget(row.original);
                  setDeleteInvoiceConfirmOpen(true);
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

  const quoteColumns: ColumnDef<Quote>[] = [
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
      accessorKey: "id",
      header: "N° Devis",
      cell: ({ row }) => <span className="font-medium">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "clientName",
      header: "Client",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(row.getValue("clientName") as string)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate">{row.getValue("clientName")}</p>
            <p className="text-xs text-muted-foreground">
              Valide jusqu’au {new Date(row.original.validUntil).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: "Montant",
      cell: ({ row }) => {
        const total = row.getValue("total") as number;
        return (
          <span className="font-medium">
            {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(total)}
          </span>
        );
      },
    },
    {
      accessorKey: "validUntil",
      header: "Validité",
      cell: ({ row }) => {
        const date = new Date(row.getValue("validUntil") as string);
        const isExpired = date < new Date() && row.original.status === "Envoyé";
        return (
          <span className={isExpired ? "text-red-500" : ""}>
            {date.toLocaleDateString("fr-FR")}
            {isExpired && " (Expiré)"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const colors: Record<string, string> = {
          Brouillon: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-700",
          Envoyé: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800",
          Accepté: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
          Refusé: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800",
          Expiré: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-800",
        };
        return (
          <Badge variant="secondary" className={colors[status]}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const quote = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {quote.status === "Brouillon" && (
                <DropdownMenuItem onClick={() => updateQuoteStatus(quote.id, "Envoyé")}>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </DropdownMenuItem>
              )}
              {quote.status === "Envoyé" && (
                <>
                  <DropdownMenuItem onClick={() => updateQuoteStatus(quote.id, "Accepté")}>
                    <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                    Accepté
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateQuoteStatus(quote.id, "Refusé")}>
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                    Refusé
                  </DropdownMenuItem>
                </>
              )}
              {quote.status === "Accepté" && (
                <DropdownMenuItem>
                  <FileCheck className="mr-2 h-4 w-4 text-yellow-600" />
                  Convertir en facture
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Voir détail
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setDeleteQuoteTarget(quote);
                  setDeleteQuoteConfirmOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Dialog
        open={deleteInvoiceConfirmOpen}
        onOpenChange={(open) => {
          setDeleteInvoiceConfirmOpen(open);
          if (!open) setDeleteInvoiceTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette facture ?</DialogTitle>
            <DialogDescription>Cette action est définitive.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteInvoiceConfirmOpen(false);
                setDeleteInvoiceTarget(null);
              }}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteInvoice}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteQuoteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteQuoteConfirmOpen(open);
          if (!open) setDeleteQuoteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce devis ?</DialogTitle>
            <DialogDescription>Cette action est définitive.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteQuoteConfirmOpen(false);
                setDeleteQuoteTarget(null);
              }}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteQuote}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="factures" className="mt-6">
          <DataTable
            columns={invoiceColumns}
            data={invoices}
            searchKey="client"
            searchPlaceholder="Rechercher par client..."
            onRowClick={(invoice) => router.push(`/dashboard/finance/${invoice.id}`)}
            mobileVisibleColumnIds={["client", "status"]}
            mobileInlineColumnIds={["status"]}
            actionButton={
              <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus data-icon="inline-start" />
                    <span className="hidden sm:inline">Nouvelle facture</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nouvelle facture</DialogTitle>
                    <DialogDescription>Créez une facture avec les informations du client.</DialogDescription>
                  </DialogHeader>
                  <InvoiceForm onSubmit={handleCreateInvoice} onCancel={() => setInvoiceDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            }
          />
        </TabsContent>

        <TabsContent value="devis" className="mt-6">
          <DataTable
            columns={quoteColumns}
            data={quotes}
            searchKey="clientName"
            searchPlaceholder="Rechercher par client..."
            onRowClick={(quote) => router.push(`/dashboard/finance/devis/${quote.id}`)}
            mobileVisibleColumnIds={["clientName", "status"]}
            mobileInlineColumnIds={["status"]}
            actionButton={
              <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus data-icon="inline-start" />
                    <span className="hidden sm:inline">Nouveau devis</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nouveau devis</DialogTitle>
                    <DialogDescription>Créez un devis avec les informations du client.</DialogDescription>
                  </DialogHeader>
                  <QuoteForm onSubmit={handleCreateQuote} onCancel={() => setQuoteDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            }
          />
        </TabsContent>

        <TabsContent value="depenses" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Dépenses & frais</CardTitle>
                  <CardDescription>Suivi des dépenses professionnelles</CardDescription>
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Ajouter un reçu
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {expenses.map((e) => (
                  <div key={e.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{e.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.category} • {new Date(e.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge variant={e.receipt ? "default" : "outline"}>{e.receipt ? "Reçu" : "Sans reçu"}</Badge>
                      <span className="font-medium">{formatCurrency(e.amount)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
                <CardDescription>Mois en cours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Total dépenses</p>
                  <p className="text-2xl font-semibold">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Reçus manquants</p>
                  <p className="text-2xl font-semibold">{expenses.filter((e) => !e.receipt).length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charges" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Prévisionnel de charges</CardTitle>
                <CardDescription>Estimation simple des montants à provisionner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Taux charges (%)</label>
                    <Input defaultValue="35" inputMode="numeric" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Taux impôts (%)</label>
                    <Input defaultValue="10" inputMode="numeric" />
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Base (revenus encaissés)</p>
                  <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculer (bientôt)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conseil</CardTitle>
                <CardDescription>Rester serein</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <p className="text-sm">Provisionne chaque encaissement (charges + impôts) avant de te payer.</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm">Ajuste le taux selon ton statut et ton pays.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Documents légaux</CardTitle>
                  <CardDescription>Coffre-fort (Kbis, RC Pro, attestations)</CardDescription>
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Importer
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {legalDocs.map((d) => (
                  <div key={d.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{d.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.type} • {d.updatedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end">
                      <Badge variant="outline">{d.type}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accès</CardTitle>
                <CardDescription>Bonnes pratiques</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <p className="text-sm">Centralise tes pièces pour gagner du temps (banque, comptable, clients).</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm">Ajoute des expirations (assurance) quand tu brancheras le back.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {quoteStats.envoye > 0 ? null : null}
    </div>
  );
}
