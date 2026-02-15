"use client";
import { useMemo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
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
import { Plus, MoreHorizontal, Mail, Phone, Pencil, Trash2, Loader2, Building2, Tag } from "lucide-react";
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
import { NotionPropertyRow } from "@/components/ui/notion-property-row";
import Image from "next/image";

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
            "Actif": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800",
            "Inactif": "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-700",
            "Prospect": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800",
            "Perdu": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800",
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

      {clients.length === 0 ? (
        <div className="p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Clients</h1>
                <p className="text-muted-foreground">
                  Centralisez vos prospects et clients, suivez l’historique des échanges et gérez les actions commerciales.
                </p>
              </div>

              <Sheet open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <SheetTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus data-icon="inline-start" />
                    Créer un client
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col">
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
                            <Link href="/dashboard/clients">Clients</Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>Nouveau client</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                    <SheetTitle>Nouveau client</SheetTitle>
                    <SheetDescription>
                      Ajoutez un nouveau client à votre base.
                    </SheetDescription>
                  </SheetHeader>
                  <form onSubmit={handleCreateClient} className="flex flex-col flex-1 min-h-0 gap-4">
                    <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
                      <div className="space-y-4 pb-2">
                        <div className="px-1">
                          <Input
                            id="name"
                            placeholder="Nom du client"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            required
                            className="h-12 px-0 border-0 bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight focus-visible:ring-0"
                          />
                        </div>

                        <div className="rounded-xl border bg-background divide-y">
                          <NotionPropertyRow label="Email" icon={<Mail className="h-4 w-4" />}>
                            <Input
                              id="email"
                              type="email"
                              placeholder="email@exemple.com"
                              value={newClientEmail}
                              onChange={(e) => setNewClientEmail(e.target.value)}
                              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                            />
                          </NotionPropertyRow>
                          <NotionPropertyRow label="Téléphone" icon={<Phone className="h-4 w-4" />}>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+225 XX XX XX XX"
                              value={newClientPhone}
                              onChange={(e) => setNewClientPhone(e.target.value)}
                              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                            />
                          </NotionPropertyRow>
                          <NotionPropertyRow label="Entreprise" icon={<Building2 className="h-4 w-4" />}>
                            <Input
                              id="company"
                              placeholder="Nom de l'entreprise"
                              value={newClientCompany}
                              onChange={(e) => setNewClientCompany(e.target.value)}
                              className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                            />
                          </NotionPropertyRow>
                          <NotionPropertyRow label="Type" icon={<Tag className="h-4 w-4" />}>
                            <Select
                              value={newClientStatus}
                              onValueChange={(v) => setNewClientStatus(v as "Prospect" | "Actif")}
                            >
                              <SelectTrigger className="h-8 border-0 bg-transparent px-2">
                                <SelectValue placeholder="Choisir le type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Prospect">Prospect</SelectItem>
                                <SelectItem value="Actif">Client</SelectItem>
                              </SelectContent>
                            </Select>
                          </NotionPropertyRow>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t bg-background shrink-0">
                      <SheetFooter className="mt-0">
                        <Button type="submit" disabled={creating}>
                          {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Ajouter le client
                        </Button>
                      </SheetFooter>
                    </div>
                  </form>
                </SheetContent>
              </Sheet>
            </div>

            <div className="w-full overflow-hidden rounded-2xl bg-muted/30 p-4 sm:p-6">
              <Image
                src="/clients.jpg"
                alt="Clients"
                width={1600}
                height={1000}
                className="h-auto w-full max-h-[520px] object-contain"
                priority
              />
            </div>
          </div>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={clients} 
          searchKey="name" 
          searchPlaceholder="Rechercher un client..."
          onRowClick={(client) => router.push(`/dashboard/clients/${client.id}`)}
          actionButton={
            <Sheet open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Plus data-icon="inline-start" />
                  Nouveau client
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col">
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
                          <Link href="/dashboard/clients">Clients</Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Nouveau client</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  <SheetTitle>Nouveau client</SheetTitle>
                  <SheetDescription>
                    Ajoutez un nouveau client à votre base.
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleCreateClient} className="flex flex-col flex-1 min-h-0 gap-4">
                  <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
                    <div className="space-y-4 pb-2">
                      <div className="px-1">
                        <Input
                          id="name"
                          placeholder="Nom du client"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                          required
                          className="h-12 px-0 border-0 bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight focus-visible:ring-0"
                        />
                      </div>

                      <div className="rounded-xl border bg-background divide-y">
                        <NotionPropertyRow label="Email" icon={<Mail className="h-4 w-4" />}>
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@exemple.com"
                            value={newClientEmail}
                            onChange={(e) => setNewClientEmail(e.target.value)}
                            className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                          />
                        </NotionPropertyRow>
                        <NotionPropertyRow label="Téléphone" icon={<Phone className="h-4 w-4" />}>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+225 XX XX XX XX"
                            value={newClientPhone}
                            onChange={(e) => setNewClientPhone(e.target.value)}
                            className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                          />
                        </NotionPropertyRow>
                        <NotionPropertyRow label="Entreprise" icon={<Building2 className="h-4 w-4" />}>
                          <Input
                            id="company"
                            placeholder="Nom de l'entreprise"
                            value={newClientCompany}
                            onChange={(e) => setNewClientCompany(e.target.value)}
                            className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                          />
                        </NotionPropertyRow>
                        <NotionPropertyRow label="Type" icon={<Tag className="h-4 w-4" />}>
                          <Select
                            value={newClientStatus}
                            onValueChange={(v) => setNewClientStatus(v as "Prospect" | "Actif")}
                          >
                            <SelectTrigger className="h-8 border-0 bg-transparent px-2">
                              <SelectValue placeholder="Choisir le type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Prospect">Prospect</SelectItem>
                              <SelectItem value="Actif">Client</SelectItem>
                            </SelectContent>
                          </Select>
                        </NotionPropertyRow>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t bg-background shrink-0">
                    <SheetFooter className="mt-0">
                      <Button type="submit" disabled={creating}>
                        {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Ajouter le client
                      </Button>
                    </SheetFooter>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
          }
        />
      )}
    </>
  );
}
