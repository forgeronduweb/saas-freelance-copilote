"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  Globe,
  Building2,
  Megaphone,
  CreditCard,
  BarChart3,
  Home,
  Settings,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Link2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export const menuSections = [
  {
    label: "Général",
    items: [
      { title: "Tableau de bord", url: "/dashboard", icon: Home },
    ],
  },
  {
    label: "Vente",
    items: [{ title: "Prospection & CRM", url: "/dashboard/prospection", icon: Megaphone }],
  },
  {
    label: "Marketing",
    items: [{ title: "Mon site", url: "/dashboard/site-web", icon: Globe }],
  },
  {
    label: "Production",
    items: [
      { title: "Projets & Production", url: "/dashboard/projets", icon: Briefcase },
    ],
  },
  {
    label: "Croissance",
    items: [{ title: "Analyses & Croissance", url: "/dashboard/analyses", icon: BarChart3 }],
  },
  {
    label: "Administration",
    items: [
      { title: "Finance & Admin", url: "/dashboard/finance", icon: CreditCard },
      { title: "Entreprise", url: "/dashboard/entreprise", icon: Building2 },
      { title: "Intégrations", url: "/dashboard/integrations", icon: Link2 },
      { title: "Paramètres de l’application", url: "/dashboard/settings/app", icon: Settings },
    ],
  },
] as const

interface AppSidebarProps {
  user?: { name?: string; email?: string } | null
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()

  const isProspectionArea =
    pathname === "/dashboard/prospection" ||
    pathname.startsWith("/dashboard/prospection/") ||
    pathname.startsWith("/dashboard/clients")

  const isAnalysesArea =
    pathname === "/dashboard/analyses" || pathname.startsWith("/dashboard/analyses/")

  const isProjetsArea =
    pathname === "/dashboard/projets" || pathname.startsWith("/dashboard/projets/")

  const isFinanceArea =
    pathname === "/dashboard/finance" || pathname.startsWith("/dashboard/finance/")

  const prospectionActiveTab = (() => {
    if (pathname.startsWith("/dashboard/clients")) return "contacts"
    if (pathname === "/dashboard/prospection") return "pipeline"
    if (pathname.startsWith("/dashboard/prospection/")) {
      const lastSegment = pathname.split("/").filter(Boolean).at(-1)
      if (
        lastSegment === "pipeline" ||
        lastSegment === "contacts" ||
        lastSegment === "opportunites" ||
        lastSegment === "scripts"
      ) {
        return lastSegment
      }
    }
    return "pipeline"
  })()

  const analysesActiveTab = (() => {
    if (pathname === "/dashboard/analyses") return "rapports"
    if (pathname.startsWith("/dashboard/analyses/")) {
      const lastSegment = pathname.split("/").filter(Boolean).at(-1)
      if (lastSegment === "rapports" || lastSegment === "tjm" || lastSegment === "academy") {
        return lastSegment
      }
    }
    return "rapports"
  })()

  const projetsActiveTab = (() => {
    if (pathname === "/dashboard/projets") return "missions"
    if (pathname.startsWith("/dashboard/projets/")) {
      const lastSegment = pathname.split("/").filter(Boolean).at(-1)
      if (
        lastSegment === "missions" ||
        lastSegment === "time-tracker" ||
        lastSegment === "documents" ||
        lastSegment === "planning"
      ) {
        return lastSegment
      }
    }
    return "missions"
  })()

  const financeActiveTab = (() => {
    if (pathname === "/dashboard/finance") return "factures"

    if (pathname.startsWith("/dashboard/finance/devis")) return "devis"
    if (pathname.startsWith("/dashboard/finance/depenses")) return "depenses"
    if (pathname.startsWith("/dashboard/finance/charges")) return "charges"
    if (pathname.startsWith("/dashboard/finance/documents")) return "documents"

    if (pathname.startsWith("/dashboard/finance/")) return "factures"

    return "factures"
  })()

  const [isProspectionMenuOpen, setIsProspectionMenuOpen] = React.useState(isProspectionArea)
  const [isAnalysesMenuOpen, setIsAnalysesMenuOpen] = React.useState(isAnalysesArea)
  const [isProjetsMenuOpen, setIsProjetsMenuOpen] = React.useState(isProjetsArea)
  const [isFinanceMenuOpen, setIsFinanceMenuOpen] = React.useState(isFinanceArea)

  React.useEffect(() => {
    if (isProspectionArea) setIsProspectionMenuOpen(true)
  }, [isProspectionArea])

  React.useEffect(() => {
    if (isAnalysesArea) setIsAnalysesMenuOpen(true)
  }, [isAnalysesArea])

  React.useEffect(() => {
    if (isProjetsArea) setIsProjetsMenuOpen(true)
  }, [isProjetsArea])

  React.useEffect(() => {
    if (isFinanceArea) setIsFinanceMenuOpen(true)
  }, [isFinanceArea])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Erreur logout:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-14 flex items-center justify-start px-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-semibold">Tuma</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="pt-5">
        <div className="flex flex-col gap-4">
          {menuSections.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel className="p-2">{section.label}</SidebarGroupLabel>
              <SidebarGroupContent className="px-2">
                <SidebarMenu className="gap-1">
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.url === "/dashboard/prospection" ? (
                        <>
                          <SidebarMenuButton asChild size="default" isActive={isProspectionArea}>
                            <Link
                              href="/dashboard/prospection/pipeline"
                              title={item.title}
                              className="flex w-full min-w-0 items-center gap-2"
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="flex-1 truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>

                          <SidebarMenuAction
                            type="button"
                            aria-label="Toggle Prospection menu"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setIsProspectionMenuOpen((open) => !open)
                            }}
                          >
                            <ChevronDown
                              className={
                                "h-4 w-4 transition-transform " +
                                (isProspectionMenuOpen ? "rotate-0" : "-rotate-90")
                              }
                            />
                          </SidebarMenuAction>

                          {isProspectionMenuOpen && (
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isProspectionArea && prospectionActiveTab === "pipeline"}
                                >
                                  <Link href="/dashboard/prospection/pipeline">Pipeline</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={
                                    (isProspectionArea && prospectionActiveTab === "contacts") ||
                                    pathname.startsWith("/dashboard/clients")
                                  }
                                >
                                  <Link href="/dashboard/prospection/contacts">Contacts</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isProspectionArea && prospectionActiveTab === "opportunites"}
                                >
                                  <Link href="/dashboard/prospection/opportunites">Opportunités</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isProspectionArea && prospectionActiveTab === "scripts"}
                                >
                                  <Link href="/dashboard/prospection/scripts">Scripts</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          )}
                        </>
                      ) : item.url === "/dashboard/analyses" ? (
                        <>
                          <SidebarMenuButton asChild size="default" isActive={isAnalysesArea}>
                            <Link
                              href="/dashboard/analyses/rapports"
                              title={item.title}
                              className="flex w-full min-w-0 items-center gap-2"
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="flex-1 truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>

                          <SidebarMenuAction
                            type="button"
                            aria-label="Toggle Analyses menu"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setIsAnalysesMenuOpen((open) => !open)
                            }}
                          >
                            <ChevronDown
                              className={
                                "h-4 w-4 transition-transform " +
                                (isAnalysesMenuOpen ? "rotate-0" : "-rotate-90")
                              }
                            />
                          </SidebarMenuAction>

                          {isAnalysesMenuOpen && (
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isAnalysesArea && analysesActiveTab === "rapports"}
                                >
                                  <Link href="/dashboard/analyses/rapports">Rapports</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isAnalysesArea && analysesActiveTab === "tjm"}
                                >
                                  <Link href="/dashboard/analyses/tjm">Calculateur TJM</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isAnalysesArea && analysesActiveTab === "academy"}
                                >
                                  <Link href="/dashboard/analyses/academy">Academy</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          )}
                        </>
                      ) : item.url === "/dashboard/projets" ? (
                        <>
                          <SidebarMenuButton asChild size="default" isActive={isProjetsArea}>
                            <Link
                              href="/dashboard/projets/missions"
                              title={item.title}
                              className="flex w-full min-w-0 items-center gap-2"
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="flex-1 truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>

                          <SidebarMenuAction
                            type="button"
                            aria-label="Toggle Projets menu"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setIsProjetsMenuOpen((open) => !open)
                            }}
                          >
                            <ChevronDown
                              className={
                                "h-4 w-4 transition-transform " +
                                (isProjetsMenuOpen ? "rotate-0" : "-rotate-90")
                              }
                            />
                          </SidebarMenuAction>

                          {isProjetsMenuOpen && (
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isProjetsArea && projetsActiveTab === "missions"}
                                >
                                  <Link href="/dashboard/projets/missions">Missions</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isProjetsArea && projetsActiveTab === "time-tracker"}
                                >
                                  <Link href="/dashboard/projets/time-tracker">Time tracker</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isProjetsArea && projetsActiveTab === "documents"}
                                >
                                  <Link href="/dashboard/projets/documents">Documents</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isProjetsArea && projetsActiveTab === "planning"}
                                >
                                  <Link href="/dashboard/projets/planning">Agenda</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          )}
                        </>
                      ) : item.url === "/dashboard/finance" ? (
                        <>
                          <SidebarMenuButton asChild size="default" isActive={isFinanceArea}>
                            <Link
                              href="/dashboard/finance/factures"
                              title={item.title}
                              className="flex w-full min-w-0 items-center gap-2"
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="flex-1 truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>

                          <SidebarMenuAction
                            type="button"
                            aria-label="Toggle Finance menu"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setIsFinanceMenuOpen((open) => !open)
                            }}
                          >
                            <ChevronDown
                              className={
                                "h-4 w-4 transition-transform " +
                                (isFinanceMenuOpen ? "rotate-0" : "-rotate-90")
                              }
                            />
                          </SidebarMenuAction>

                          {isFinanceMenuOpen && (
                            <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isFinanceArea && financeActiveTab === "factures"}
                                >
                                  <Link href="/dashboard/finance/factures">Factures</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isFinanceArea && financeActiveTab === "devis"}
                                >
                                  <Link href="/dashboard/finance/devis">Devis</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isFinanceArea && financeActiveTab === "depenses"}
                                >
                                  <Link href="/dashboard/finance/depenses">Dépenses</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isFinanceArea && financeActiveTab === "charges"}
                                >
                                  <Link href="/dashboard/finance/charges">Charges</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isFinanceArea && financeActiveTab === "documents"}
                                >
                                  <Link href="/dashboard/finance/documents">Documents</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          )}
                        </>
                      ) : (
                        <SidebarMenuButton asChild size="default" isActive={pathname === item.url}>
                          <Link
                            href={item.url}
                            title={item.title}
                            className="flex w-full items-center gap-2"
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="gap-1 px-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="default" isActive={pathname === "/faq"}>
              <Link href="/faq" title="Aide" className="flex w-full items-center gap-2">
                <HelpCircle className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">Aide</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="default" isActive={pathname === "/dashboard/feedback"}>
              <Link
                href="/dashboard/feedback"
                title="Feedback"
                className="flex w-full items-center gap-2"
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">Feedback</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
