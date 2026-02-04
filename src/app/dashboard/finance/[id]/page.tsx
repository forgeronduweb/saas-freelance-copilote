"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Send } from "lucide-react";

const invoices = [
  { id: "FAC-2024-001", client: "Tech Solutions CI", amount: 1500000, date: "2024-01-15", dueDate: "2024-02-15", status: "Payée", description: "Développement site e-commerce", items: [{ name: "Développement frontend", qty: 1, price: 900000 }, { name: "Intégration API", qty: 1, price: 600000 }] },
  { id: "FAC-2024-002", client: "Startup XYZ", amount: 1200000, date: "2024-01-18", dueDate: "2024-02-18", status: "En attente", description: "Application mobile MVP", items: [{ name: "Design UI/UX", qty: 1, price: 500000 }, { name: "Développement", qty: 1, price: 700000 }] },
  { id: "FAC-2024-003", client: "E-Commerce Plus", amount: 2100000, date: "2024-01-20", dueDate: "2024-02-20", status: "En attente", description: "Refonte complète du site", items: [{ name: "Audit", qty: 1, price: 300000 }, { name: "Développement", qty: 1, price: 1500000 }, { name: "SEO", qty: 1, price: 300000 }] },
  { id: "FAC-2024-004", client: "Design Studio", amount: 650000, date: "2024-01-10", dueDate: "2024-01-25", status: "En retard", description: "Maintenance mensuelle", items: [{ name: "Support technique", qty: 1, price: 350000 }, { name: "Mises à jour", qty: 1, price: 300000 }] },
  { id: "FAC-2024-005", client: "Agence Web Abidjan", amount: 900000, date: "2024-01-22", dueDate: "2024-02-22", status: "Brouillon", description: "Consultation stratégie digitale", items: [{ name: "Consultation", qty: 3, price: 300000 }] },
  { id: "FAC-2024-006", client: "Tech Solutions CI", amount: 1100000, date: "2024-01-08", dueDate: "2024-02-08", status: "Payée", description: "Module de paiement mobile", items: [{ name: "Intégration Orange Money / MTN", qty: 1, price: 1100000 }] },
];

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoice = invoices.find(i => i.id === params.id);

  if (!invoice) {
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

  const statusColors: Record<string, string> = {
    "Payée": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "En attente": "bg-orange-50 text-orange-700 border-orange-200",
    "En retard": "bg-red-50 text-red-700 border-red-200",
    "Brouillon": "bg-gray-50 text-gray-700 border-gray-200",
  };

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
            <p className="text-muted-foreground text-sm">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.amount)} • Échéance: {new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la facture</CardTitle>
          <CardDescription>{invoice.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:hidden">
            {invoice.items.map((item, index) => (
              <div key={index} className="rounded-lg border p-3 space-y-2">
                <p className="font-medium">{item.name}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantité</p>
                    <p>{item.qty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prix unitaire</p>
                    <p>{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(item.price)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(item.qty * item.price)}
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
                <span>TVA (18%)</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.amount * 0.18)}
                </span>
              </div>
              <div className="flex items-center justify-between text-base pt-2 border-t">
                <span>Total TTC</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.amount * 1.18)}
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
                    <td className="p-3">{item.name}</td>
                    <td className="p-3 text-center">{item.qty}</td>
                    <td className="p-3 text-right">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(item.price)}</td>
                    <td className="p-3 text-right">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(item.qty * item.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50">
                <tr className="border-t">
                  <td colSpan={3} className="p-3 text-right">Total HT</td>
                  <td className="p-3 text-right">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.amount)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-3 text-right">TVA (18%)</td>
                  <td className="p-3 text-right">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.amount * 0.18)}</td>
                </tr>
                <tr className="border-t">
                  <td colSpan={3} className="p-3 text-right text-lg">Total TTC</td>
                  <td className="p-3 text-right text-lg">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(invoice.amount * 1.18)}</td>
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
          <Button className="w-full sm:w-auto">
            <Send className="mr-2 h-4 w-4" />
            Envoyer au client
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
          {invoice.status !== "Payée" && (
            <Button variant="outline" className="text-emerald-600 w-full sm:w-auto">
              Marquer comme payée
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
