"use client";
import { useMemo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NotionPropertyRow } from "@/components/ui/notion-property-row";
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
import { Calendar, Clock, Plus, MoreHorizontal, Pencil, Tag, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          <Sheet open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus data-icon="inline-start" />
                Nouvel événement
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Nouvel événement</SheetTitle>
                <SheetDescription>
                  Créez un nouvel événement dans votre planning.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleCreateEvent}>
                <div className="py-4">
                  <div className="space-y-4">
                    <div className="px-1">
                      <Input
                        id="title"
                        placeholder="Nom de l'événement"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        className="h-12 px-0 border-0 bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight focus-visible:ring-0"
                      />
                    </div>

                    <div className="rounded-xl border bg-background divide-y">
                      <NotionPropertyRow label="Date" icon={<Calendar className="h-4 w-4" />}>
                        <Input
                          id="date"
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                        />
                      </NotionPropertyRow>

                      <NotionPropertyRow label="Heure" icon={<Clock className="h-4 w-4" />}>
                        <Input
                          id="time"
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                        />
                      </NotionPropertyRow>

                      <NotionPropertyRow label="Type" icon={<Tag className="h-4 w-4" />}>
                        <Select value={newType} onValueChange={(v) => setNewType(v as Event["type"])}>
                          <SelectTrigger className="h-8 border-0 bg-transparent px-2">
                            <SelectValue placeholder="Choisir" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Réunion">Réunion</SelectItem>
                            <SelectItem value="Appel">Appel</SelectItem>
                            <SelectItem value="Deadline">Deadline</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </NotionPropertyRow>
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <Button type="submit" disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Créer l'événement
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        }
      />
    </>
  );
}
