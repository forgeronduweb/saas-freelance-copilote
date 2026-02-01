"use client";
import { useMemo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "Réunion" | "Appel" | "Deadline" | "Autre";
  status: "Planifié" | "Confirmé" | "Terminé" | "Annulé";
}

export default function PlanningPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState<Event["type"]>("Réunion");
  const [creating, setCreating] = useState(false);

  const columns = useMemo<ColumnDef<Event>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
      },
      {
        accessorKey: "title",
        header: "Événement",
        cell: ({ row }) => <span>{row.getValue("title")}</span>,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(row.getValue("date")).toLocaleDateString("fr-FR")}
          </span>
        ),
      },
      {
        accessorKey: "time",
        header: "Heure",
        cell: ({ row }) => (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {row.getValue("time")}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          const colors: Record<string, string> = {
            "Réunion": "bg-blue-50 text-blue-700 border-blue-200",
            "Appel": "bg-green-50 text-green-700 border-green-200",
            "Deadline": "bg-red-50 text-red-700 border-red-200",
            "Autre": "bg-gray-50 text-gray-700 border-gray-200",
          };
          return <Badge variant="secondary" className={colors[type]}>{type}</Badge>;
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const colors: Record<string, string> = {
            "Planifié": "text-orange-600",
            "Confirmé": "text-emerald-600",
            "Terminé": "text-muted-foreground",
            "Annulé": "text-red-500",
          };
          return <span className={colors[status]}>{status}</span>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
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
                onClick={() => {
                  setDeleteTarget(row.original);
                  setDeleteConfirmOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/dashboard/planning?id=${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        toast.success("Événement supprimé");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error('Erreur suppression événement:', error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/dashboard/planning');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Erreur chargement planning:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/dashboard/planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newTitle,
          date: newDate || new Date().toISOString().split('T')[0],
          time: newTime || '09:00',
          type: newType,
          status: 'Planifié',
        }),
      });

      if (res.ok) {
        setCreateDialogOpen(false);
        setNewTitle("");
        setNewDate("");
        setNewTime("");
        setNewType("Réunion");
        toast.success("Événement créé");
        fetchEvents();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error('Erreur création événement:', error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }
  
  return (
    <>
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet événement ?</DialogTitle>
            <DialogDescription>
              Cette action est définitive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteTarget(null);
              }}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTable 
        columns={columns} 
        data={events} 
        searchKey="title" 
        searchPlaceholder="Rechercher un événement..."
        onRowClick={(event) => router.push(`/dashboard/planning/${event.id}`)}
        actionButton={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus data-icon="inline-start" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvel événement</DialogTitle>
                <DialogDescription>
                  Créez un nouvel événement dans votre planning.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEvent}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title" className="text-sm">Titre *</label>
                    <Input
                      id="title"
                      placeholder="Nom de l'événement"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="date" className="text-sm">Date</label>
                      <Input
                        id="date"
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="time" className="text-sm">Heure</label>
                      <Input
                        id="time"
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="type" className="text-sm">Type</label>
                    <select
                      id="type"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as Event["type"])}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Réunion">Réunion</option>
                      <option value="Appel">Appel</option>
                      <option value="Deadline">Deadline</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Créer l'événement
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
    </>
  );
}
