"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SiteWebPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site web</CardTitle>
          <CardDescription>Portfolio public et vitrine</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug du portfolio</label>
            <Input defaultValue="mon-portfolio" />
            <p className="text-xs text-muted-foreground">
              Ce slug servira à générer une URL publique (à brancher).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" asChild>
              <Link href="/" target="_blank" rel="noreferrer">
                Voir l’aperçu (bientôt)
              </Link>
            </Button>
            <Button disabled>Publier (bientôt)</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sections du portfolio</CardTitle>
          <CardDescription>À compléter</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <p className="font-medium text-sm">À propos</p>
            <p className="text-xs text-muted-foreground">Bio, expertise, localisation</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium text-sm">Projets</p>
            <p className="text-xs text-muted-foreground">Portfolio + cas clients</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium text-sm">Contact</p>
            <p className="text-xs text-muted-foreground">Formulaire et liens</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
