"use client";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2,
  TrendingUp,
  Clock,
  FileCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Quote = {
  id: string;
  clientId: string;
  clientName: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  total: number;
  validUntil: string;
  status: "Brouillon" | "Envoyé" | "Accepté" | "Refusé" | "Expiré";
  createdAt: string;
};

type QuoteStats = {
  total: number;
  brouillon: number;
  envoye: number;
  accepte: number;
  refuse: number;
  montantEnAttente: number;
  montantAccepte: number;
  tauxConversion: number;
};

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<QuoteStats>({
    total: 0, brouillon: 0, envoye: 0, accepte: 0, refuse: 0,
    montantEnAttente: 0, montantAccepte: 0, tauxConversion: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/dashboard/quotes');
      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Erreur chargement devis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const updateQuoteStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/dashboard/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Si le devis est accepté, mettre à jour le client
        if (data.updateClient) {
          await fetch('/api/dashboard/clients', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: data.updateClient, status: 'Actif' })
          });
        }
        fetchQuotes();
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const convertToInvoice = async (quote: Quote) => {
    // TODO: Créer une facture à partir du devis
    console.log('Convertir en facture:', quote);
    router.push(`/dashboard/finance?fromQuote=${quote.id}`);
  };

  const columns: ColumnDef<Quote>[] = [
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
        <div>
          <p className="font-medium">{row.getValue("clientName")}</p>
          <p className="text-xs text-muted-foreground">{row.original.clientId}</p>
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
        const date = new Date(row.getValue("validUntil"));
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
          "Brouillon": "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-700",
          "Envoyé": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800",
          "Accepté": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
          "Refusé": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800",
          "Expiré": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-800",
        };
        return <Badge variant="secondary" className={colors[status]}>{status}</Badge>;
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
                  Envoyer au client
                </DropdownMenuItem>
              )}
              {quote.status === "Envoyé" && (
                <>
                  <DropdownMenuItem onClick={() => updateQuoteStatus(quote.id, "Accepté")}>
                    <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                    Marquer accepté
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateQuoteStatus(quote.id, "Refusé")}>
                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                    Marquer refusé
                  </DropdownMenuItem>
                </>
              )}
              {quote.status === "Accepté" && (
                <>
                  <DropdownMenuItem onClick={() => convertToInvoice(quote)}>
                    <FileCheck className="mr-2 h-4 w-4 text-yellow-600" />
                    Convertir en facture
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Voir le détail
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> En attente
            </CardDescription>
            <CardTitle className="text-2xl">
              {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(stats.montantEnAttente)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.envoye} devis envoyés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Acceptés
            </CardDescription>
            <CardTitle className="text-2xl text-emerald-600">
              {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(stats.montantAccepte)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600">{stats.accepte} devis acceptés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Taux de conversion
            </CardDescription>
            <CardTitle className="text-2xl">{stats.tauxConversion}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Devis acceptés / envoyés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Brouillons
            </CardDescription>
            <CardTitle className="text-2xl">{stats.brouillon}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">À finaliser</p>
          </CardContent>
        </Card>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Devis</CardTitle>
            <CardDescription>Gérez vos devis et convertissez-les en factures</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau devis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau devis</DialogTitle>
                <DialogDescription>
                  Créez un devis pour un prospect ou client.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="client" className="text-sm">Client</label>
                  <Input id="client" placeholder="Sélectionner un client" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm">Description</label>
                  <Input id="description" placeholder="Description du service" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="amount" className="text-sm">Montant (XOF)</label>
                    <Input id="amount" type="number" placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="validUntil" className="text-sm">Valide jusqu’au</label>
                    <Input id="validUntil" type="date" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Créer le devis</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={quotes} 
            searchKey="clientName" 
            searchPlaceholder="Rechercher par client..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
