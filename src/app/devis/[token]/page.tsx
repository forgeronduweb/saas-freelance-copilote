"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type QuoteStatus = "Brouillon" | "Envoyé" | "Accepté" | "Refusé" | "Expiré";

type QuoteItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type QuoteSuggestion = {
  message: string;
  createdAt: string;
};

type PublicProvider = {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  skills?: string[];
};

type PublicQuote = {
  id: string;
  clientName: string;
  title?: string;
  description?: string;
  items: QuoteItem[];
  total: number;
  validUntil: string;
  status: QuoteStatus;
  provider?: PublicProvider | null;
  suggestions: QuoteSuggestion[];
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(amount);
}

export default function PublicQuotePage() {
  const params = useParams();
  const token = String(params.token);

  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sendingSuggestion, setSendingSuggestion] = useState(false);
  const [sendingDecision, setSendingDecision] = useState<"accept" | "refuse" | null>(null);

  const totalHT = useMemo(() => {
    if (!quote) return 0;
    return quote.items.reduce((sum, item) => sum + (Number(item.total) || item.quantity * item.unitPrice), 0);
  }, [quote]);

  const tva = useMemo(() => totalHT * 0.18, [totalHT]);
  const totalTTC = useMemo(() => totalHT + tva, [totalHT, tva]);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/public/quotes/${encodeURIComponent(token)}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setQuote(null);
          setError("Devis introuvable");
          return;
        }

        const json = await res.json();
        setQuote((json?.quote || null) as PublicQuote | null);
      } catch (e) {
        console.error("Erreur chargement devis public:", e);
        setError("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [token]);

  const submitSuggestion = async () => {
    const msg = message.trim();
    if (!msg) return;

    try {
      setSendingSuggestion(true);
      const res = await fetch(`/api/public/quotes/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      if (!res.ok) {
        return;
      }

      const json = await res.json();
      setQuote((json?.quote || null) as PublicQuote | null);
      setMessage("");
    } catch (e) {
      console.error("Erreur envoi suggestion:", e);
    } finally {
      setSendingSuggestion(false);
    }
  };

  const submitDecision = async (decision: "accept" | "refuse") => {
    try {
      setSendingDecision(decision);
      const res = await fetch(`/api/public/quotes/${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });

      if (!res.ok) {
        return;
      }

      const json = await res.json();
      setQuote((json?.quote || null) as PublicQuote | null);
    } catch (e) {
      console.error("Erreur décision:", e);
    } finally {
      setSendingDecision(null);
    }
  };

  const statusColor: Record<QuoteStatus, string> = {
    Brouillon: "bg-gray-50 text-gray-700 border-gray-200",
    Envoyé: "bg-blue-50 text-blue-700 border-blue-200",
    Accepté: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Refusé: "bg-red-50 text-red-700 border-red-200",
    Expiré: "bg-orange-50 text-orange-700 border-orange-200",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!quote || error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Devis introuvable</CardTitle>
            <CardDescription>{error || "Ce lien n'est pas valide."}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isDecided = quote.status === "Accepté" || quote.status === "Refusé";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl p-6 space-y-6">
        {quote.provider ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prestataire</CardTitle>
              <CardDescription>Informations du prestataire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{quote.provider.name}</p>
              <p>{quote.provider.email}</p>
              {quote.provider.phone ? <p>{quote.provider.phone}</p> : null}
              {quote.provider.city || quote.provider.country ? (
                <p>
                  {[quote.provider.city, quote.provider.country].filter(Boolean).join(", ")}
                </p>
              ) : null}
              {quote.provider.skills?.length ? (
                <p className="text-muted-foreground">{quote.provider.skills.join(", ")}</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{quote.title || "Devis"}</CardTitle>
                <CardDescription>
                  {quote.id} • {quote.clientName}
                </CardDescription>
              </div>
              <Badge variant="secondary" className={statusColor[quote.status]}>
                {quote.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {quote.description ? <p className="text-sm text-muted-foreground">{quote.description}</p> : null}

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm">Description</th>
                    <th className="text-center p-3 text-sm">Qté</th>
                    <th className="text-right p-3 text-sm">PU</th>
                    <th className="text-right p-3 text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-right">{formatCurrency(item.total ?? item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50">
                  <tr className="border-t">
                    <td colSpan={3} className="p-3 text-right">Total HT</td>
                    <td className="p-3 text-right">{formatCurrency(totalHT)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-3 text-right">TVA (18%)</td>
                    <td className="p-3 text-right">{formatCurrency(tva)}</td>
                  </tr>
                  <tr className="border-t">
                    <td colSpan={3} className="p-3 text-right text-lg">Total TTC</td>
                    <td className="p-3 text-right text-lg">{formatCurrency(totalTTC)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Valide jusqu'au: {new Date(quote.validUntil).toLocaleDateString("fr-FR")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => submitDecision("accept")}
                disabled={isDecided || sendingDecision !== null}
                className="bg-yellow-500 text-black hover:bg-yellow-600"
              >
                {sendingDecision === "accept" ? "Envoi..." : "Accepter"}
              </Button>
              <Button
                variant="outline"
                onClick={() => submitDecision("refuse")}
                disabled={isDecided || sendingDecision !== null}
                className="text-red-600"
              >
                {sendingDecision === "refuse" ? "Envoi..." : "Refuser"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suggestions</CardTitle>
            <CardDescription>Laissez un message au prestataire.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre suggestion..."
                rows={4}
              />
              <div className="flex justify-end">
                <Button onClick={submitSuggestion} disabled={sendingSuggestion || !message.trim()}>
                  {sendingSuggestion ? "Envoi..." : "Envoyer la suggestion"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {quote.suggestions?.length ? (
                quote.suggestions
                  .slice()
                  .reverse()
                  .map((s, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                      <p className="text-sm">{s.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucune suggestion pour le moment.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
