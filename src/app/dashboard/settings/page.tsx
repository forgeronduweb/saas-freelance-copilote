"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription as ConfirmDialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  ExternalLink,
  Landmark,
  Link2,
  MessageSquare,
  User,
  Mail,
  Phone,
  Building,
  Bell,
  Shield,
  CreditCard,
  Loader2,
  Check,
  Monitor,
  Smartphone,
  Tablet,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const profileSchema = z.object({
  firstName: z.string().min(2, "Minimum 2 caractères"),
  lastName: z.string().min(2, "Minimum 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Requis"),
  newPassword: z.string().min(6, "Minimum 6 caractères"),
  confirmPassword: z.string().min(1, "Requis"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface DeviceSession {
  sessionId: string;
  deviceName: string | null;
  deviceModel: string | null;
  userAgent: string | null;
  ip: string | null;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  lastSeenAt: string;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
}

interface NotificationSetting {
  key: string;
  title: string;
  desc: string;
  enabled: boolean;
}

type IntegrationKey = "google_calendar" | "slack" | "bank";

type IntegrationItem = {
  key: IntegrationKey;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  learnMoreUrl: string;
};

const integrations: IntegrationItem[] = [
  {
    key: "google_calendar",
    title: "Google Calendar",
    description: "Synchronisez vos RDV et vos échéances.",
    icon: Calendar,
    learnMoreUrl: "https://developers.google.com/calendar/api",
  },
  {
    key: "slack",
    title: "Slack",
    description: "Recevez des notifications en temps réel.",
    icon: MessageSquare,
    learnMoreUrl: "https://api.slack.com/",
  },
  {
    key: "bank",
    title: "Connexion bancaire",
    description: "Rapprochez automatiquement paiements et factures.",
    icon: Landmark,
    learnMoreUrl: "https://plaid.com/docs/",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, refetch } = useAuth();
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isSecurityEditing, setIsSecurityEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [deviceSessionsLoading, setDeviceSessionsLoading] = useState(false);
  const [deviceSessionsError, setDeviceSessionsError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { key: "messages", title: "Nouveaux messages", desc: "Recevoir une notification pour chaque nouveau message", enabled: true },
    { key: "invoices", title: "Rappels de factures", desc: "Rappels pour les factures en attente", enabled: true },
    { key: "events", title: "Événements planning", desc: "Rappels avant vos rendez-vous", enabled: true },
    { key: "newsletter", title: "Newsletter", desc: "Recevoir notre newsletter mensuelle", enabled: false },
  ]);

  const [connectedIntegrations, setConnectedIntegrations] = useState<Record<IntegrationKey, boolean>>({
    google_calendar: false,
    slack: false,
    bank: false,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        companyName: user.companyName || "",
      });
    }
  }, [user, profileForm]);

  const cancelProfileEditing = () => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        companyName: user.companyName || "",
      });
    }
    setProfileError(null);
    setProfileSuccess(false);
    setIsProfileEditing(false);
  };

  const cancelSecurityEditing = () => {
    passwordForm.reset();
    setPasswordError(null);
    setPasswordSuccess(false);
    setIsSecurityEditing(false);
  };

  const fetchDeviceSessions = async () => {
    setDeviceSessionsLoading(true);
    setDeviceSessionsError(null);

    try {
      const res = await fetch("/api/auth/sessions", {
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) {
        setDeviceSessions([]);
        setCurrentSessionId(null);
        setDeviceSessionsError(result?.error || "Erreur lors du chargement des sessions");
        return;
      }

      setDeviceSessions(Array.isArray(result.sessions) ? result.sessions : []);
      setCurrentSessionId(result.currentSessionId || null);
    } catch {
      setDeviceSessions([]);
      setCurrentSessionId(null);
      setDeviceSessionsError("Erreur de connexion au serveur");
    } finally {
      setDeviceSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceSessions();

    const interval = window.setInterval(() => {
      fetchDeviceSessions();
    }, 60_000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDeviceSessions();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const revokeSession = async (sessionId: string) => {
    if (revokingSessionId) return;

    setRevokingSessionId(sessionId);
    try {
      const res = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error("Impossible de révoquer la session", {
          description: result?.error || "Erreur serveur",
        });
        return;
      }

      const isCurrent = currentSessionId && sessionId === currentSessionId;

      toast.success("Session révoquée", {
        description: isCurrent ? "Cette session a été déconnectée" : "L’appareil a été déconnecté",
      });

      if (isCurrent) {
        router.replace("/login");
        return;
      }

      await fetchDeviceSessions();
    } catch {
      toast.error("Impossible de révoquer la session", {
        description: "Erreur de connexion au serveur",
      });
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setProfileSuccess(true);
        await refetch();
        setIsProfileEditing(false);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(result.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      setProfileError('Erreur de connexion au serveur');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setPasswordSuccess(true);
        passwordForm.reset();
        setIsSecurityEditing(false);
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError(result.error || 'Erreur lors du changement');
      }
    } catch {
      setPasswordError('Erreur de connexion au serveur');
    } finally {
      setPasswordSaving(false);
    }
  };

  const toggleNotification = (key: string) => {
    setNotifications(prev =>
      prev.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n)
    );
  };

  const toggleIntegration = (key: IntegrationKey) => {
    setConnectedIntegrations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Erreur suppression compte:', error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const getInitials = () => {
    if (!user) return "??";
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getPlanLabel = (planType?: string) => {
    switch (planType) {
      case 'pro-elite': return 'Pro Élite';
      case 'premium': return 'Premium';
      default: return 'Gratuit';
    }
  };

  const getPlanPrice = (planType?: string) => {
    switch (planType) {
      case 'pro-elite': return '29 000 FCFA';
      case 'premium': return '15 000 FCFA';
      default: return '0 FCFA';
    }
  };

  const getDeviceIcon = (deviceType: DeviceSession["deviceType"]) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setDeleteConfirmOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le compte ?</DialogTitle>
            <ConfirmDialogDescription>
              Cette action est définitive. Toutes vos données seront supprimées.
            </ConfirmDialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" /> Profil
                  </CardTitle>
                  <CardDescription>Informations de votre profil public.</CardDescription>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isProfileEditing) {
                      cancelProfileEditing();
                      return;
                    }
                    setIsProfileEditing(true);
                  }}
                >
                  {isProfileEditing ? "Annuler" : "Editer"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline" size="sm" disabled={!isProfileEditing}>
                      Changer la photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB.</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field data-invalid={!!profileForm.formState.errors.firstName}>
                    <FieldLabel>Prénom</FieldLabel>
                    <Input
                      {...profileForm.register("firstName")}
                      placeholder="Votre prénom"
                      disabled={!isProfileEditing}
                    />
                    <FieldError errors={[profileForm.formState.errors.firstName]} />
                  </Field>
                  <Field data-invalid={!!profileForm.formState.errors.lastName}>
                    <FieldLabel>Nom</FieldLabel>
                    <Input
                      {...profileForm.register("lastName")}
                      placeholder="Votre nom"
                      disabled={!isProfileEditing}
                    />
                    <FieldError errors={[profileForm.formState.errors.lastName]} />
                  </Field>
                </div>
                <Field data-invalid={!!profileForm.formState.errors.email}>
                  <FieldLabel className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </FieldLabel>
                  <Input
                    {...profileForm.register("email")}
                    type="email"
                    placeholder="votre@email.com"
                    disabled={!isProfileEditing}
                  />
                  <FieldError errors={[profileForm.formState.errors.email]} />
                </Field>
                <Field>
                  <FieldLabel className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Téléphone
                  </FieldLabel>
                  <Input
                    {...profileForm.register("phone")}
                    type="tel"
                    placeholder="+225 00 00 00 00 00"
                    disabled={!isProfileEditing}
                  />
                </Field>
                <Field>
                  <FieldLabel className="flex items-center gap-1">
                    <Building className="h-3 w-3" /> Entreprise
                  </FieldLabel>
                  <Input
                    {...profileForm.register("companyName")}
                    placeholder="Nom de votre entreprise"
                    disabled={!isProfileEditing}
                  />
                </Field>

                {profileError && (
                  <p className="text-sm text-red-500">{profileError}</p>
                )}

                {isProfileEditing ? (
                  <Button type="submit" disabled={profileSaving} className="w-full sm:w-auto">
                    {profileSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : profileSuccess ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : null}
                    {profileSuccess ? "Sauvegardé" : "Sauvegarder"}
                  </Button>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notifications
              </CardTitle>
              <CardDescription>Configurez vos préférences de notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={item.enabled}
                    onCheckedChange={() => toggleNotification(item.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" /> Intégrations
              </CardTitle>
              <CardDescription>Connectez vos outils (paiements, automatisations, etc.).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {integrations.map((integration, index) => {
                const Icon = integration.icon;
                const isConnected = connectedIntegrations[integration.key];

                return (
                  <div key={integration.key}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border bg-muted/30">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{integration.title}</p>
                            {isConnected ? (
                              <Badge>Connecté</Badge>
                            ) : (
                              <Badge variant="outline">Non connecté</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                          <a
                            href={integration.learnMoreUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            En savoir plus <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={isConnected ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleIntegration(integration.key)}
                        >
                          {isConnected ? "Déconnecter" : "Connecter"}
                        </Button>
                      </div>
                    </div>

                    {index < integrations.length - 1 && <Separator className="my-4" />}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" /> Sécurité
                  </CardTitle>
                  <CardDescription>Paramètres de sécurité de votre compte.</CardDescription>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isSecurityEditing) {
                      cancelSecurityEditing();
                      return;
                    }
                    setIsSecurityEditing(true);
                  }}
                >
                  {isSecurityEditing ? "Annuler" : "Editer"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                <Field data-invalid={!!passwordForm.formState.errors.currentPassword}>
                  <FieldLabel>Mot de passe actuel</FieldLabel>
                  <Input
                    {...passwordForm.register("currentPassword")}
                    type="password"
                    placeholder="••••••••"
                    disabled={!isSecurityEditing}
                  />
                  <FieldError errors={[passwordForm.formState.errors.currentPassword]} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field data-invalid={!!passwordForm.formState.errors.newPassword}>
                    <FieldLabel>Nouveau mot de passe</FieldLabel>
                    <Input
                      {...passwordForm.register("newPassword")}
                      type="password"
                      placeholder="••••••••"
                      disabled={!isSecurityEditing}
                    />
                    <FieldError errors={[passwordForm.formState.errors.newPassword]} />
                  </Field>
                  <Field data-invalid={!!passwordForm.formState.errors.confirmPassword}>
                    <FieldLabel>Confirmer</FieldLabel>
                    <Input
                      {...passwordForm.register("confirmPassword")}
                      type="password"
                      placeholder="••••••••"
                      disabled={!isSecurityEditing}
                    />
                    <FieldError errors={[passwordForm.formState.errors.confirmPassword]} />
                  </Field>
                </div>

                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}

                {isSecurityEditing ? (
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={passwordSaving}
                    className="w-full sm:w-auto"
                  >
                    {passwordSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : passwordSuccess ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : null}
                    {passwordSuccess ? "Modifié" : "Changer le mot de passe"}
                  </Button>
                ) : null}

                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Authentification à deux facteurs</p>
                    <p className="text-xs text-muted-foreground">Ajoutez une couche de sécurité supplémentaire</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" disabled={!isSecurityEditing}>
                    Configurer
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" /> Appareils connectés
                </CardTitle>
                <CardDescription>Liste des appareils où votre compte est actuellement connecté.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {deviceSessionsError ? (
                <p className="text-sm text-red-500">{deviceSessionsError}</p>
              ) : null}

              {!deviceSessionsLoading && deviceSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun appareil enregistré.</p>
              ) : null}

              {deviceSessions.map((s) => {
                const isCurrent = currentSessionId && s.sessionId === currentSessionId;
                const primaryLabel = s.deviceName ||
                  (s.deviceType === "mobile"
                    ? "Mobile"
                    : s.deviceType === "tablet"
                    ? "Tablette"
                    : s.deviceType === "desktop"
                    ? "Ordinateur"
                    : "Appareil");
                const modelLabel = s.deviceModel && s.deviceModel !== primaryLabel ? s.deviceModel : "";
                const uaLabel = s.userAgent && s.userAgent !== primaryLabel && s.userAgent !== modelLabel ? s.userAgent : "";
                return (
                  <div key={s.sessionId} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 text-muted-foreground">{getDeviceIcon(s.deviceType)}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{primaryLabel}</p>
                          {isCurrent ? <Badge variant="secondary">Cette session</Badge> : null}
                          {s.isExpired ? <Badge variant="outline">Expirée</Badge> : null}
                        </div>
                        {modelLabel ? (
                          <p className="text-xs text-muted-foreground truncate">Modèle: {modelLabel}</p>
                        ) : null}
                        {uaLabel ? (
                          <p className="text-xs text-muted-foreground truncate">{uaLabel}</p>
                        ) : null}
                        {!modelLabel && !uaLabel ? (
                          <p className="text-xs text-muted-foreground truncate">User-Agent inconnu</p>
                        ) : null}
                        <p className="text-xs text-muted-foreground mt-1">
                          {s.ip ? `IP ${s.ip} • ` : ""}Dernière activité {new Date(s.lastSeenAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={isCurrent ? "destructive" : "outline"}
                      size="sm"
                      disabled={revokingSessionId === s.sessionId}
                      onClick={() => revokeSession(s.sessionId)}
                      className="shrink-0"
                    >
                      {revokingSessionId === s.sessionId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Badge className="mb-2">{getPlanLabel(user?.planType)}</Badge>
                <p className="text-2xl font-bold">
                  {getPlanPrice(user?.planType)}
                  <span className="text-sm font-normal text-muted-foreground">/mois</span>
                </p>
                {user?.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Membre depuis le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <Button variant="outline" className="w-full">Gérer l’abonnement</Button>
              <Button variant="ghost" className="w-full text-muted-foreground">Voir les factures</Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Zone de danger</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Supprimer définitivement votre compte et toutes vos données.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Supprimer le compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
