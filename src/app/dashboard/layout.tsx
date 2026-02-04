"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HelpCircle, LogOut, Search, Settings, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, menuSections } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Kbd } from "@/components/ui/kbd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/hooks/useAuth";

const pageTitles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/dashboard/planning": "Agenda",
  "/dashboard/clients": "CRM",
  "/dashboard/marketing": "Prospection",
  "/dashboard/prospection": "Prospection & CRM",
  "/dashboard/prospection/pipeline": "Pipeline",
  "/dashboard/prospection/contacts": "Contacts",
  "/dashboard/prospection/opportunites": "Opportunités",
  "/dashboard/prospection/scripts": "Scripts",
  "/dashboard/projets": "Projets & Production",
  "/dashboard/projets/missions": "Missions",
  "/dashboard/projets/time-tracker": "Time tracker",
  "/dashboard/projets/documents": "Documents",
  "/dashboard/projets/planning": "Agenda",
  "/dashboard/finance": "Finance & Admin",
  "/dashboard/finance/factures": "Factures",
  "/dashboard/finance/devis": "Devis",
  "/dashboard/finance/depenses": "Dépenses",
  "/dashboard/finance/charges": "Charges",
  "/dashboard/finance/documents": "Documents",
  "/dashboard/feedback": "Feedback",
  "/dashboard/analyses": "Analyses & Croissance",
  "/dashboard/analyses/rapports": "Rapports",
  "/dashboard/analyses/tjm": "Calculateur TJM",
  "/dashboard/analyses/academy": "Academy",
  "/dashboard/site-web": "Mon site",
  "/dashboard/entreprise": "Entreprise",
  "/dashboard/integrations": "Intégrations",
  "/dashboard/settings": "Paramètres",
};

const timeTrackerLocalStorageKey = "timeTrackerState";
const timeTrackerToastId = "time-tracker-running";

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle =
    pageTitles[pathname] ||
    (pathname.startsWith("/dashboard/clients/") ? "CRM" : "Dashboard");

  const [commandOpen, setCommandOpen] = useState(false);

  const tickerRef = useRef<number | null>(null);

  useEffect(() => {
    const readState = (): null | {
      running?: boolean;
      startedAt?: number | null;
      elapsedSeconds?: number | null;
    } => {
      try {
        const raw = localStorage.getItem(timeTrackerLocalStorageKey);
        if (!raw) return null as null | { running: boolean; startedAt?: number | null; elapsedSeconds?: number };
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };

    const writeState = (next: { running: boolean; startedAt: number | null; elapsedSeconds: number }) => {
      try {
        localStorage.setItem(timeTrackerLocalStorageKey, JSON.stringify(next));
        window.dispatchEvent(new Event("time-tracker:update"));
      } catch {
        // ignore
      }
    };

    const stopTicker = () => {
      if (tickerRef.current) {
        window.clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    };

    const syncToast = () => {
      const state = readState();
      const onTimeTrackerPage = pathname === "/dashboard/projets/time-tracker";

      const running = state?.running === true && typeof state.startedAt === "number";
      const elapsed = running
        ? Math.max(0, Math.floor((Date.now() - (state!.startedAt as number)) / 1000))
        : Math.max(0, Math.floor(Number(state?.elapsedSeconds) || 0));

      if (onTimeTrackerPage || elapsed === 0) {
        stopTicker();
        toast.dismiss(timeTrackerToastId);
        return;
      }

      toast.custom(
        () => (
          <div className="w-[340px] rounded-lg border bg-background p-3 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Suivi du temps</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {running ? "En cours" : "En pause"} • {formatDuration(elapsed)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {running ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="rounded-full"
                    aria-label="Stop"
                    onClick={() => {
                      writeState({ running: false, startedAt: null, elapsedSeconds: elapsed });
                      stopTicker();
                    }}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const startedAt = Date.now() - elapsed * 1000;
                      writeState({ running: true, startedAt, elapsedSeconds: elapsed });
                    }}
                  >
                    Reprendre
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    writeState({ running: false, startedAt: null, elapsedSeconds: 0 });
                    stopTicker();
                    toast.dismiss(timeTrackerToastId);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        ),
        { id: timeTrackerToastId, duration: Infinity }
      );

      if (running && !tickerRef.current) {
        tickerRef.current = window.setInterval(syncToast, 1000);
      }

      if (!running) {
        stopTicker();
      }
    };

    const onUpdate = () => syncToast();
    window.addEventListener("time-tracker:update", onUpdate);
    syncToast();

    return () => {
      window.removeEventListener("time-tracker:update", onUpdate);
      stopTicker();
      toast.dismiss(timeTrackerToastId);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Erreur logout:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  const commandItems = useMemo(() => menuSections, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((current) => !current);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onOpen = () => setCommandOpen(true);
    window.addEventListener("command-palette:open", onOpen);
    return () => window.removeEventListener("command-palette:open", onOpen);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : null} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b pl-4 pr-6 bg-background shrink-0">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="font-medium">{pageTitle}</span>
          <div className="mx-auto hidden w-full max-w-lg md:block">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground hover:bg-muted/40"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Recherche...</span>
              <Kbd className="hidden lg:inline-flex">
                <span className="mr-0.5">Ctrl</span>K
              </Kbd>
            </button>
          </div>
          {user && (
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">Bonjour, {user.firstName}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || ""} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-medium">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-44">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => router.push("/dashboard/settings") }>
                      <Settings className="h-4 w-4" />
                      <span>Paramètres</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push("/faq") }>
                      <HelpCircle className="h-4 w-4" />
                      <span>Aide</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                    <DropdownMenuShortcut>⇧ ⌘ Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Rechercher..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          {commandItems.map((section) => (
            <CommandGroup key={section.label} heading={section.label}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.title}
                  onSelect={() => {
                    setCommandOpen(false);
                    router.push(item.url);
                  }}
                >
                  <item.icon className="mr-1 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Paramètres">
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                router.push("/dashboard/settings");
              }}
            >
              <span>Paramètres</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                router.push("/dashboard/integrations");
              }}
            >
              <span>Intégrations</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                router.push("/faq");
              }}
            >
              <span>Aide</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  );
}
