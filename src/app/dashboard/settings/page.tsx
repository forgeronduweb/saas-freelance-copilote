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
import {
  Dialog,
  DialogContent,
  DialogDescription as ConfirmDialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Mail, Phone, Building, Bell, Shield, CreditCard, Palette, Loader2, Check } from "lucide-react";
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

interface NotificationSetting {
  key: string;
  title: string;
  desc: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, refetch } = useAuth();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { key: "messages", title: "Nouveaux messages", desc: "Recevoir une notification pour chaque nouveau message", enabled: true },
    { key: "invoices", title: "Rappels de factures", desc: "Rappels pour les factures en attente", enabled: true },
    { key: "events", title: "Événements planning", desc: "Rappels avant vos rendez-vous", enabled: true },
    { key: "newsletter", title: "Newsletter", desc: "Recevoir notre newsletter mensuelle", enabled: false },
  ]);

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
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Profil
              </CardTitle>
              <CardDescription>Informations de votre profil public.</CardDescription>
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
                    <Button type="button" variant="outline" size="sm">Changer la photo</Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB.</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!profileForm.formState.errors.firstName}>
                    <FieldLabel>Prénom</FieldLabel>
                    <Input {...profileForm.register("firstName")} placeholder="Votre prénom" />
                    <FieldError errors={[profileForm.formState.errors.firstName]} />
                  </Field>
                  <Field data-invalid={!!profileForm.formState.errors.lastName}>
                    <FieldLabel>Nom</FieldLabel>
                    <Input {...profileForm.register("lastName")} placeholder="Votre nom" />
                    <FieldError errors={[profileForm.formState.errors.lastName]} />
                  </Field>
                </div>
                <Field data-invalid={!!profileForm.formState.errors.email}>
                  <FieldLabel className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </FieldLabel>
                  <Input {...profileForm.register("email")} type="email" placeholder="votre@email.com" />
                  <FieldError errors={[profileForm.formState.errors.email]} />
                </Field>
                <Field>
                  <FieldLabel className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Téléphone
                  </FieldLabel>
                  <Input {...profileForm.register("phone")} type="tel" placeholder="+33 6 00 00 00 00" />
                </Field>
                <Field>
                  <FieldLabel className="flex items-center gap-1">
                    <Building className="h-3 w-3" /> Entreprise
                  </FieldLabel>
                  <Input {...profileForm.register("companyName")} placeholder="Nom de votre entreprise" />
                </Field>

                {profileError && (
                  <p className="text-sm text-red-500">{profileError}</p>
                )}

                <Button type="submit" disabled={profileSaving}>
                  {profileSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : profileSuccess ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {profileSuccess ? "Sauvegardé" : "Sauvegarder"}
                </Button>
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
                <Shield className="h-5 w-5" /> Sécurité
              </CardTitle>
              <CardDescription>Paramètres de sécurité de votre compte.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                <Field data-invalid={!!passwordForm.formState.errors.currentPassword}>
                  <FieldLabel>Mot de passe actuel</FieldLabel>
                  <Input {...passwordForm.register("currentPassword")} type="password" placeholder="••••••••" />
                  <FieldError errors={[passwordForm.formState.errors.currentPassword]} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!passwordForm.formState.errors.newPassword}>
                    <FieldLabel>Nouveau mot de passe</FieldLabel>
                    <Input {...passwordForm.register("newPassword")} type="password" placeholder="••••••••" />
                    <FieldError errors={[passwordForm.formState.errors.newPassword]} />
                  </Field>
                  <Field data-invalid={!!passwordForm.formState.errors.confirmPassword}>
                    <FieldLabel>Confirmer</FieldLabel>
                    <Input {...passwordForm.register("confirmPassword")} type="password" placeholder="••••••••" />
                    <FieldError errors={[passwordForm.formState.errors.confirmPassword]} />
                  </Field>
                </div>

                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}

                <Button type="submit" variant="outline" disabled={passwordSaving}>
                  {passwordSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : passwordSuccess ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : null}
                  {passwordSuccess ? "Modifié" : "Changer le mot de passe"}
                </Button>

                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Authentification à deux facteurs</p>
                    <p className="text-xs text-muted-foreground">Ajoutez une couche de sécurité supplémentaire</p>
                  </div>
                  <Button type="button" variant="outline" size="sm">Configurer</Button>
                </div>
              </form>
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
              <Button variant="outline" className="w-full">Gérer l'abonnement</Button>
              <Button variant="ghost" className="w-full text-muted-foreground">Voir les factures</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" /> Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Thème</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" className="border-primary">Clair</Button>
                  <Button variant="outline" size="sm">Sombre</Button>
                  <Button variant="outline" size="sm">Auto</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Langue</label>
                <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option>Français</option>
                  <option>English</option>
                </select>
              </div>
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
