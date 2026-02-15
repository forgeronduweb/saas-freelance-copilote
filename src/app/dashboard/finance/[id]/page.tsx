"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2, Send } from "lucide-react";

type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type InvoiceDetail = {
  id: string;
  clientId: string;
  client: string;
  amount: number;
  tax: number;
  total: number;
  status: "Payée" | "En attente" | "En retard" | "Brouillon";
  statusRaw?: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  notes?: string;
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = typeof params.id === "string" ? params.id : String(params.id ?? "");
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) return;
      setLoading(true);
      setError(false);

      try {
        const res = await fetch(`/api/dashboard/finance?id=${encodeURIComponent(invoiceId)}`, {
          credentials: "include",
        });

        if (!res.ok) {
          setError(true);
          setInvoice(null);
          return;
        }

        const data = (await res.json()) as { invoice?: InvoiceDetail };
        setInvoice(data?.invoice ?? null);
      } catch (e) {
        console.error("Erreur chargement facture:", e);
        setError(true);
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId]);

  const statusColors = useMemo<Record<string, string>>(
    () => ({
      Payée: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
      "En attente": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-800",
      "En retard": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800",
      Brouillon: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-700",
    }),
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h1 className="text-2xl">Facture non trouvée</h1>
        <Button asChild>
          <Link href="/dashboard/finance/factures">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux factures
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/finance/factures">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg">{invoice.id}</h1>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm">{invoice.client}</span>
              <Badge variant="secondary" className={statusColors[invoice.status]}>{invoice.status}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.total)}
              {" "}• Émise le {new Date(invoice.issueDate).toLocaleDateString("fr-FR")}
              {" "}• Échéance {new Date(invoice.dueDate).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Date d’émission</p>
              <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Échéance</p>
              <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Paiement</p>
              <p className="font-medium">{invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString("fr-FR") : "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la facture</CardTitle>
          {invoice.notes ? <CardDescription>{invoice.notes}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:hidden">
            {invoice.items.map((item, index) => (
              <div key={index} className="rounded-lg border p-3 space-y-2">
                <p className="font-medium">{item.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantité</p>
                    <p>{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prix unitaire</p>
                    <p>{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(item.unitPrice)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(item.total)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
              <div className="flex items-center justify-between text-sm">
                <span>Total HT</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Taxes</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.tax)}
                </span>
              </div>
              <div className="flex items-center justify-between text-base pt-2 border-t">
                <span>Total TTC</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:block border rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm">Description</th>
                  <th className="text-center p-3 text-sm">Quantité</th>
                  <th className="text-right p-3 text-sm">Prix unitaire</th>
                  <th className="text-right p-3 text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(item.unitPrice)}</td>
                    <td className="p-3 text-right">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(item.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50">
                <tr className="border-t">
                  <td colSpan={3} className="p-3 text-right">Total HT</td>
                  <td className="p-3 text-right">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.amount)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-3 text-right">Taxes</td>
                  <td className="p-3 text-right">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.tax)}</td>
                </tr>
                <tr className="border-t">
                  <td colSpan={3} className="p-3 text-right text-lg">Total TTC</td>
                  <td className="p-3 text-right text-lg">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button className="w-full sm:w-auto" disabled>
            <Send className="mr-2 h-4 w-4" />
            Envoyer au client
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" disabled>
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
          {invoice.status !== "Payée" && (
            <Button variant="outline" className="text-emerald-600 w-full sm:w-auto" disabled>
              Marquer comme payée
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
