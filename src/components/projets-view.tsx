"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  ChevronDown,
  Clock,
  FileText,
  Flag,
  Loader2,
  Play,
  Square,
  Timer,
  Calendar,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotionPropertyRow } from "@/components/ui/notion-property-row";

type Mission = {
  id: string;
  title: string;
  client: string;
  status: "To-do" | "En cours" | "Terminé";
  dueDate?: string;
  evidenceUrls?: string[];
  checklist?: Array<{ text: string; done: boolean }>;
  verificationStatus?: "Aucun" | "En vérification" | "Validée" | "Refusée";
  verificationMessage?: string;
};

type Doc = {
  id: string;
  title: string;
  type: "Brief" | "Cahier des charges" | "Livrable";
  updatedAt: string;
};

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "Réunion" | "Appel" | "Deadline" | "Autre";
  status: "Planifié" | "Confirmé" | "Terminé" | "Annulé";
  description?: string;
  projectType?: string;
  collaborators?: Collaborator[];
  attachments?: AttachmentMeta[];
};

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

const planningLocalStorageKey = "planningEvents";
const timeTrackerLocalStorageKey = "timeTrackerState";

const collaboratorsSeed: Collaborator[] = [
  { id: "COL-001", name: "Awa" },
  { id: "COL-002", name: "Yao" },
  { id: "COL-003", name: "Fatou" },
  { id: "COL-004", name: "Moussa" },
  { id: "COL-005", name: "Sékou" },
];

const projectTypes = ["UX/UI", "Marketing", "Tech", "Branding", "Rédaction", "Autre"] as const;

export type ProjetsTab = "missions" | "time-tracker" | "documents" | "planning";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function stableHash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function enrichEvent(e: Event): Event {
  const seed = stableHash(e.id);
  const collabCount = seed % 4; // 0..3
  const collaborators = collabCount === 0 ? [] : collaboratorsSeed.slice(0, collabCount);
  const projectType = projectTypes[seed % projectTypes.length];

  return {
    ...e,
    description: e.description ?? "",
    projectType: e.projectType ?? projectType,
    collaborators: e.collaborators ?? collaborators,
    attachments: e.attachments ?? [],
  };
}

function AvatarStack({ collaborators }: { collaborators: Collaborator[] }) {
  const shown = collaborators.slice(0, 3);
  const extra = Math.max(0, collaborators.length - shown.length);

  return (
    <div className="flex items-center">
      {shown.map((c, idx) => (
        <Avatar key={c.id} className={"h-6 w-6 border" + (idx === 0 ? "" : " -ml-2")}>
          {c.avatarUrl ? <AvatarImage src={c.avatarUrl} alt={c.name} /> : null}
          <AvatarFallback className="text-[10px]">{getInitials(c.name)}</AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 ? (
        <div className="-ml-2 h-6 w-6 rounded-full border bg-muted flex items-center justify-center text-[10px]">
          +{extra}
        </div>
      ) : null}
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatEventDate(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return dateIso;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function ProjetsView({ activeTab }: { activeTab: ProjetsTab }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [missionCreateOpen, setMissionCreateOpen] = useState(false);
  const [creatingMission, setCreatingMission] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState("");
  const [newMissionClient, setNewMissionClient] = useState("");
  const [newMissionDescription, setNewMissionDescription] = useState("");
  const [newMissionPriority, setNewMissionPriority] = useState<"Basse" | "Moyenne" | "Haute">(
    "Moyenne"
  );
  const [newMissionDueDate, setNewMissionDueDate] = useState("");

  const [missionDetailsOpen, setMissionDetailsOpen] = useState(false);
  const [missionDetailsTarget, setMissionDetailsTarget] = useState<Mission | null>(null);
  const [missionDetailsEvidenceUrls, setMissionDetailsEvidenceUrls] = useState<string[]>([]);
  const [missionDetailsNewEvidenceUrl, setMissionDetailsNewEvidenceUrl] = useState("");
  const [missionDetailsChecklist, setMissionDetailsChecklist] = useState<
    Array<{ text: string; done: boolean }>
  >([]);
  const [missionDetailsNewChecklistText, setMissionDetailsNewChecklistText] = useState("");
  const [updatingMission, setUpdatingMission] = useState(false);

  const [requestingVerification, setRequestingVerification] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const readTimeTrackerState = ():
    | { running: boolean; startedAt?: number | null; elapsedSeconds?: number | null }
    | null => {
    try {
      const raw = window.localStorage.getItem(timeTrackerLocalStorageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const writeTimeTrackerState = (next: {
    running: boolean;
    startedAt: number | null;
    elapsedSeconds: number;
  }) => {
    try {
      window.localStorage.setItem(timeTrackerLocalStorageKey, JSON.stringify(next));
      window.dispatchEvent(new Event("time-tracker:update"));
    } catch {
      // ignore
    }
  };

  const handleStartTimer = () => {
    const startedAt = Date.now() - seconds * 1000;
    writeTimeTrackerState({ running: true, startedAt, elapsedSeconds: seconds });
    setIsRunning(true);
  };

  const handleStopTimer = () => {
    writeTimeTrackerState({ running: false, startedAt: null, elapsedSeconds: seconds });
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    writeTimeTrackerState({ running: false, startedAt: null, elapsedSeconds: 0 });
    setIsRunning(false);
    setSeconds(0);
  };

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState<Event["type"]>("Réunion");
  const [newStatus, setNewStatus] = useState<Event["status"]>("Planifié");
  const [newProjectType, setNewProjectType] = useState<string>("UX/UI");
  const [newCollaboratorIds, setNewCollaboratorIds] = useState<string[]>([]);
  const [collaboratorSearch, setCollaboratorSearch] = useState("");
  const [collaboratorsMenuOpen, setCollaboratorsMenuOpen] = useState(false);
  const [newAttachments, setNewAttachments] = useState<AttachmentMeta[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const selectedCollaborators = useMemo(() => {
    if (newCollaboratorIds.length === 0) return [];
    const selectedSet = new Set(newCollaboratorIds);
    return collaboratorsSeed.filter((c) => selectedSet.has(c.id));
  }, [newCollaboratorIds]);

  const filteredCollaborators = useMemo(() => {
    const q = collaboratorSearch.trim().toLowerCase();
    if (!q) return collaboratorsSeed;
    return collaboratorsSeed.filter((c) => c.name.toLowerCase().includes(q));
  }, [collaboratorSearch]);

  const persistEvents = (next: Event[]) => {
    try {
      const onlyCustom = next.filter((e) => e.id.startsWith("CUS-"));
      window.localStorage.setItem(planningLocalStorageKey, JSON.stringify(onlyCustom));
    } catch {
      // ignore
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Si c'est un événement local (CUS-), le supprimer du localStorage
      if (eventId.startsWith("CUS-")) {
        setEvents((prev) => {
          const next = prev.filter((e) => e.id !== eventId);
          persistEvents(next);
          return next;
        });
        toast.success("Événement supprimé");
        return;
      }

      // Sinon, supprimer via l'API
      const res = await fetch(`/api/dashboard/planning?id=${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        toast.success("Événement supprimé");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast.error("Erreur de connexion au serveur");
    }
  };

  const handleRequestDeleteEvent = (eventId: string) => {
    setDeleteTargetId(eventId);
    setDeleteConfirmOpen(true);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [missionsRes, docsRes, apiEvents, storedEvents] = await Promise.all([
          fetch("/api/dashboard/missions", { credentials: "include" })
            .then(async (r) => (r.ok ? r.json() : { missions: [] }))
            .then((d) => (d.missions || []) as Mission[]),
          fetch("/api/dashboard/documents", { credentials: "include" })
            .then(async (r) => (r.ok ? r.json() : { documents: [] }))
            .then((d) => (d.documents || []) as Doc[]),
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

        setMissions(missionsRes);
        setDocs(docsRes);

        const enrichedApi = apiEvents.map(enrichEvent);
        setEvents([...storedEvents, ...enrichedApi]);
      } catch (error) {
        console.error("Erreur chargement projets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    const saved = readTimeTrackerState();
    if (!saved) return;

    if (saved.running && typeof saved.startedAt === "number") {
      const initialSeconds = Math.max(0, Math.floor((Date.now() - saved.startedAt) / 1000));
      setSeconds(initialSeconds);
      setIsRunning(true);
      return;
    }

    if (typeof saved.elapsedSeconds === "number") {
      setSeconds(Math.max(0, Math.floor(saved.elapsedSeconds)));
    }
  }, []);

  const handleCreateEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/dashboard/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newTitle.trim() || "(Sans titre)",
          description: newDescription.trim(),
          date: newDate || new Date().toISOString().slice(0, 10),
          time: newTime || "09:00",
          type: newType,
          status: newStatus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newEvent = enrichEvent({
          id: data.event?.id || `EVT-${Date.now()}`,
          title: newTitle.trim() || "(Sans titre)",
          description: newDescription.trim(),
          date: newDate || new Date().toISOString().slice(0, 10),
          time: newTime || "09:00",
          type: newType,
          status: newStatus,
          projectType: newProjectType,
          collaborators: collaboratorsSeed.filter((c) => newCollaboratorIds.includes(c.id)),
          attachments: newAttachments,
        });
        setEvents((prev) => [newEvent, ...prev]);
        toast.success("Événement créé");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur création événement:", error);
      toast.error("Erreur de connexion au serveur");
    }

    setCreateOpen(false);
    setNewTitle("");
    setNewDescription("");
    setNewDate("");
    setNewTime("");
    setNewType("Réunion");
    setNewStatus("Planifié");
    setNewProjectType("UX/UI");
    setNewCollaboratorIds([]);
    setNewAttachments([]);
  };

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const grouped = useMemo(() => {
    return {
      todo: missions.filter((m) => m.status === "To-do"),
      doing: missions.filter((m) => m.status === "En cours"),
      done: missions.filter((m) => m.status === "Terminé"),
    };
  }, [missions]);

  const handleCreateMission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (creatingMission) return;

    setCreatingMission(true);

    try {
      const res = await fetch("/api/dashboard/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newMissionTitle.trim(),
          client: newMissionClient.trim(),
          clientName: newMissionClient.trim(),
          description: newMissionDescription.trim() || undefined,
          priority: newMissionPriority,
          dueDate: newMissionDueDate || undefined,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erreur lors de la création");
        return;
      }

      const created = data?.mission as
        | { id: string; title: string; client?: string; status?: Mission["status"]; dueDate?: string }
        | undefined;

      if (created?.id) {
        setMissions((prev) => [
          {
            id: created.id,
            title: created.title,
            client: created.client || newMissionClient.trim(),
            status: (created.status as Mission["status"]) || "To-do",
            dueDate: created.dueDate,
          },
          ...prev,
        ]);
      }

      toast.success("Mission créée.");

      setMissionCreateOpen(false);
      setNewMissionTitle("");
      setNewMissionClient("");
      setNewMissionDescription("");
      setNewMissionPriority("Moyenne");
      setNewMissionDueDate("");
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setCreatingMission(false);
    }
  };

  const openMissionDetails = (mission: Mission) => {
    setMissionDetailsTarget(mission);
    setMissionDetailsEvidenceUrls(Array.isArray(mission.evidenceUrls) ? mission.evidenceUrls : []);
    setMissionDetailsChecklist(Array.isArray(mission.checklist) ? mission.checklist : []);
    setMissionDetailsNewEvidenceUrl("");
    setMissionDetailsNewChecklistText("");
    setMissionDetailsOpen(true);
  };

  const handleRequestVerification = async () => {
    if (!missionDetailsTarget) return;
    if (requestingVerification) return;

    setRequestingVerification(true);

    try {
      const res = await fetch("/api/dashboard/missions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: missionDetailsTarget.id,
          requestVerification: true,
          evidenceUrls: missionDetailsEvidenceUrls,
          checklist: missionDetailsChecklist,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erreur lors de la soumission");
        return;
      }

      const updated = data?.mission as
        | {
            id: string;
            status?: Mission["status"];
            evidenceUrls?: string[];
            checklist?: Array<{ text: string; done: boolean }>;
            verificationStatus?: Mission["verificationStatus"];
            verificationMessage?: string;
          }
        | undefined;

      if (updated?.id) {
        setMissions((prev) =>
          prev.map((m) =>
            m.id === updated.id
              ? {
                  ...m,
                  status: (updated.status as Mission["status"]) || m.status,
                  evidenceUrls: updated.evidenceUrls || missionDetailsEvidenceUrls,
                  checklist: updated.checklist || missionDetailsChecklist,
                  verificationStatus: updated.verificationStatus,
                  verificationMessage: updated.verificationMessage,
                }
              : m
          )
        );

        setMissionDetailsTarget((prev) =>
          prev
            ? {
                ...prev,
                status: (updated.status as Mission["status"]) || prev.status,
                evidenceUrls: updated.evidenceUrls || missionDetailsEvidenceUrls,
                checklist: updated.checklist || missionDetailsChecklist,
                verificationStatus: updated.verificationStatus,
                verificationMessage: updated.verificationMessage,
              }
            : prev
        );

        if (updated.verificationStatus === "Validée") {
          toast.success("Preuves validées. Mission terminée.");
        } else if (updated.verificationStatus === "Refusée") {
          toast.error("Soumission refusée.", {
            description: updated.verificationMessage || "Ajoute une preuve ou complète la checklist.",
          });
        } else {
          toast("Soumission envoyée.");
        }
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setRequestingVerification(false);
    }
  };

  const handleUpdateMissionStatus = async () => {
    if (!missionDetailsTarget) return;
    if (updatingMission) return;

    setUpdatingMission(true);

    try {
      const res = await fetch("/api/dashboard/missions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: missionDetailsTarget.id,
          evidenceUrls: missionDetailsEvidenceUrls,
          checklist: missionDetailsChecklist,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erreur lors de la mise à jour");
        return;
      }

      const updated = data?.mission as
        | {
            id: string;
            status?: Mission["status"];
            evidenceUrls?: string[];
            checklist?: Array<{ text: string; done: boolean }>;
            verificationStatus?: Mission["verificationStatus"];
            verificationMessage?: string;
          }
        | undefined;

      if (updated?.id) {
        setMissions((prev) =>
          prev.map((m) =>
            m.id === updated.id
              ? {
                  ...m,
                  status: (updated.status as Mission["status"]) || m.status,
                  evidenceUrls: updated.evidenceUrls || missionDetailsEvidenceUrls,
                  checklist: updated.checklist || missionDetailsChecklist,
                  verificationStatus: updated.verificationStatus,
                  verificationMessage: updated.verificationMessage,
                }
              : m
          )
        );

        setMissionDetailsTarget((prev) =>
          prev
            ? {
                ...prev,
                status: (updated.status as Mission["status"]) || prev.status,
                evidenceUrls: updated.evidenceUrls || missionDetailsEvidenceUrls,
                checklist: updated.checklist || missionDetailsChecklist,
                verificationStatus: updated.verificationStatus,
                verificationMessage: updated.verificationMessage,
              }
            : prev
        );
      }

      toast.success("Avancement enregistré.");
      setMissionDetailsOpen(false);
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setUpdatingMission(false);
    }
  };

  const planningBoard = useMemo(() => {
    const columns: Array<{ key: Event["status"]; title: string }> = [
      { key: "Planifié", title: "Planifié" },
      { key: "Confirmé", title: "Confirmé" },
      { key: "Terminé", title: "Terminé" },
      { key: "Annulé", title: "Annulé" },
    ];

    const byStatus = columns.reduce<Record<Event["status"], Event[]>>(
      (acc, col) => {
        acc[col.key] = events.filter((e) => e.status === col.key);
        return acc;
      },
      {
        Planifié: [],
        Confirmé: [],
        Terminé: [],
        Annulé: [],
      }
    );

    return { columns, byStatus };
  }, [events]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="missions" className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Missions</p>
              <p className="text-sm text-muted-foreground">Crée et suis tes tâches de production.</p>
            </div>

            <Sheet
              open={missionCreateOpen}
              onOpenChange={(open) => {
                if (creatingMission) return;
                setMissionCreateOpen(open);
              }}
            >
              <SheetTrigger asChild>
                <Button>
                  <Plus data-icon="inline-start" />
                  Nouvelle mission
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Nouvelle mission</SheetTitle>
                  <SheetDescription>Ajoute une tâche de production à suivre dans ton board.</SheetDescription>
                </SheetHeader>

                <form onSubmit={handleCreateMission} className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="mission-title"
                      value={newMissionTitle}
                      onChange={(e) => setNewMissionTitle(e.target.value)}
                      placeholder="Nom de la mission"
                      required
                      className="h-12 px-0 text-lg font-semibold border-0 bg-transparent focus-visible:ring-0"
                    />
                    <Textarea
                      id="mission-description"
                      value={newMissionDescription}
                      onChange={(e) => setNewMissionDescription(e.target.value)}
                      placeholder="Ajouter une description…"
                      className="min-h-[96px] px-0 border-0 bg-transparent focus-visible:ring-0 resize-none"
                    />
                  </div>

                  <div className="rounded-xl border bg-background divide-y">
                    <NotionPropertyRow label="Client" icon={<Briefcase className="h-4 w-4" />}>
                      <Input
                        id="mission-client"
                        value={newMissionClient}
                        onChange={(e) => setNewMissionClient(e.target.value)}
                        placeholder="Ex: ACME Corp"
                        required
                        className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                      />
                    </NotionPropertyRow>

                    <NotionPropertyRow label="Priorité" icon={<Flag className="h-4 w-4" />}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-sm hover:bg-accent/40"
                          >
                            <span>{newMissionPriority}</span>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-44">
                          <DropdownMenuRadioGroup
                            value={newMissionPriority}
                            onValueChange={(v) =>
                              setNewMissionPriority(v as "Basse" | "Moyenne" | "Haute")
                            }
                          >
                            <DropdownMenuRadioItem value="Basse">Basse</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Moyenne">Moyenne</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Haute">Haute</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </NotionPropertyRow>

                    <NotionPropertyRow label="Échéance" icon={<Calendar className="h-4 w-4" />}>
                      <Input
                        id="mission-dueDate"
                        type="date"
                        value={newMissionDueDate}
                        onChange={(e) => setNewMissionDueDate(e.target.value)}
                        className="h-8 w-full border-0 bg-transparent px-2 focus-visible:ring-0"
                      />
                    </NotionPropertyRow>
                  </div>

                  <SheetFooter>
                    <Button type="submit" disabled={creatingMission}>
                      {creatingMission ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Créer la mission
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>

          <Dialog
            open={missionDetailsOpen}
            onOpenChange={(open) => {
              if (updatingMission) return;
              setMissionDetailsOpen(open);
              if (!open) {
                setMissionDetailsTarget(null);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Détails de la mission</DialogTitle>
                <DialogDescription>Consulte et mets à jour l’avancement de cette tâche.</DialogDescription>
              </DialogHeader>

              {missionDetailsTarget ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{missionDetailsTarget.title}</p>
                    <p className="text-sm text-muted-foreground">{missionDetailsTarget.client}</p>
                    {missionDetailsTarget.dueDate ? (
                      <p className="text-sm text-muted-foreground">Échéance : {missionDetailsTarget.dueDate}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm">Statut</label>
                    <Input value={missionDetailsTarget.status} readOnly />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Vérification</p>
                    <p className="text-sm text-muted-foreground">
                      {missionDetailsTarget.verificationStatus || "Aucun"}
                      {missionDetailsTarget.verificationMessage
                        ? ` • ${missionDetailsTarget.verificationMessage}`
                        : ""}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Preuves</p>
                    <p className="text-sm text-muted-foreground">
                      Ajoute un lien vers un livrable / justificatif (Drive, Notion, Figma, document, email, etc.).
                    </p>

                    {missionDetailsEvidenceUrls.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune preuve.</p>
                    ) : (
                      <div className="space-y-2">
                        {missionDetailsEvidenceUrls.map((url, idx) => (
                          <div key={`${url}-${idx}`} className="flex items-center gap-2">
                            <Input value={url} readOnly />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setMissionDetailsEvidenceUrls((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              Retirer
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Input
                        value={missionDetailsNewEvidenceUrl}
                        onChange={(e) => setMissionDetailsNewEvidenceUrl(e.target.value)}
                        placeholder="Colle un lien (https://...)"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const next = missionDetailsNewEvidenceUrl.trim();
                          if (!next) return;
                          setMissionDetailsEvidenceUrls((prev) => [...prev, next]);
                          setMissionDetailsNewEvidenceUrl("");
                        }}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Checklist</p>
                    <p className="text-sm text-muted-foreground">
                      Découpe la mission en étapes concrètes. Ça rend l’avancement mesurable.
                    </p>

                    {missionDetailsChecklist.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune checklist.</p>
                    ) : (
                      <div className="space-y-2">
                        {missionDetailsChecklist.map((item, idx) => (
                          <div key={`${item.text}-${idx}`} className="flex items-center gap-2">
                            <Checkbox
                              checked={item.done}
                              onCheckedChange={(checked) => {
                                const done = checked === true;
                                setMissionDetailsChecklist((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, done } : it))
                                );
                              }}
                            />
                            <Input value={item.text} readOnly />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setMissionDetailsChecklist((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              Retirer
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Input
                        value={missionDetailsNewChecklistText}
                        onChange={(e) => setMissionDetailsNewChecklistText(e.target.value)}
                        placeholder="Ex: Brouillon, Relecture, Livraison..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const text = missionDetailsNewChecklistText.trim();
                          if (!text) return;
                          setMissionDetailsChecklist((prev) => [...prev, { text, done: false }]);
                          setMissionDetailsNewChecklistText("");
                        }}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" onClick={handleUpdateMissionStatus} disabled={updatingMission}>
                      {updatingMission ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Enregistrer
                    </Button>
                    <Button
                      type="button"
                      onClick={handleRequestVerification}
                      disabled={requestingVerification}
                      variant="secondary"
                    >
                      {requestingVerification ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Soumettre les preuves
                    </Button>
                  </DialogFooter>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">To-do</CardTitle>
                <CardDescription>À planifier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped.todo.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Rien à faire.</p>
                ) : (
                  grouped.todo.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="p-3 rounded-lg border text-left w-full hover:bg-accent/30"
                      onClick={() => openMissionDetails(m)}
                    >
                      <p className="font-medium text-sm">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.client}
                        {m.dueDate ? ` • ${m.dueDate}` : ""}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {m.status}
                      </Badge>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">En cours</CardTitle>
                <CardDescription>À livrer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped.doing.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune mission en cours.</p>
                ) : (
                  grouped.doing.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="p-3 rounded-lg border text-left w-full hover:bg-accent/30"
                      onClick={() => openMissionDetails(m)}
                    >
                      <p className="font-medium text-sm">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.client}
                        {m.dueDate ? ` • ${m.dueDate}` : ""}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {m.status}
                      </Badge>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Terminé</CardTitle>
                <CardDescription>Historique</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped.done.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune mission terminée.</p>
                ) : (
                  grouped.done.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="p-3 rounded-lg border text-left w-full hover:bg-accent/30"
                      onClick={() => openMissionDetails(m)}
                    >
                      <p className="font-medium text-sm">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.client}
                        {m.dueDate ? ` • ${m.dueDate}` : ""}
                      </p>
                      <Badge className="mt-2">{m.status}</Badge>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning" className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Board agenda</p>
              <p className="text-sm text-muted-foreground">
                Glissez-déposez bientôt. Pour l’instant, vue Kanban.
              </p>
            </div>
            <Sheet open={createOpen} onOpenChange={setCreateOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Plus data-icon="inline-start" />
                  Nouvel événement
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
                <SheetHeader className="pb-2 shrink-0">
                  <SheetTitle>Nouvel événement</SheetTitle>
                  <SheetDescription>
                    Créez un nouvel événement et partagez-le avec vos collaborateurs.
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleCreateEvent} className="flex flex-col flex-1 min-h-0 gap-4">
                  <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
                    <div className="space-y-4 pb-2">
                      <div className="space-y-2">
                        <Input
                          id="title"
                          placeholder="Nom de l'événement"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="h-12 px-0 text-lg font-semibold border-0 bg-transparent focus-visible:ring-0"
                        />
                        <Textarea
                          id="description"
                          className="min-h-[96px] px-0 border-0 bg-transparent focus-visible:ring-0 resize-none"
                          placeholder="Ajouter une description…"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                        />
                      </div>

                      <div className="rounded-xl border bg-background divide-y">
                        <NotionPropertyRow label="Date" icon={<Calendar className="h-4 w-4" />}>
                          <div className="flex items-center gap-2">
                            <Input
                              id="date"
                              type="date"
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                            />
                            <Input
                              id="time"
                              type="time"
                              value={newTime}
                              onChange={(e) => setNewTime(e.target.value)}
                              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                            />
                          </div>
                        </NotionPropertyRow>

                        <NotionPropertyRow label="Type" icon={<FileText className="h-4 w-4" />}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-sm hover:bg-accent/40"
                              >
                                <span>{newType}</span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-52">
                              <DropdownMenuRadioGroup
                                value={newType}
                                onValueChange={(v) => setNewType(v as Event["type"])}
                              >
                                <DropdownMenuRadioItem value="Réunion">Réunion</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Appel">Appel</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Deadline">Deadline</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Autre">Autre</DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </NotionPropertyRow>

                        <NotionPropertyRow label="Statut" icon={<Badge variant="outline">S</Badge>}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-sm hover:bg-accent/40"
                              >
                                <span>{newStatus}</span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-52">
                              <DropdownMenuRadioGroup
                                value={newStatus}
                                onValueChange={(v) => setNewStatus(v as Event["status"])}
                              >
                                <DropdownMenuRadioItem value="Planifié">Planifié</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Confirmé">Confirmé</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Terminé">Terminé</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Annulé">Annulé</DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </NotionPropertyRow>

                        <NotionPropertyRow label="Projet" icon={<Briefcase className="h-4 w-4" />}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-sm hover:bg-accent/40"
                              >
                                <span className="truncate">{newProjectType}</span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuRadioGroup
                                value={newProjectType}
                                onValueChange={(v) => setNewProjectType(v)}
                              >
                                {projectTypes.map((t) => (
                                  <DropdownMenuRadioItem key={t} value={t}>
                                    {t}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </NotionPropertyRow>

                        <NotionPropertyRow label="Collaborateurs" icon={<Plus className="h-4 w-4" />}>
                          <div className="flex flex-wrap items-center gap-2">
                            {selectedCollaborators.length === 0 ? (
                              <span className="text-sm text-muted-foreground">Aucun</span>
                            ) : (
                              <AvatarStack collaborators={selectedCollaborators} />
                            )}

                            <DropdownMenu
                              open={collaboratorsMenuOpen}
                              onOpenChange={(open) => {
                                setCollaboratorsMenuOpen(open);
                                if (!open) setCollaboratorSearch("");
                              }}
                            >
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="h-8 w-8 rounded-full border bg-background flex items-center justify-center hover:bg-accent/30"
                                  aria-label="Ajouter des collaborateurs"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                collisionPadding={12}
                                className="w-[calc(100vw-2rem)] sm:w-80 p-0"
                                onCloseAutoFocus={(e) => e.preventDefault()}
                              >
                                <div className="p-2 border-b" onKeyDown={(e) => e.stopPropagation()}>
                                  <Input
                                    id="collaborators-search"
                                    value={collaboratorSearch}
                                    onChange={(e) => setCollaboratorSearch(e.target.value)}
                                    placeholder="Rechercher un collaborateur..."
                                    autoFocus
                                  />
                                </div>

                                <div className="max-h-64 overflow-y-auto p-1">
                                  {filteredCollaborators.length === 0 ? (
                                    <p className="px-2 py-6 text-sm text-muted-foreground text-center">
                                      Aucun résultat.
                                    </p>
                                  ) : (
                                    filteredCollaborators.map((c) => {
                                      const checked = newCollaboratorIds.includes(c.id);
                                      return (
                                        <DropdownMenuCheckboxItem
                                          key={c.id}
                                          checked={checked}
                                          onCheckedChange={(v) => {
                                            const next = v === true;
                                            setNewCollaboratorIds((prev) =>
                                              next
                                                ? Array.from(new Set([...prev, c.id]))
                                                : prev.filter((id) => id !== c.id)
                                            );
                                          }}
                                          onSelect={(e) => e.preventDefault()}
                                          className="gap-2"
                                        >
                                          <Avatar className="h-6 w-6">
                                            {c.avatarUrl ? (
                                              <AvatarImage src={c.avatarUrl} alt={c.name} />
                                            ) : null}
                                            <AvatarFallback className="text-[10px]">
                                              {getInitials(c.name)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="truncate">{c.name}</span>
                                        </DropdownMenuCheckboxItem>
                                      );
                                    })
                                  )}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </NotionPropertyRow>

                        <NotionPropertyRow label="Pièces jointes" icon={<FileText className="h-4 w-4" />}>
                          <div className="space-y-2">
                            <Input
                              id="files"
                              type="file"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setNewAttachments(files.map((f) => ({ name: f.name, size: f.size, type: f.type })));
                              }}
                              className="h-8"
                            />
                            {newAttachments.length > 0 ? (
                              <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">
                                  {newAttachments.length} fichier(s) sélectionné(s)
                                </p>
                                <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-1">
                                  {newAttachments.map((f) => (
                                    <div key={f.name} className="flex items-center justify-between text-sm">
                                      <span className="truncate">{f.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {Math.round(f.size / 1024)} Ko
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </NotionPropertyRow>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t bg-white shrink-0">
                    <SheetFooter className="mt-0">
                      <Button type="submit">Créer l’événement</Button>
                    </SheetFooter>
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            <Dialog
              open={deleteConfirmOpen}
              onOpenChange={(open) => {
                setDeleteConfirmOpen(open);
                if (!open) setDeleteTargetId(null);
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Supprimer cet événement ?</DialogTitle>
                  <DialogDescription>
                    Cette action est définitive. L’événement sera supprimé de votre planning.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteConfirmOpen(false);
                      setDeleteTargetId(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!deleteTargetId) return;
                      await handleDeleteEvent(deleteTargetId);
                      setDeleteConfirmOpen(false);
                      setDeleteTargetId(null);
                    }}
                  >
                    Supprimer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {planningBoard.columns.map((col) => (
              <div key={col.key} className="min-w-0">
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-medium">{col.title}</p>
                  <span className="text-xs text-muted-foreground">{planningBoard.byStatus[col.key].length}</span>
                </div>
                <div className="mt-2 rounded-xl border bg-card p-2 space-y-2">
                  {planningBoard.byStatus[col.key].length === 0 ? (
                    <div className="rounded-lg border border-dashed p-3">
                      <p className="text-xs text-muted-foreground">Aucun élément</p>
                    </div>
                  ) : (
                    planningBoard.byStatus[col.key].map((event) => (
                      <div
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/dashboard/planning/${event.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            router.push(`/dashboard/planning/${event.id}`);
                          }
                        }}
                        className="w-full text-left rounded-xl border bg-background p-3 shadow-sm hover:bg-accent/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {event.collaborators && event.collaborators.length > 0 ? (
                              <div className="mb-2">
                                <AvatarStack collaborators={event.collaborators} />
                              </div>
                            ) : null}
                            <p className="font-medium text-sm leading-snug truncate">{event.title}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleRequestDeleteEvent(event.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{event.type}</Badge>
                          {event.projectType ? <Badge variant="secondary">{event.projectType}</Badge> : null}
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatEventDate(event.date)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="time-tracker" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Suivi du temps
              </CardTitle>
              <CardDescription>Chronomètre simple pour mesurer le temps de production</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="text-sm text-muted-foreground">Temps en cours</p>
                  <p className="text-3xl font-semibold tracking-tight">{formatDuration(seconds)}</p>
                </div>
                <div className="flex gap-2">
                  {!isRunning ? (
                    <Button onClick={handleStartTimer}>
                      <Play className="mr-2 h-4 w-4" />
                      Démarrer
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={handleStopTimer}>
                      <Square className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={handleResetTimer}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Temps facturable</CardDescription>
                    <CardTitle className="text-2xl">12h 40m</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Temps non facturable</CardDescription>
                    <CardTitle className="text-2xl">3h 10m</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Taux horaire moyen</CardDescription>
                    <CardTitle className="text-2xl">12 000 FCFA</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
                <CardDescription>Briefs, CDC, livrables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.type} • {d.updatedAt}
                      </p>
                    </div>
                    <Badge variant="outline">{d.type}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Astuce
                </CardTitle>
                <CardDescription>Organisation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <p className="text-sm">Centralise tes docs par mission / client.</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm">Ajoute une date de mise à jour et un statut.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
