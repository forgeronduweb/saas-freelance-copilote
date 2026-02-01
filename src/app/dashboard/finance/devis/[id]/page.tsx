"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Send, Printer, CheckCircle, XCircle, FileCheck, Copy } from "lucide-react";

type QuoteStatus = "Brouillon" | "Envoyé" | "Accepté" | "Refusé" | "Expiré";

type QuoteItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

type Quote = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  publicToken?: string;
  title?: string;
  description: string;
  items: QuoteItem[];
  total: number;
  validUntil: string;
  status: QuoteStatus;
  createdAt: string;
};

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = String(params.id);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyingLink, setCopyingLink] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/dashboard/quotes?id=${encodeURIComponent(quoteId)}`, {
          credentials: "include",
        });

        if (!res.ok) {
          setQuote(null);
          setError("Devis non trouvé");
          return;
        }

        const json = await res.json();
        setQuote((json?.quote || null) as Quote | null);
      } catch (e) {
        console.error("Erreur chargement devis:", e);
        setError("Erreur lors du chargement du devis");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId]);

  const totalHT = useMemo(() => {
    if (!quote) return 0;
    return quote.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [quote]);

  const tva = useMemo(() => totalHT * 0.18, [totalHT]);
  const totalTTC = useMemo(() => totalHT + tva, [totalHT, tva]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h1 className="text-2xl">Chargement...</h1>
      </div>
    );
  }

  if (!quote || error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h1 className="text-2xl">{error || "Devis non trouvé"}</h1>
        <Button asChild>
          <Link href="/dashboard/finance/devis">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux finances
          </Link>
        </Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    "Brouillon": "bg-gray-50 text-gray-700 border-gray-200",
    "Envoyé": "bg-blue-50 text-blue-700 border-blue-200",
    "Accepté": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Refusé": "bg-red-50 text-red-700 border-red-200",
    "Expiré": "bg-orange-50 text-orange-700 border-orange-200",
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch("/api/dashboard/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: quote.id, status: newStatus }),
      });

      if (!res.ok) {
        console.error("Erreur mise à jour statut devis");
        return;
      }

      setQuote((prev) => (prev ? { ...prev, status: newStatus as QuoteStatus } : prev));
    } catch (e) {
      console.error("Erreur mise à jour statut devis:", e);
    }
  };

  const handleConvertToInvoice = () => {
    // TODO: Implémenter la conversion en facture
    console.log("Conversion en facture");
    router.push("/dashboard/finance/factures");
  };

  const handleCopyClientLink = async () => {
    if (!quote) return;

    try {
      setCopyingLink(true);

      let publicToken = quote.publicToken;
      if (!publicToken) {
        const res = await fetch("/api/dashboard/quotes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: quote.id, generatePublicToken: true }),
        });

        if (!res.ok) {
          return;
        }

        const json = await res.json();
        publicToken = json?.quote?.publicToken;

        if (publicToken) {
          setQuote((prev) => (prev ? { ...prev, publicToken } : prev));
        }
      }

      if (!publicToken) return;

      const url = `${window.location.origin}/devis/${publicToken}`;

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement("textarea");
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
    } catch (e) {
      console.error("Erreur copie lien devis:", e);
    } finally {
      setCopyingLink(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/finance/devis">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg">{quote.id}</h1>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm">{quote.clientName}</span>
              <Badge variant="secondary" className={statusColors[quote.status]}>{quote.status}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(quote.total)} • Valide jusqu'au: {new Date(quote.validUntil).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyClientLink} disabled={copyingLink}>
            <Copy className="mr-2 h-4 w-4" />
            {copyingLink ? "Copie..." : "Copier le lien client"}
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          {quote.status === "Brouillon" && (
            <Button variant="outline" size="icon" onClick={() => handleStatusChange("Envoyé")}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails du devis</CardTitle>
          <CardDescription>{quote.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
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
                {quote.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">
                      {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(item.unitPrice)}
                    </td>
                    <td className="p-3 text-right">
                      {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(
                        item.quantity * item.unitPrice
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50">
                <tr className="border-t">
                  <td colSpan={3} className="p-3 text-right">Total HT</td>
                  <td className="p-3 text-right">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(totalHT)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-3 text-right">TVA (18%)</td>
                  <td className="p-3 text-right">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(tva)}</td>
                </tr>
                <tr className="border-t">
                  <td colSpan={3} className="p-3 text-right text-lg">Total TTC</td>
                  <td className="p-3 text-right text-lg">{new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(totalTTC)}</td>
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
        <CardContent className="flex gap-3 flex-wrap">
          {quote.status === "Brouillon" && (
            <Button onClick={() => handleStatusChange("Envoyé")}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer au client
            </Button>
          )}
          {quote.status === "Envoyé" && (
            <>
              <Button onClick={() => handleStatusChange("Accepté")} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer comme accepté
              </Button>
              <Button variant="outline" onClick={() => handleStatusChange("Refusé")} className="text-red-600">
                <XCircle className="mr-2 h-4 w-4" />
                Marquer comme refusé
              </Button>
            </>
          )}
          {quote.status === "Accepté" && (
            <Button onClick={handleConvertToInvoice} className="bg-yellow-600 hover:bg-yellow-700">
              <FileCheck className="mr-2 h-4 w-4" />
              Convertir en facture
            </Button>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
