"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EntreprisePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Entreprise</CardTitle>
          <CardDescription>Statut juridique et informations administratives</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Raison sociale</label>
            <Input placeholder="Ex: Tuma Consulting" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Statut juridique</label>
            <Input placeholder="Ex: EI, SARL, SASU..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Identifiant (SIRET/NIF/RCCM)</label>
            <Input placeholder="Ex: 123 456 789 00012" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Adresse</label>
            <Input placeholder="Adresse complète" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email pro</label>
            <Input placeholder="contact@exemple.com" type="email" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Téléphone</label>
            <Input placeholder="+225 ..." type="tel" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Kbis, assurance, attestations (à brancher)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline">Importer un document (bientôt)</Button>
          <Button disabled>Enregistrer (bientôt)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
