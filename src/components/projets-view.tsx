"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Mission = {
  id: string;
  clientId?: string;
  title: string;
  client: string;
  status: "To-do" | "En cours" | "Terminé";
  priority?: "Basse" | "Moyenne" | "Haute";
  dueDate?: string;
  description?: string;
  budget?: number;
  timeSpent?: number;
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

function generateChecklistFromText(raw: string): Array<{ text: string; done: boolean }> {
  const normalized = String(raw ?? "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const candidates = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const cleaned = line
        .replace(/^[-*•]\s+/, "")
        .replace(/^\d+[.)]\s+/, "")
        .trim();

      if (!cleaned) return [];
      if (cleaned.includes(";") && cleaned.length < 160) {
        return cleaned
          .split(";")
          .map((p) => p.trim())
          .filter(Boolean);
      }

      return [cleaned];
    });

  const seen = new Set<string>();
  const items: Array<{ text: string; done: boolean }> = [];
  for (const c of candidates) {
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ text: c, done: false });
    if (items.length >= 12) break;
  }

  return items;
}

export function ProjetsView({ activeTab }: { activeTab: ProjetsTab }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [missionClientOptions, setMissionClientOptions] = useState<
    Array<{ id: string; name: string; company?: string }>
  >([]);
  const [missionClientsLoading, setMissionClientsLoading] = useState(false);

  const [missionCreateOpen, setMissionCreateOpen] = useState(false);
  const [creatingMission, setCreatingMission] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState("");
  const [newMissionClientId, setNewMissionClientId] = useState("");
  const [newMissionClientName, setNewMissionClientName] = useState("");
  const [newMissionDescription, setNewMissionDescription] = useState("");
  const [newMissionPriority, setNewMissionPriority] = useState<"Basse" | "Moyenne" | "Haute">(
    "Moyenne"
  );
  const [newMissionDueDate, setNewMissionDueDate] = useState("");
  const [newMissionBudget, setNewMissionBudget] = useState("");
  const [newMissionEvidenceUrls, setNewMissionEvidenceUrls] = useState<string[]>([]);
  const [newMissionNewEvidenceUrl, setNewMissionNewEvidenceUrl] = useState("");
  const [newMissionChecklist, setNewMissionChecklist] = useState<Array<{ text: string; done: boolean }>>([]);
  const [newMissionNewChecklistText, setNewMissionNewChecklistText] = useState("");

  const [missionDetailsOpen, setMissionDetailsOpen] = useState(false);
  const [missionDetailsTarget, setMissionDetailsTarget] = useState<Mission | null>(null);

  const [missionDetailsLoading, setMissionDetailsLoading] = useState(false);
  const [missionDetailsHydrated, setMissionDetailsHydrated] = useState(false);
  const [missionDetailsSaveState, setMissionDetailsSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [missionDetailsTitle, setMissionDetailsTitle] = useState("");
  const [missionDetailsDescription, setMissionDetailsDescription] = useState("");
  const [missionDetailsClientId, setMissionDetailsClientId] = useState("");
  const [missionDetailsClientName, setMissionDetailsClientName] = useState("");
  const [missionDetailsPriority, setMissionDetailsPriority] = useState<"Basse" | "Moyenne" | "Haute">(
    "Moyenne"
  );
  const [missionDetailsDueDate, setMissionDetailsDueDate] = useState("");
  const [missionDetailsBudget, setMissionDetailsBudget] = useState("");
  const [missionDetailsStatus, setMissionDetailsStatus] = useState<Mission["status"]>("To-do");

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

  useEffect(() => {
    void fetchAll();
  }, []);

  useEffect(() => {
    const handler = () => {
      void fetchAll();
    };

    window.addEventListener("missions:refresh", handler as EventListener);
    return () => {
      window.removeEventListener("missions:refresh", handler as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchMissionClients = async () => {
      if (!missionCreateOpen && !missionDetailsOpen) return;
      if (missionClientsLoading) return;

      setMissionClientsLoading(true);
      try {
        const res = await fetch("/api/dashboard/clients", { credentials: "include" });
        const data = await res.json().catch(() => null);
        const clients: unknown[] = Array.isArray(data?.clients) ? (data.clients as unknown[]) : [];

        setMissionClientOptions(
          clients
            .map((c: unknown): { id: string; name: string; company?: string } => {
              const record = (typeof c === "object" && c !== null ? (c as Record<string, unknown>) : {}) as Record<
                string,
                unknown
              >;

              const idRaw = record.id;
              const nameRaw = record.name;
              const companyRaw = record.company;

              return {
                id: typeof idRaw === "string" ? idRaw : String(idRaw ?? ""),
                name: typeof nameRaw === "string" ? nameRaw : String(nameRaw ?? ""),
                company:
                  companyRaw === undefined || companyRaw === null
                    ? undefined
                    : typeof companyRaw === "string"
                      ? companyRaw
                      : String(companyRaw),
              };
            })
            .filter((c: { id: string; name: string }) => c.id && c.name)
        );
      } catch (error) {
        console.error("Erreur chargement clients (missions):", error);
      } finally {
        setMissionClientsLoading(false);
      }
    };

    fetchMissionClients();
  }, [missionCreateOpen, missionDetailsOpen, missionClientsLoading]);

  const loadMissionDetails = async (id: string) => {
    if (!id) return;
    setMissionDetailsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/missions?id=${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erreur lors du chargement");
        return;
      }

      const m = data?.mission as Mission | undefined;
      if (!m?.id) return;

      setMissionDetailsTarget(m);
      setMissionDetailsHydrated(true);
      setMissionDetailsTitle(m.title || "");
      setMissionDetailsDescription(m.description || "");
      setMissionDetailsClientId(m.clientId || "");
      setMissionDetailsClientName(m.client || "");
      setMissionDetailsPriority((m.priority as "Basse" | "Moyenne" | "Haute") || "Moyenne");
      setMissionDetailsDueDate(m.dueDate || "");
      setMissionDetailsBudget(typeof m.budget === "number" ? String(m.budget) : "");
      setMissionDetailsStatus(m.status || "To-do");
      setMissionDetailsEvidenceUrls(Array.isArray(m.evidenceUrls) ? m.evidenceUrls : []);
      setMissionDetailsChecklist(Array.isArray(m.checklist) ? m.checklist : []);
      setMissionDetailsNewEvidenceUrl("");
      setMissionDetailsNewChecklistText("");
      setMissionDetailsSaveState("idle");
    } catch (error) {
      console.error("Erreur chargement mission:", error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setMissionDetailsLoading(false);
    }
  };

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
    if (!newMissionClientId || !newMissionClientName) {
      toast.error("Sélectionne un client.");
      return;
    }

    setCreatingMission(true);

    try {
      const res = await fetch("/api/dashboard/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newMissionTitle.trim(),
          clientId: newMissionClientId,
          clientName: newMissionClientName,
          description: newMissionDescription.trim() || undefined,
          priority: newMissionPriority,
          dueDate: newMissionDueDate || undefined,
          budget: newMissionBudget === "" ? undefined : Number(newMissionBudget),
          evidenceUrls: newMissionEvidenceUrls,
          checklist: newMissionChecklist,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error || "Erreur lors de la création");
        return;
      }

      const created = data?.mission as
        | {
            id: string;
            title: string;
            clientId?: string;
            client?: string;
            status?: Mission["status"];
            priority?: Mission["priority"];
            dueDate?: string;
            description?: string;
            budget?: number;
            evidenceUrls?: string[];
            checklist?: Array<{ text: string; done: boolean }>;
          }
        | undefined;

      if (created?.id) {
        setMissions((prev) => [
          {
            id: created.id,
            title: created.title,
            clientId: created.clientId || newMissionClientId,
            client: created.client || newMissionClientName,
            status: (created.status as Mission["status"]) || "To-do",
            priority: created.priority || newMissionPriority,
            dueDate: created.dueDate,
            description: created.description || newMissionDescription,
            budget: typeof created.budget === "number" ? created.budget : undefined,
            evidenceUrls: created.evidenceUrls || newMissionEvidenceUrls,
            checklist: created.checklist || newMissionChecklist,
          },
          ...prev,
        ]);
      }

      toast.success("Mission créée.");

      setMissionCreateOpen(false);
      setNewMissionTitle("");
      setNewMissionClientId("");
      setNewMissionClientName("");
      setNewMissionDescription("");
      setNewMissionPriority("Moyenne");
      setNewMissionDueDate("");
      setNewMissionBudget("");
      setNewMissionEvidenceUrls([]);
      setNewMissionNewEvidenceUrl("");
      setNewMissionChecklist([]);
      setNewMissionNewChecklistText("");
    } catch (error) {
      console.error("Erreur création mission:", error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setCreatingMission(false);
    }
  };

  const openMissionDetails = (mission: Mission) => {
    setMissionDetailsLoading(true);
    setMissionDetailsHydrated(false);
    setMissionDetailsTarget(mission);
    setMissionDetailsTitle(mission.title || "");
    setMissionDetailsDescription(mission.description || "");
    setMissionDetailsClientId(mission.clientId || "");
    setMissionDetailsClientName(mission.client || "");
    setMissionDetailsPriority((mission.priority as "Basse" | "Moyenne" | "Haute") || "Moyenne");
    setMissionDetailsDueDate(mission.dueDate || "");
    setMissionDetailsBudget(typeof mission.budget === "number" ? String(mission.budget) : "");
    setMissionDetailsStatus(mission.status || "To-do");
    setMissionDetailsEvidenceUrls(Array.isArray(mission.evidenceUrls) ? mission.evidenceUrls : []);
    setMissionDetailsChecklist(Array.isArray(mission.checklist) ? mission.checklist : []);
    setMissionDetailsNewEvidenceUrl("");
    setMissionDetailsNewChecklistText("");
    setMissionDetailsSaveState("idle");
    setMissionDetailsOpen(true);
    void loadMissionDetails(mission.id);
  };

  const saveMissionDetails = async ({ closeAfter }: { closeAfter: boolean }) => {
    if (!missionDetailsTarget) return;
    if (updatingMission) return;
    if (missionDetailsTitle.trim().length === 0) {
      toast.error("Le titre est requis");
      return;
    }

    setUpdatingMission(true);
    setMissionDetailsSaveState("saving");

    try {
      const res = await fetch("/api/dashboard/missions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: missionDetailsTarget.id,
          title: missionDetailsTitle.trim(),
          description: missionDetailsDescription,
          clientId: missionDetailsClientId || undefined,
          clientName: missionDetailsClientName,
          priority: missionDetailsPriority,
          dueDate: missionDetailsDueDate,
          budget: missionDetailsBudget === "" ? undefined : Number(missionDetailsBudget),
          status: missionDetailsStatus,
          evidenceUrls: missionDetailsEvidenceUrls,
          checklist: missionDetailsChecklist,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMissionDetailsSaveState("error");
        toast.error(data?.error || "Erreur lors de la mise à jour");
        return;
      }

      const updated = data?.mission as Mission | undefined;
      if (updated?.id) {
        setMissionDetailsTarget(updated);
        setMissions((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
      }

      setMissionDetailsSaveState("saved");
      window.setTimeout(() => setMissionDetailsSaveState("idle"), 1200);

      if (closeAfter) {
        setMissionDetailsOpen(false);
      }
    } catch (error) {
      console.error("Erreur mise à jour mission:", error);
      setMissionDetailsSaveState("error");
      toast.error("Erreur de connexion au serveur");
    } finally {
      setUpdatingMission(false);
    }
  };

  useEffect(() => {
    if (!missionDetailsOpen) return;
    if (!missionDetailsTarget) return;
    if (missionDetailsLoading) return;
    if (!missionDetailsHydrated) return;
    if (missionDetailsTarget.status === "Terminé") return;
    if (updatingMission) return;

    const t = window.setTimeout(() => {
      void saveMissionDetails({ closeAfter: false });
    }, 900);

    return () => {
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    missionDetailsOpen,
    missionDetailsTarget?.id,
    missionDetailsTarget?.status,
    missionDetailsLoading,
    missionDetailsHydrated,
    missionDetailsTitle,
    missionDetailsDescription,
    missionDetailsClientId,
    missionDetailsClientName,
    missionDetailsPriority,
    missionDetailsDueDate,
    missionDetailsBudget,
    missionDetailsStatus,
    missionDetailsEvidenceUrls,
    missionDetailsChecklist,
  ]);

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
    await saveMissionDetails({ closeAfter: true });
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
          <Sheet
            open={missionCreateOpen}
            onOpenChange={(open) => {
              if (creatingMission) return;
              setMissionCreateOpen(open);
            }}
          >
            {missions.length === 0 ? (
              <div className="p-6 sm:p-10">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Missions</h1>
                      <p className="text-muted-foreground">Crée et suis tes tâches de production.</p>
                    </div>

                    <SheetTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus data-icon="inline-start" />
                        Créer une mission
                      </Button>
                    </SheetTrigger>
                  </div>

                  <div className="w-full overflow-hidden rounded-2xl bg-muted/30 p-4 sm:p-6">
                    <Image
                      src="/missions.png"
                      alt="Missions"
                      width={1600}
                      height={1000}
                      className="h-auto w-full max-h-[520px] object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Missions</p>
                    <p className="text-sm text-muted-foreground">Crée et suis tes tâches de production.</p>
                  </div>

                  <SheetTrigger asChild>
                    <Button>
                      <Plus data-icon="inline-start" />
                      Nouvelle mission
                    </Button>
                  </SheetTrigger>
                </div>

                <Dialog
                  open={missionDetailsOpen}
                  onOpenChange={(open) => {
                    if (updatingMission) return;
                    setMissionDetailsOpen(open);
                    if (!open) {
                      setMissionDetailsTarget(null);
                      setMissionDetailsHydrated(false);
                    }
                  }}
                >
                  <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Détails de la mission</DialogTitle>
                      <DialogDescription>
                        {missionDetailsSaveState === "saving"
                          ? "Enregistrement…"
                          : missionDetailsSaveState === "saved"
                            ? "Sauvegardé"
                            : missionDetailsSaveState === "error"
                              ? "Erreur d’enregistrement"
                              : "Édition automatique"}
                      </DialogDescription>
                    </DialogHeader>

                    {missionDetailsTarget ? (
                      <div className="space-y-5">
                        <div className="space-y-3">
                          <Input
                            value={missionDetailsTitle}
                            onChange={(e) => setMissionDetailsTitle(e.target.value)}
                            placeholder="Titre de la mission"
                            disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                            className="h-12 px-0 border-0 bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight focus-visible:ring-0"
                          />

                          <Textarea
                            value={missionDetailsDescription}
                            onChange={(e) => setMissionDetailsDescription(e.target.value)}
                            placeholder="Ajouter une description…"
                            disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                            className="min-h-[96px] px-0 border-0 bg-transparent focus-visible:ring-0 resize-none"
                          />
                        </div>

                        <div className="rounded-xl border bg-background divide-y">
                          <NotionPropertyRow label="Client" icon={<Briefcase className="h-4 w-4" />}>
                            <Select
                              value={missionDetailsClientId}
                              onValueChange={(id) => {
                                setMissionDetailsClientId(id);
                                const selected = missionClientOptions.find((c) => c.id === id);
                                setMissionDetailsClientName(selected?.name || "");
                              }}
                              disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                            >
                              <SelectTrigger className="h-8 border-0 bg-transparent px-2">
                                <SelectValue placeholder={missionClientsLoading ? "Chargement…" : "Choisir un client"} />
                              </SelectTrigger>
                              <SelectContent>
                                {missionClientOptions.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.company ? `${c.name} • ${c.company}` : c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </NotionPropertyRow>

                          <NotionPropertyRow label="Priorité" icon={<Flag className="h-4 w-4" />}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-sm hover:bg-accent/40 disabled:opacity-50"
                                  disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                                >
                                  <span>{missionDetailsPriority}</span>
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-44">
                                <DropdownMenuRadioGroup
                                  value={missionDetailsPriority}
                                  onValueChange={(v) => setMissionDetailsPriority(v as "Basse" | "Moyenne" | "Haute")}
                                >
                                  <DropdownMenuRadioItem value="Basse">Basse</DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="Moyenne">Moyenne</DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="Haute">Haute</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </NotionPropertyRow>

                          <NotionPropertyRow label="Statut" icon={<Badge variant="outline">S</Badge>}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-sm hover:bg-accent/40 disabled:opacity-50"
                                  disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                                >
                                  <span>{missionDetailsStatus}</span>
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-44">
                                <DropdownMenuRadioGroup
                                  value={missionDetailsStatus}
                                  onValueChange={(v) => setMissionDetailsStatus(v as Mission["status"])}
                                >
                                  <DropdownMenuRadioItem value="To-do">To-do</DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="En cours">En cours</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </NotionPropertyRow>

                          <NotionPropertyRow label="Échéance" icon={<Calendar className="h-4 w-4" />}>
                            <Input
                              type="date"
                              value={missionDetailsDueDate}
                              onChange={(e) => setMissionDetailsDueDate(e.target.value)}
                              disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                              className="h-8 w-full border-0 bg-transparent px-2 focus-visible:ring-0"
                            />
                          </NotionPropertyRow>

                          <NotionPropertyRow label="Budget" icon={<Badge variant="outline">FCFA</Badge>}>
                            <Input
                              inputMode="decimal"
                              value={missionDetailsBudget}
                              onChange={(e) => setMissionDetailsBudget(e.target.value)}
                              placeholder="0"
                              disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                              className="h-8 w-full border-0 bg-transparent px-2 focus-visible:ring-0"
                            />
                          </NotionPropertyRow>

                          <NotionPropertyRow label="Vérification" icon={<Badge variant="outline">V</Badge>}>
                            <div className="text-sm text-muted-foreground">
                              {missionDetailsTarget.verificationStatus || "Aucun"}
                              {missionDetailsTarget.verificationMessage ? ` • ${missionDetailsTarget.verificationMessage}` : ""}
                            </div>
                          </NotionPropertyRow>
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
                                  <Input
                                    value={url}
                                    onChange={(e) => {
                                      const next = e.target.value;
                                      setMissionDetailsEvidenceUrls((prev) => prev.map((u, i) => (i === idx ? next : u)));
                                    }}
                                    disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
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
                              disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
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
                                    disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                                  />
                                  <Input
                                    value={item.text}
                                    onChange={(e) => {
                                      const text = e.target.value;
                                      setMissionDetailsChecklist((prev) =>
                                        prev.map((it, i) => (i === idx ? { ...it, text } : it))
                                      );
                                    }}
                                    disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
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
                              disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={missionDetailsTarget.status === "Terminé" || missionDetailsLoading}
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
              </>
            )}

            <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
              <SheetHeader className="pb-2 shrink-0">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard/projets/missions">Projets</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard/projets/missions">Missions</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Nouvelle mission</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <SheetTitle>Nouvelle mission</SheetTitle>
                <SheetDescription>Ajoute une tâche de production à suivre dans ton board.</SheetDescription>
              </SheetHeader>

              <form onSubmit={handleCreateMission} className="flex flex-col flex-1 min-h-0 gap-4">
                <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
                  <div className="space-y-4 pb-2">
                    <div className="px-1">
                      <Input
                        id="mission-title"
                        value={newMissionTitle}
                        onChange={(e) => setNewMissionTitle(e.target.value)}
                        placeholder="Nom de la mission"
                        required
                        className="h-12 px-0 border-0 bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight focus-visible:ring-0"
                      />
                    </div>

                    <div className="px-1">
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
                        <Select
                          value={newMissionClientId}
                          onValueChange={(id) => {
                            setNewMissionClientId(id);
                            const selected = missionClientOptions.find((c) => c.id === id);
                            setNewMissionClientName(selected?.name || "");
                          }}
                        >
                          <SelectTrigger className="h-8 border-0 bg-transparent px-2">
                            <SelectValue
                              placeholder={missionClientsLoading ? "Chargement…" : "Choisir un client"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {missionClientOptions.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.company ? `${c.name} • ${c.company}` : c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                      <NotionPropertyRow label="Budget" icon={<Badge variant="outline">FCFA</Badge>}>
                        <Input
                          id="mission-budget"
                          inputMode="decimal"
                          value={newMissionBudget}
                          onChange={(e) => setNewMissionBudget(e.target.value)}
                          placeholder="0"
                          className="h-8 w-full border-0 bg-transparent px-2 focus-visible:ring-0"
                        />
                      </NotionPropertyRow>
                    </div>

                    <div className="space-y-2 px-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">Checklist</p>
                          <p className="text-sm text-muted-foreground">Découpe la mission en étapes concrètes.</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!newMissionDescription.trim()}
                          onClick={() => {
                            const generated = generateChecklistFromText(newMissionDescription);
                            if (generated.length === 0) return;
                            setNewMissionChecklist(generated);
                          }}
                        >
                          Générer
                        </Button>
                      </div>

                      {newMissionChecklist.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune checklist.</p>
                      ) : (
                        <div className="space-y-2">
                          {newMissionChecklist.map((item, idx) => (
                            <div key={`${item.text}-${idx}`} className="flex items-center gap-2">
                              <Checkbox
                                checked={item.done}
                                onCheckedChange={(checked) => {
                                  const done = checked === true;
                                  setNewMissionChecklist((prev) =>
                                    prev.map((it, i) => (i === idx ? { ...it, done } : it))
                                  );
                                }}
                              />
                              <Input
                                value={item.text}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setNewMissionChecklist((prev) =>
                                    prev.map((it, i) => (i === idx ? { ...it, text } : it))
                                  );
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setNewMissionChecklist((prev) => prev.filter((_, i) => i !== idx))}
                              >
                                Retirer
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Input
                          value={newMissionNewChecklistText}
                          onChange={(e) => setNewMissionNewChecklistText(e.target.value)}
                          placeholder="Ex: Brouillon, Relecture, Livraison..."
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const text = newMissionNewChecklistText.trim();
                            if (!text) return;
                            setNewMissionChecklist((prev) => [...prev, { text, done: false }]);
                            setNewMissionNewChecklistText("");
                          }}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 px-1">
                      <div>
                        <p className="text-sm font-medium">Preuves</p>
                        <p className="text-sm text-muted-foreground">Ajoute des liens (Drive, Figma, Notion…).</p>
                      </div>

                      {newMissionEvidenceUrls.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune preuve.</p>
                      ) : (
                        <div className="space-y-2">
                          {newMissionEvidenceUrls.map((url, idx) => (
                            <div key={`${url}-${idx}`} className="flex items-center gap-2">
                              <Input
                                value={url}
                                onChange={(e) => {
                                  const next = e.target.value;
                                  setNewMissionEvidenceUrls((prev) =>
                                    prev.map((u, i) => (i === idx ? next : u))
                                  );
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setNewMissionEvidenceUrls((prev) => prev.filter((_, i) => i !== idx))}
                              >
                                Retirer
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Input
                          value={newMissionNewEvidenceUrl}
                          onChange={(e) => setNewMissionNewEvidenceUrl(e.target.value)}
                          placeholder="Colle un lien (https://...)"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const next = newMissionNewEvidenceUrl.trim();
                            if (!next) return;
                            setNewMissionEvidenceUrls((prev) => [...prev, next]);
                            setNewMissionNewEvidenceUrl("");
                          }}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t bg-background shrink-0">
                  <SheetFooter className="mt-0">
                    <Button type="submit" disabled={creatingMission}>
                      {creatingMission ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Créer la mission
                    </Button>
                  </SheetFooter>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </TabsContent>

        <TabsContent value="planning" className="mt-6">
          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            {events.length === 0 ? (
              <div className="p-6 sm:p-10">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Agenda</h1>
                      <p className="text-muted-foreground">
                        Planifie tes événements et retrouve-les ensuite sur ton board.
                      </p>
                    </div>

                    <SheetTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus data-icon="inline-start" />
                        Créer un événement
                      </Button>
                    </SheetTrigger>
                  </div>

                  <div className="w-full overflow-hidden rounded-2xl bg-muted/30 p-4 sm:p-6">
                    <Image
                      src="/agenda.jpg"
                      alt="Agenda"
                      width={1600}
                      height={1000}
                      className="h-auto w-full max-h-[520px] object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Board agenda</p>
                    <p className="text-sm text-muted-foreground">
                      Glissez-déposez bientôt. Pour l’instant, vue Kanban.
                    </p>
                  </div>

                  <SheetTrigger asChild>
                    <Button>
                      <Plus data-icon="inline-start" />
                      Nouvel événement
                    </Button>
                  </SheetTrigger>
                </div>

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

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {planningBoard.columns.map((col) => (
                    <div key={col.key} className="min-w-0">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-sm font-medium">{col.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {planningBoard.byStatus[col.key].length}
                        </span>
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
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleRequestDeleteEvent(event.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge variant="outline">{event.type}</Badge>
                                {event.projectType ? (
                                  <Badge variant="secondary">{event.projectType}</Badge>
                                ) : null}
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
              </>
            )}

            <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
              <SheetHeader className="pb-2 shrink-0">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard/projets/planning">Projets</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard/projets/planning">Planning</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Nouvel événement</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
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
                            <DropdownMenuRadioGroup value={newProjectType} onValueChange={(v) => setNewProjectType(v)}>
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
                                  <p className="px-2 py-6 text-sm text-muted-foreground text-center">Aucun résultat.</p>
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
                                          {c.avatarUrl ? <AvatarImage src={c.avatarUrl} alt={c.name} /> : null}
                                          <AvatarFallback className="text-[10px]">{getInitials(c.name)}</AvatarFallback>
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
                              <p className="text-xs text-muted-foreground">{newAttachments.length} fichier(s) sélectionné(s)</p>
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
