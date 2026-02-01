"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Clock, User, MapPin, Paperclip, Users, Loader2 } from "lucide-react";

type Collaborator = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type AttachmentMeta = {
  name: string;
  size: number;
  type: string;
};

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "Réunion" | "Appel" | "Deadline" | "Autre";
  status: "Planifié" | "Confirmé" | "Terminé" | "Annulé";
  client?: string;
  location?: string;
  description?: string;
  projectType?: string;
  collaborators?: Collaborator[];
  attachments?: AttachmentMeta[];
};

const planningLocalStorageKey = "planningEvents";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [collabDialogOpen, setCollabDialogOpen] = useState(false);

  // Form values
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newCollabName, setNewCollabName] = useState("");

  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined);

  useEffect(() => {
    const load = async () => {
      try {
        const [apiEvents, storedEvents] = await Promise.all([
          fetch("/api/dashboard/planning", { credentials: "include" })
            .then(async (r) => (r.ok ? r.json() : { events: [] }))
            .then((d) => (d.events || []) as Event[]),
          (async () => {
            try {
              const raw = window.localStorage.getItem(planningLocalStorageKey);
              if (!raw) return [] as Event[];
              const parsed = JSON.parse(raw) as Event[];
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [] as Event[];
            }
          })(),
        ]);

        // Merge: custom events first so they win if IDs collide
        setEvents([...storedEvents, ...apiEvents]);
      } catch (error) {
        console.error("Erreur chargement planning:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const event = useMemo(() => events.find((e) => e.id === id), [events, id]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/dashboard/projets?tab=planning");
  };

  const updateEvent = async (updates: Partial<Event>) => {
    if (!id) return false;
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/planning", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, ...data.event } : e))
        );
        return true;
      }
    } catch (error) {
      console.error("Erreur modification:", error);
    } finally {
      setSaving(false);
    }
    return false;
  };

  const handleUpdateDate = async () => {
    if (!newDate) return;
    const success = await updateEvent({ date: newDate });
    if (success) {
      setDateDialogOpen(false);
      setNewDate("");
    }
  };

  const handleUpdateTime = async () => {
    if (!newTime) return;
    const success = await updateEvent({ time: newTime });
    if (success) {
      setTimeDialogOpen(false);
      setNewTime("");
    }
  };

  const handleCancelEvent = async () => {
    const success = await updateEvent({ status: "Annulé" });
    if (success) {
      setCancelDialogOpen(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollabName.trim() || !event) return;
    const newCollab: Collaborator = {
      id: `collab-${Date.now()}`,
      name: newCollabName.trim(),
    };
    const updatedCollabs = [...(event.collaborators || []), newCollab];
    const success = await updateEvent({ collaborators: updatedCollabs } as Partial<Event>);
    if (success) {
      setNewCollabName("");
    }
  };

  const handleRemoveCollaborator = async (collabId: string) => {
    if (!event) return;
    const updatedCollabs = (event.collaborators || []).filter((c) => c.id !== collabId);
    await updateEvent({ collaborators: updatedCollabs } as Partial<Event>);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h1 className="text-2xl">Chargement...</h1>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h1 className="text-2xl">Événement non trouvé</h1>
        <Button onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    "Réunion": "bg-blue-50 text-blue-700 border-blue-200",
    "Appel": "bg-green-50 text-green-700 border-green-200",
    "Deadline": "bg-red-50 text-red-700 border-red-200",
    "Autre": "bg-gray-50 text-gray-700 border-gray-200",
  };

  const statusColors: Record<string, string> = {
    "Planifié": "text-orange-600",
    "Confirmé": "text-emerald-600",
    "Terminé": "text-muted-foreground",
    "Annulé": "text-red-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg">{event.title}</h1>
            <Badge variant="secondary" className={typeColors[event.type]}>{event.type}</Badge>
            {event.projectType ? (
              <Badge variant="outline">{event.projectType}</Badge>
            ) : null}
            <span className={`text-sm ${statusColors[event.status]}`}>• {event.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(event.date).toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Heure</p>
                    <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {event.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client / Participant</p>
                    <p className="flex items-center gap-2"><User className="h-4 w-4" /> {event.client || "-"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Lieu</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p>{event.description || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Collaborateurs</p>
                  {event.collaborators && event.collaborators.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {event.collaborators.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 rounded-full border px-2 py-1">
                          <Avatar className="h-6 w-6">
                            {c.avatarUrl ? <AvatarImage src={c.avatarUrl} alt={c.name} /> : null}
                            <AvatarFallback className="text-[10px]">{getInitials(c.name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Non partagé</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Pièces jointes</p>
                  {event.attachments && event.attachments.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {event.attachments.map((f) => (
                        <div key={f.name} className="flex items-center justify-between rounded-lg border p-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">{f.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round(f.size / 1024)} Ko</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Aucun fichier</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setCollabDialogOpen(true)}
                disabled={saving}
              >
                <Users className="mr-2 h-4 w-4" />
                Gérer les collaborateurs
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  setNewDate(event.date);
                  setDateDialogOpen(true);
                }}
                disabled={saving}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Modifier la date
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => {
                  setNewTime(event.time);
                  setTimeDialogOpen(true);
                }}
                disabled={saving}
              >
                <Clock className="mr-2 h-4 w-4" />
                Changer l'heure
              </Button>
              <Button 
                className="w-full justify-start text-red-600" 
                variant="outline"
                onClick={() => setCancelDialogOpen(true)}
                disabled={saving || event.status === "Annulé"}
              >
                Annuler l'événement
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog: Modifier la date */}
      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la date</DialogTitle>
            <DialogDescription>Choisissez une nouvelle date pour cet événement.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDateDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateDate} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Changer l'heure */}
      <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer l'heure</DialogTitle>
            <DialogDescription>Choisissez une nouvelle heure pour cet événement.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimeDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateTime} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Annuler l'événement */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler cet événement ?</DialogTitle>
            <DialogDescription>L'événement sera marqué comme annulé. Cette action peut être annulée.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Retour</Button>
            <Button variant="destructive" onClick={handleCancelEvent} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Gérer les collaborateurs */}
      <Dialog open={collabDialogOpen} onOpenChange={setCollabDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer les collaborateurs</DialogTitle>
            <DialogDescription>Ajoutez ou supprimez des collaborateurs pour cet événement.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nom du collaborateur"
                value={newCollabName}
                onChange={(e) => setNewCollabName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCollaborator();
                  }
                }}
              />
              <Button onClick={handleAddCollaborator} disabled={saving || !newCollabName.trim()}>
                Ajouter
              </Button>
            </div>
            {event.collaborators && event.collaborators.length > 0 ? (
              <div className="space-y-2">
                {event.collaborators.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {c.avatarUrl ? <AvatarImage src={c.avatarUrl} alt={c.name} /> : null}
                        <AvatarFallback className="text-[10px]">{getInitials(c.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{c.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveCollaborator(c.id)}
                      disabled={saving}
                    >
                      Retirer
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun collaborateur ajouté.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollabDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
