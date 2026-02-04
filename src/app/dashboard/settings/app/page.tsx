"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Languages } from "lucide-react";

type ThemePreference = "light" | "dark";

type AppSettingsState = {
  theme: ThemePreference;
  language: "fr" | "en";
};

const appSettingsStorageKey = "appSettings";

function persistThemeCookie(theme: ThemePreference) {
  document.cookie = `tuma-theme=${theme}; path=/; max-age=31536000; samesite=lax`;
}

function safeParseSettings(raw: string | null): AppSettingsState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettingsState>;

    const theme: ThemePreference = parsed.theme === "dark" ? "dark" : "light";

    const language: "fr" | "en" = parsed.language === "en" ? "en" : "fr";

    return { theme, language };
  } catch {
    return null;
  }
}

function applyThemePreference(theme: ThemePreference) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export default function AppSettingsPage() {
  const [settings, setSettings] = useState<AppSettingsState>({ theme: "light", language: "fr" });

  useEffect(() => {
    const stored = safeParseSettings(localStorage.getItem(appSettingsStorageKey));
    const initial = stored ?? { theme: "light", language: "fr" };
    setSettings(initial);
    applyThemePreference(initial.theme);
    persistThemeCookie(initial.theme);
  }, []);

  useEffect(() => {
    localStorage.setItem(appSettingsStorageKey, JSON.stringify(settings));
  }, [settings]);

  const themeLabel = useMemo(() => {
    switch (settings.theme) {
      case "light":
        return "Clair";
      case "dark":
        return "Sombre";
      default:
        return "Clair";
    }
  }, [settings.theme]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" /> Apparence
            </CardTitle>
            <CardDescription>Réglages d’affichage propres à cette application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Thème</p>
              <Select
                value={settings.theme}
                onValueChange={(value) => {
                  const next = (value === "dark" ? "dark" : "light") as ThemePreference;
                  setSettings((prev) => ({ ...prev, theme: next }));
                  applyThemePreference(next);
                  persistThemeCookie(next);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={themeLabel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Mode sombre</p>
                <p className="text-xs text-muted-foreground">Active/désactive le mode sombre.</p>
              </div>
              <Switch
                checked={settings.theme === "dark"}
                onCheckedChange={(checked) => {
                  const next: ThemePreference = checked ? "dark" : "light";
                  setSettings((prev) => ({ ...prev, theme: next }));
                  applyThemePreference(next);
                  persistThemeCookie(next);
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" /> Langue
            </CardTitle>
            <CardDescription>Préférences de langue et de formatage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Langue de l’interface</p>
              <Select
                value={settings.language}
                onValueChange={(value) => {
                  const next: "fr" | "en" = value === "en" ? "en" : "fr";
                  setSettings((prev) => ({ ...prev, language: next }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={settings.language === "en" ? "English" : "Français"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              Ces réglages sont enregistrés sur cet appareil.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
