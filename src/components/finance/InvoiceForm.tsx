"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NotionPropertyRow } from "@/components/ui/notion-property-row";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, CreditCard, FileText, Mail, Phone } from "lucide-react";

type Prestataire = {
  nom: string;
  activite: string;
  telephone: string;
  email: string;
  ville: string;
  pays: string;
};

type InvoiceFormData = {
  clientNom: string;
  clientTelephone: string;
  clientEmail: string;
  referenceDevis: string;
  description: string;
  montantTotal: number;
  montantPaye: number;
  modePaiement: string;
  statut: "A régler" | "Acquittée";
};

type InvoiceFormProps = {
  onSubmit: (data: InvoiceFormData) => void;
  onCancel: () => void;
  devisReference?: string;
};

export default function InvoiceForm({ onSubmit, onCancel, devisReference }: InvoiceFormProps) {
  const [prestataire, setPrestataire] = useState<Prestataire | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<InvoiceFormData>({
    clientNom: "",
    clientTelephone: "",
    clientEmail: "",
    referenceDevis: devisReference || "",
    description: "",
    montantTotal: 0,
    montantPaye: 0,
    modePaiement: "Virement bancaire",
    statut: "A régler",
  });

  const numeroFacture = `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  const dateEmission = new Date().toLocaleDateString("fr-FR");
  const montantRestant = formData.montantTotal - formData.montantPaye;

  useEffect(() => {
    const fetchPrestataire = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (!response.ok) throw new Error("Unauthorized");
        const json = await response.json();
        const data = json?.user ?? {};
        setPrestataire({
          nom: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Freelance",
          activite: Array.isArray(data.skills) ? data.skills.join(", ") : "Développeur Web",
          telephone: data.phone || "",
          email: data.email || "",
          ville: data.city || "Abidjan",
          pays: data.country || "Côte d'Ivoire",
        });
      } catch (error) {
        console.error("Erreur chargement profil:", error);
        setPrestataire({
          nom: "Freelance",
          activite: "Développeur Web",
          telephone: "",
          email: "",
          ville: "Abidjan",
          pays: "Côte d'Ivoire",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPrestataire();
  }, []);

  const handleChange = (field: keyof InvoiceFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loading) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête automatique */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-semibold">N° Facture: {numeroFacture}</p>
          {formData.referenceDevis && (
            <p className="text-muted-foreground">Réf. Devis: {formData.referenceDevis}</p>
          )}
        </div>
        <div className="sm:text-right">
          <p>Date: {dateEmission}</p>
        </div>
      </div>

      <Separator />

      {/* Prestataire (lecture seule) */}
      {/* <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Prestataire
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p className="font-medium">{prestataire?.nom}</p>
          <p className="text-muted-foreground">{prestataire?.activite}</p>
          <p>{prestataire?.telephone}</p>
          <p>{prestataire?.email}</p>
          <p>{prestataire?.ville}, {prestataire?.pays}</p>
        </CardContent>
      </Card> */}

      {/* Client (saisie manuelle) */}
      <div className="rounded-xl border bg-background divide-y">
        <NotionPropertyRow label="Nom" icon={<Building2 className="h-4 w-4" />}>
          <Input
            value={formData.clientNom}
            onChange={(e) => handleChange("clientNom", e.target.value)}
            placeholder="Nom du client ou entreprise"
            required
            className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
          />
        </NotionPropertyRow>

        <NotionPropertyRow label="Téléphone" icon={<Phone className="h-4 w-4" />}>
          <Input
            value={formData.clientTelephone}
            onChange={(e) => handleChange("clientTelephone", e.target.value)}
            placeholder="+225 XX XX XX XX"
            required
            className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
          />
        </NotionPropertyRow>

        <NotionPropertyRow label="Email" icon={<Mail className="h-4 w-4" />}>
          <Input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => handleChange("clientEmail", e.target.value)}
            placeholder="email@exemple.com"
            className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
          />
        </NotionPropertyRow>
      </div>

      <Separator />

      {/* Détails de la facture */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Ajouter une description…"
            rows={3}
            required
            className="min-h-[96px] px-0 border-0 bg-transparent focus-visible:ring-0 resize-none"
          />
        </div>

        <div className="rounded-xl border bg-background divide-y">
          <NotionPropertyRow label="Réf. devis" icon={<FileText className="h-4 w-4" />}>
            <Input
              value={formData.referenceDevis}
              onChange={(e) => handleChange("referenceDevis", e.target.value)}
              placeholder="Ex: DEV-2024-0001"
              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
            />
          </NotionPropertyRow>

          <NotionPropertyRow label="Paiement" icon={<CreditCard className="h-4 w-4" />}>
            <Select value={formData.modePaiement} onValueChange={(value) => handleChange("modePaiement", value)}>
              <SelectTrigger className="h-8 border-0 bg-transparent px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Virement bancaire">Virement bancaire</SelectItem>
                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                <SelectItem value="Espèces">Espèces</SelectItem>
                <SelectItem value="Chèque">Chèque</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </NotionPropertyRow>

          <NotionPropertyRow label="Statut" icon={<FileText className="h-4 w-4" />}>
            <Select
              value={formData.statut}
              onValueChange={(value) => handleChange("statut", value as "A régler" | "Acquittée")}
            >
              <SelectTrigger className="h-8 border-0 bg-transparent px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A régler">Facture à régler</SelectItem>
                <SelectItem value="Acquittée">Facture acquittée</SelectItem>
              </SelectContent>
            </Select>
          </NotionPropertyRow>
        </div>

        <div className="rounded-xl border bg-background divide-y">
          <NotionPropertyRow label="Total" icon={<Building2 className="h-4 w-4" />}>
            <Input
              type="number"
              value={formData.montantTotal || ""}
              onChange={(e) => handleChange("montantTotal", parseInt(e.target.value) || 0)}
              placeholder="0"
              required
              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
            />
          </NotionPropertyRow>
          <NotionPropertyRow label="Payé" icon={<Building2 className="h-4 w-4" />}>
            <Input
              type="number"
              value={formData.montantPaye || ""}
              onChange={(e) => handleChange("montantPaye", parseInt(e.target.value) || 0)}
              placeholder="0"
              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
            />
          </NotionPropertyRow>
          <NotionPropertyRow label="Restant" icon={<Building2 className="h-4 w-4" />}>
            <Input
              type="number"
              value={montantRestant}
              disabled
              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
            />
          </NotionPropertyRow>
        </div>
      </div>

      <Separator />

      {/* Résumé */}
      <Card className={formData.statut === "Acquittée" ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"}>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">
                {formData.statut === "Acquittée" ? "Facture acquittée" : "Facture à régler"}
              </p>
              <p className="text-xs text-muted-foreground">Mode: {formData.modePaiement}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">
                {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(formData.montantTotal)}
              </p>
              {montantRestant > 0 && (
                <p className="text-sm text-orange-600">
                  Reste: {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" }).format(montantRestant)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Annuler
        </Button>
        <Button type="submit" className="w-full sm:w-auto">Créer la facture</Button>
      </div>
    </form>
  );
}
