"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { Instagram, Linkedin, Twitter, Facebook, Loader2, Sparkles, Users, History, Building2, Mail } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const socialIcons: Record<string, ReactNode> = {
  Instagram: <Instagram className="h-5 w-5 text-pink-600" />,
  LinkedIn: <Linkedin className="h-5 w-5 text-blue-600" />,
  Twitter: <Twitter className="h-5 w-5 text-sky-500" />,
  Facebook: <Facebook className="h-5 w-5 text-blue-700" />,
};

const socialColors: Record<string, string> = {
  Instagram: "bg-pink-100",
  LinkedIn: "bg-blue-100",
  Twitter: "bg-sky-100",
  Facebook: "bg-blue-100",
};

function formatNumber(value: number) {
  return value.toLocaleString("fr-FR");
}

function sanitizePostContent(value: string) {
  return value.replaceAll("🎉", "").trim();
}

type Sector = "dev" | "design" | "marketing" | "consulting";

type PostStyle = "professionnel" | "decontracte" | "storytelling";

const sectorLabels: Record<Sector, string> = {
  dev: "Développement",
  design: "Design",
  marketing: "Marketing",
  consulting: "Consulting",
};

const styleLabels: Record<PostStyle, string> = {
  professionnel: "Professionnel",
  decontracte: "Décontracté",
  storytelling: "Storytelling",
};

type SavedPost = {
  id: string;
  platform: string;
  content: string;
  createdAt: string;
  source: string;
};

type ProspectSuggestion = {
  id: string;
  company: string;
  sector: string;
  reason: string;
  emailTemplate: string;
};

type MarketingData = {
  visitors: {
    total: number;
    growth: number;
    chartData: { month: string; desktop: number; mobile: number }[];
  };
  socialMedia: { platform: string; followers: number; growth: number }[];
  recentPosts: { platform: string; content: string; status: string; engagement: string | null; date: string }[];
};

type PlanningEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  status: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "Actif" | "Inactif" | "Prospect" | "Perdu";
  projects: number;
};

type ContentSourceType = "planning" | "client";

function buildPosts(params: {
  sourceType: ContentSourceType;
  title: string;
  dateLabel?: string;
  company?: string;
  sector?: Sector;
  style?: PostStyle;
}) {
  const { sourceType, title, dateLabel, company, sector = "dev", style = "professionnel" } = params;
  
  const sectorServices: Record<Sector, string> = {
    dev: "site web, application mobile, API",
    design: "identité visuelle, UI/UX, branding",
    marketing: "stratégie digitale, réseaux sociaux, SEO",
    consulting: "audit, accompagnement, formation",
  };

  const base = sourceType === "planning"
    ? `Nouveau jalon : ${title}${dateLabel ? ` (${dateLabel})` : ""}.`
    : `Nouveau contact : ${company ? `${company} — ` : ""}${title}.`;

  const services = sectorServices[sector];

  const templates: Record<PostStyle, { linkedIn: string; twitter: string; instagram: string }> = {
    professionnel: {
      linkedIn: [
        base,
        `Je suis disponible pour de nouvelles missions en ${sectorLabels[sector].toLowerCase()}.`,
        `Si vous avez un besoin (${services}), discutons-en.`,
        `#freelance #${sector} #business`,
      ].join("\n\n"),
      twitter: [
        base,
        `Dispo pour missions ${sectorLabels[sector].toLowerCase()}.`,
        "DM ouverts.",
      ].join(" "),
      instagram: [
        base,
        `Spécialiste ${sectorLabels[sector].toLowerCase()} - ${services}.`,
        "Contact en bio.",
      ].join("\n\n"),
    },
    decontracte: {
      linkedIn: [
        base,
        `Envie de bosser sur de nouveaux projets ${sectorLabels[sector].toLowerCase()} !`,
        `Mon truc : ${services}.`,
        "On en parle ?",
      ].join("\n\n"),
      twitter: [
        base,
        `Nouveau projet ? Je suis chaud !`,
        `${sectorLabels[sector]} = ma passion.`,
      ].join(" "),
      instagram: [
        base,
        `Ready pour de nouveaux défis ${sectorLabels[sector].toLowerCase()}.`,
        "Parlons de ton projet en DM.",
      ].join("\n\n"),
    },
    storytelling: {
      linkedIn: [
        base,
        `Quand j'ai commencé le ${sectorLabels[sector].toLowerCase()}, je ne savais pas que ça deviendrait ma passion.`,
        `Aujourd'hui, j'accompagne des entreprises sur des projets de ${services}.`,
        "Et vous, c'est quoi votre prochain défi ?",
      ].join("\n\n"),
      twitter: [
        base,
        `De passionné à expert ${sectorLabels[sector].toLowerCase()}.`,
        "Votre prochain projet pourrait être le mien.",
      ].join(" "),
      instagram: [
        base,
        `Mon parcours en ${sectorLabels[sector].toLowerCase()} m'a appris une chose : chaque projet est unique.`,
        "Le vôtre aussi. Parlons-en.",
      ].join("\n\n"),
    },
  };

  return templates[style];
}

function generateProspects(clients: Client[]): ProspectSuggestion[] {
  const activeClients = clients.filter((c) => c.status === "Actif");
  if (activeClients.length === 0) return [];

  const suggestions: ProspectSuggestion[] = [
    {
      id: "PROS-001",
      company: "TechStart Abidjan",
      sector: "Startup tech",
      reason: `Similaire à ${activeClients[0]?.company || "vos clients actifs"}`,
      emailTemplate: `Bonjour,\n\nJe me permets de vous contacter car j'accompagne des entreprises similaires à la vôtre dans le secteur tech.\n\nJ'ai notamment travaillé avec ${activeClients[0]?.company || "plusieurs startups"} sur des projets digitaux.\n\nSeriez-vous disponible pour un échange de 15 minutes ?\n\nCordialement`,
    },
    {
      id: "PROS-002",
      company: "Digital Agency CI",
      sector: "Agence digitale",
      reason: "Besoin potentiel de sous-traitance",
      emailTemplate: `Bonjour,\n\nEn tant que freelance spécialisé, je propose mes services aux agences qui ont besoin de renfort sur des projets.\n\nJe serais ravi de discuter d'une éventuelle collaboration.\n\nCordialement`,
    },
    {
      id: "PROS-003",
      company: "E-Commerce Plus CI",
      sector: "E-commerce",
      reason: "Secteur en croissance",
      emailTemplate: `Bonjour,\n\nLe e-commerce en Côte d'Ivoire connaît une croissance importante. J'accompagne des entreprises dans leur transformation digitale.\n\nPuis-je vous présenter mes services ?\n\nCordialement`,
    },
  ];

  return suggestions;
}

export default function MarketingPage() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<PlanningEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [sourceType, setSourceType] = useState<ContentSourceType>("planning");
  const [sourceId, setSourceId] = useState<string>("");
  const [posts, setPosts] = useState<{ linkedIn: string; twitter: string; instagram: string } | null>(null);
  const [sector, setSector] = useState<Sector>("dev");
  const [postStyle, setPostStyle] = useState<PostStyle>("professionnel");
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [prospects, setProspects] = useState<ProspectSuggestion[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SavedPost | null>(null);

  useEffect(() => {
    const fetchMarketing = async () => {
      try {
        const [marketingRes, planningRes, clientsRes] = await Promise.all([
          fetch('/api/dashboard/marketing'),
          fetch('/api/dashboard/planning'),
          fetch('/api/dashboard/clients'),
        ]);

        if (marketingRes.ok) {
          const result = await marketingRes.json();
          setData(result);
        }

        if (planningRes.ok) {
          const result = await planningRes.json();
          setEvents(Array.isArray(result?.events) ? result.events : []);
        }

        if (clientsRes.ok) {
          const result = await clientsRes.json();
          setClients(Array.isArray(result?.clients) ? result.clients : []);
        }
      } catch (error) {
        console.error('Erreur chargement marketing:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketing();
  }, []);

  useEffect(() => {
    const selected =
      sourceType === "planning"
        ? events.find((e) => e.id === sourceId)
        : clients.find((c) => c.id === sourceId);

    if (!selected) {
      setPosts(null);
      return;
    }

    if (sourceType === "planning") {
      const e = selected as PlanningEvent;
      setPosts(
        buildPosts({
          sourceType,
          title: e.title,
          dateLabel: e.date,
          sector,
          style: postStyle,
        })
      );
    } else {
      const c = selected as Client;
      setPosts(
        buildPosts({
          sourceType,
          title: c.name,
          company: c.company,
          sector,
          style: postStyle,
        })
      );
    }
  }, [clients, events, sourceId, sourceType, sector, postStyle]);

  useEffect(() => {
    if (clients.length > 0) {
      setProspects(generateProspects(clients));
    }
  }, [clients]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  const sourceOptions =
    sourceType === "planning"
      ? events.map((e) => ({
          id: e.id,
          label: `${e.title} • ${e.date}`,
        }))
      : clients.map((c) => ({
          id: c.id,
          label: `${c.company || c.name} • ${c.status}`,
        }));

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1200);
    } catch (e) {
      console.error("Erreur copie:", e);
    }
  };

  const handleSavePost = (platform: string, content: string) => {
    const newPost: SavedPost = {
      id: `POST-${Date.now()}`,
      platform,
      content,
      createdAt: new Date().toLocaleString("fr-FR"),
      source: sourceType === "planning" 
        ? events.find((e) => e.id === sourceId)?.title || "Agenda"
        : clients.find((c) => c.id === sourceId)?.company || "Client",
    };
    setSavedPosts((prev) => [newPost, ...prev]);
  };

  const handleDeleteSavedPost = (id: string) => {
    setSavedPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleConfirmDeleteSavedPost = () => {
    if (!deleteTarget) return;
    handleDeleteSavedPost(deleteTarget.id);
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce post ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteTarget(null);
              }}
            >
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirmDeleteSavedPost}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Générateur de contenu</CardTitle>
          <CardDescription>
            Choisis un élément de ton activité (agenda ou client) et récupère 3 textes prêts à publier.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Source</p>
              <Select
                value={sourceType}
                onValueChange={(v) => {
                  setSourceType(v as ContentSourceType);
                  setSourceId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Agenda</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Élément</p>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger>
                  <SelectValue placeholder={sourceType === "planning" ? "Événement" : "Client"} />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      Aucun élément
                    </SelectItem>
                  ) : (
                    sourceOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Secteur</p>
              <Select value={sector} onValueChange={(v) => setSector(v as Sector)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(sectorLabels) as Sector[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {sectorLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Style</p>
              <Select value={postStyle} onValueChange={(v) => setPostStyle(v as PostStyle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(styleLabels) as PostStyle[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {styleLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!posts ? (
            <div className="text-sm text-muted-foreground">Sélectionne une source et un élément pour générer les textes.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">LinkedIn</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleSavePost("LinkedIn", posts.linkedIn)}>
                      Sauvegarder
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleCopy("linkedin", posts.linkedIn)}>
                      {copiedKey === "linkedin" ? "Copié" : "Copier"}
                    </Button>
                  </div>
                </div>
                <Textarea value={posts.linkedIn} readOnly className="min-h-[160px]" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Twitter/X</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleSavePost("Twitter", posts.twitter)}>
                      Sauvegarder
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleCopy("twitter", posts.twitter)}>
                      {copiedKey === "twitter" ? "Copié" : "Copier"}
                    </Button>
                  </div>
                </div>
                <Textarea value={posts.twitter} readOnly className="min-h-[160px]" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Instagram</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleSavePost("Instagram", posts.instagram)}>
                      Sauvegarder
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleCopy("instagram", posts.instagram)}>
                      {copiedKey === "instagram" ? "Copié" : "Copier"}
                    </Button>
                  </div>
                </div>
                <Textarea value={posts.instagram} readOnly className="min-h-[160px]" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Réseaux sociaux</CardTitle>
            <CardDescription>Performance par plateforme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.socialMedia.map((item) => {
              const color = socialColors[item.platform] || "bg-muted";
              const icon = socialIcons[item.platform] || null;
              const growthClassName =
                item.growth > 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : item.growth < 0
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-gray-50 text-gray-700 border-gray-200";

              return (
                <div key={item.platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
                    <div>
                      <p className="font-medium">{item.platform}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(item.followers)} abonnés</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={growthClassName}>
                    {item.growth > 0 ? `+${item.growth}%` : `${item.growth}%`}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publications récentes</CardTitle>
            <CardDescription>Dernières publications programmées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentPosts.map((post, idx) => {
              const statusClassName =
                post.status === "Publié"
                  ? "text-muted-foreground"
                  : post.status === "Programmé"
                    ? "text-orange-600"
                    : "text-muted-foreground";

              return (
                <div key={`${post.platform}-${idx}`} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{post.platform}</Badge>
                    <span className={`text-xs ${statusClassName}`}>{post.status}</span>
                  </div>
                  <p className="text-sm font-medium">{sanitizePostContent(post.content)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {post.date}
                    {post.engagement ? ` • ${post.engagement}` : ""}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Prospection assistée
            </CardTitle>
            <CardDescription>Suggestions de prospects basées sur vos clients actifs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prospects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ajoutez des clients actifs pour obtenir des suggestions de prospects.</p>
            ) : (
              prospects.map((prospect) => (
                <div key={prospect.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{prospect.company}</p>
                    </div>
                    <Badge variant="secondary">{prospect.sector}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{prospect.reason}</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(`prospect-${prospect.id}`, prospect.emailTemplate)}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      {copiedKey === `prospect-${prospect.id}` ? "Copié" : "Copier email"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique des posts
            </CardTitle>
            <CardDescription>Posts générés et sauvegardés</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun post sauvegardé. Génère du contenu et clique sur &quot;Sauvegarder&quot;.</p>
            ) : (
              savedPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{post.platform}</Badge>
                    <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                  </div>
                  <p className="text-sm line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Source: {post.source}</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(`saved-${post.id}`, post.content)}
                      >
                        {copiedKey === `saved-${post.id}` ? "Copié" : "Copier"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteTarget(post);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
