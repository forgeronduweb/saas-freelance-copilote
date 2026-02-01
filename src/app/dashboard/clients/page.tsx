"use client";
import { useMemo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, MoreHorizontal, Mail, Phone, Pencil, Trash2, Loader2 } from "lucide-react";
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

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "Actif" | "Inactif" | "Prospect" | "Perdu";
  projects: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientStatus, setNewClientStatus] = useState<"Prospect" | "Actif">("Prospect");
  const [creating, setCreating] = useState(false);

  const columns = useMemo<ColumnDef<Client>[]>(() => {
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
        accessorKey: "name",
        header: "Client",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {row.original.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{row.getValue("name")}</p>
              <p className="text-xs text-muted-foreground">{row.original.company}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Contact",
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" /> {row.getValue("email")}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" /> {row.original.phone}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const colors: Record<string, string> = {
            "Actif": "bg-emerald-50 text-emerald-700 border-emerald-200",
            "Inactif": "bg-gray-50 text-gray-700 border-gray-200",
            "Prospect": "bg-blue-50 text-blue-700 border-blue-200",
            "Perdu": "bg-red-50 text-red-700 border-red-200",
          };
          return <Badge variant="secondary" className={colors[status]}>{status}</Badge>;
        },
      },
      {
        accessorKey: "projects",
        header: "Projets",
        cell: ({ row }) => <span>{row.getValue("projects")} projet(s)</span>,
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
      const res = await fetch(`/api/dashboard/clients?id=${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      }
    } catch (error) {
      console.error('Erreur suppression client:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/dashboard/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/dashboard/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newClientName,
          email: newClientEmail,
          phone: newClientPhone,
          company: newClientCompany,
          status: newClientStatus,
        }),
      });

      if (res.ok) {
        setCreateDialogOpen(false);
        setNewClientName("");
        setNewClientEmail("");
        setNewClientPhone("");
        setNewClientCompany("");
        setNewClientStatus("Prospect");
        fetchClients();
      }
    } catch (error) {
      console.error('Erreur création client:', error);
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
            <DialogTitle>Supprimer ce client ?</DialogTitle>
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
        data={clients} 
        searchKey="name" 
        searchPlaceholder="Rechercher un client..."
        onRowClick={(client) => router.push(`/dashboard/clients/${client.id}`)}
        actionButton={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus data-icon="inline-start" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau client à votre base.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClient}>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm">Nom *</label>
                    <Input
                      id="name"
                      placeholder="Nom du client"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemple.com"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="phone" className="text-sm">Téléphone</label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+225 XX XX XX XX"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="company" className="text-sm">Entreprise</label>
                    <Input
                      id="company"
                      placeholder="Nom de l'entreprise"
                      value={newClientCompany}
                      onChange={(e) => setNewClientCompany(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="status" className="text-sm">Type de contact</label>
                    <Select value={newClientStatus} onValueChange={(v) => setNewClientStatus(v as "Prospect" | "Actif")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Prospect">Prospect</SelectItem>
                        <SelectItem value="Actif">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Ajouter le client
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
