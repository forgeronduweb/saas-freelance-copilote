"use client";

import { useMemo, useState, useEffect } from "react";
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
import { Building2, Calendar, Mail, Phone, Plus, Timer } from "lucide-react";

type Prestataire = {
  nom: string;
  activite: string;
  telephone: string;
  email: string;
  ville: string;
  pays: string;
};

type QuoteAction = {
  label: string;
  amount: number;
};

type ClientOption = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
};

type QuoteFormData = {
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
  actions: QuoteAction[];
};

type QuoteFormProps = {
  onSubmit: (data: QuoteFormData) => void;
  onCancel: () => void;
};

export default function QuoteForm({ onSubmit, onCancel }: QuoteFormProps) {
  const [prestataire, setPrestataire] = useState<Prestataire | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>("manual");
  const [formData, setFormData] = useState<QuoteFormData>({
    clientId: undefined,
    clientNom: "",
    clientTelephone: "",
    clientEmail: "",
    objet: "",
    description: "",
    delaiRealisation: "",
    dureeValidite: 30,
    montant: 0,
    acompte: 0,
    conditions: "Paiement à réception de facture. Acompte de 30% à la signature.",
    actions: [{ label: "", amount: 0 }],
  });

  const computedTotal = useMemo(() => {
    return formData.actions.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [formData.actions]);

  const numeroDevis = `DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  const dateEmission = new Date().toLocaleDateString("fr-FR");

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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/dashboard/clients", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          setClients((json?.clients || []) as ClientOption[]);
        }
      } catch (error) {
        console.error("Erreur chargement clients:", error);
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleChange = (field: keyof QuoteFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleActionChange = (index: number, field: keyof QuoteAction, value: string | number) => {
    setFormData((prev) => {
      const next = [...prev.actions];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, actions: next };
    });
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);

    if (clientId === "manual") {
      setFormData((prev) => ({
        ...prev,
        clientId: undefined,
        clientNom: "",
        clientTelephone: "",
        clientEmail: "",
      }));
      return;
    }

    const selected = clients.find((c) => c.id === clientId);
    if (!selected) return;

    setFormData((prev) => ({
      ...prev,
      clientId: selected.id,
      clientNom: selected.company?.trim() ? selected.company : selected.name,
      clientTelephone: selected.phone || "",
      clientEmail: selected.email || "",
    }));
  };

  const addAction = () => {
    setFormData((prev) => ({ ...prev, actions: [...prev.actions, { label: "", amount: 0 }] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, montant: computedTotal });
  };

  if (loading) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête automatique */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-semibold">N° Devis: {numeroDevis}</p>
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
        <NotionPropertyRow label="Contact" icon={<Building2 className="h-4 w-4" />}>
          <Select value={selectedClientId} onValueChange={handleSelectClient} disabled={clientsLoading}>
            <SelectTrigger className="h-8 border-0 bg-transparent px-2">
              <SelectValue placeholder={clientsLoading ? "Chargement..." : "Sélectionner un contact"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Saisie manuelle</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.company?.trim() ? `${c.company} — ${c.name}` : c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </NotionPropertyRow>

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

      {/* Détails du devis */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            value={formData.objet}
            onChange={(e) => handleChange("objet", e.target.value)}
            placeholder="Objet du devis"
            required
            className="h-12 px-0 text-lg font-semibold border-0 bg-transparent focus-visible:ring-0"
          />
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Ajouter une description…"
            rows={4}
            required
            className="min-h-[96px] px-0 border-0 bg-transparent focus-visible:ring-0 resize-none"
          />
        </div>

        <div className="rounded-xl border bg-background divide-y">
          <NotionPropertyRow label="Délai" icon={<Timer className="h-4 w-4" />}>
            <Input
              value={formData.delaiRealisation}
              onChange={(e) => handleChange("delaiRealisation", e.target.value)}
              placeholder="Ex: 2 semaines"
              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
            />
          </NotionPropertyRow>

          <NotionPropertyRow label="Validité" icon={<Calendar className="h-4 w-4" />}>
            <Input
              type="number"
              value={formData.dureeValidite}
              onChange={(e) => handleChange("dureeValidite", parseInt(e.target.value) || 30)}
              min={1}
              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
            />
          </NotionPropertyRow>

          <NotionPropertyRow label="Total" icon={<Building2 className="h-4 w-4" />}>
            <Input
              type="number"
              value={computedTotal}
              placeholder="0"
              disabled
              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
              required
            />
          </NotionPropertyRow>

          <NotionPropertyRow label="Acompte" icon={<Building2 className="h-4 w-4" />}>
            <Input
              type="number"
              value={formData.acompte || ""}
              onChange={(e) => handleChange("acompte", parseInt(e.target.value) || 0)}
              placeholder="0"
              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
            />
          </NotionPropertyRow>
        </div>

        <Card>
          <CardHeader className="pb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm">Actions à réaliser</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addAction} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.actions.map((action, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Nom de l'action *</label>
                  <Input
                    value={action.label}
                    onChange={(e) => handleActionChange(index, "label", e.target.value)}
                    placeholder="Ex: Audit, Design, Développement..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Montant (FCFA) *</label>
                  <Input
                    type="number"
                    value={action.amount || ""}
                    onChange={(e) => handleActionChange(index, "amount", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Conditions</label>
          <Textarea
            value={formData.conditions}
            onChange={(e) => handleChange("conditions", e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <Separator />

      <div className="bg-muted/50 p-3 rounded-lg text-center text-sm">
        <p className="font-medium">Bon pour accord</p>
        <p className="text-muted-foreground">Signature du client: ___________________</p>
        <p className="text-muted-foreground">Date: ___________________</p>
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Annuler
        </Button>
        <Button type="submit" className="w-full sm:w-auto">Créer le devis</Button>
      </div>
    </form>
  );
}
