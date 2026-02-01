"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, Sun, Moon } from "lucide-react";

const AVAILABILITY_OPTIONS = [
  { value: "full-time", label: "Temps plein", description: "Disponible toute la semaine" },
  { value: "part-time", label: "Temps partiel", description: "Quelques heures par jour" },
  { value: "weekends", label: "Week-ends", description: "Samedi et dimanche uniquement" },
  { value: "evenings", label: "Soirées", description: "Après 18h en semaine" },
];

const DAYS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

export default function AvailabilityOnboardingPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, refetch } = useAuth();

  const [availability, setAvailability] = useState<string>("");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login?redirect=/onboarding/availability");
      return;
    }

    if (user?.onboardingCompleted) {
      router.replace("/dashboard");
      return;
    }

    if (user?.availability) setAvailability(user.availability);
    if (Array.isArray(user?.preferredDays)) setPreferredDays(user.preferredDays);
  }, [isLoading, isAuthenticated, user, router]);

  const toggleDay = (day: string) => {
    setPreferredDays((prev) => {
      if (prev.includes(day)) return prev.filter((d) => d !== day);
      return [...prev, day];
    });
  };

  const onSubmit = async () => {
    setError(null);

    if (!availability) {
      setError("Choisissez votre disponibilité.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          step: 4,
          data: {
            availability,
            preferredDays,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Une erreur est survenue");
        setIsSaving(false);
        return;
      }

      // Mettre à jour localStorage avec onboardingCompleted = true
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.onboardingCompleted = true;
        localStorage.setItem("user", JSON.stringify(parsed));
      }

      router.push("/dashboard");
      refetch();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsSaving(false);
    }
  };

  const onBack = () => {
    router.push("/onboarding/skills");
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="text-center flex-shrink-0">
        <h1 className="text-2xl font-medium">Votre disponibilité</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dernière étape ! Indiquez quand vous êtes disponible pour travailler.
        </p>
      </div>

      {error && <p className="text-sm text-destructive flex-shrink-0">{error}</p>}

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-md mx-auto space-y-8">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 text-primary" />
            Type de disponibilité
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AVAILABILITY_OPTIONS.map((option) => {
              const icons = {
                "full-time": <Sun className="w-4 h-4" />,
                "part-time": <Clock className="w-4 h-4" />,
                "weekends": <Calendar className="w-4 h-4" />,
                "evenings": <Moon className="w-4 h-4" />,
              };
              return (
                <label
                  key={option.value}
                  className={`flex flex-col rounded-xl border-2 px-4 py-4 cursor-pointer transition-all hover:scale-105 ${
                    availability === option.value
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 bg-white/50 backdrop-blur"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      checked={availability === option.value}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="accent-primary"
                    />
                    <div className={`p-2 rounded-lg ${
                      availability === option.value ? "bg-primary/20" : "bg-gray-100"
                    }`}>
                      {icons[option.value as keyof typeof icons]}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 ml-11">
                    {option.description}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-primary" />
            Jours préférés (optionnel)
          </label>
          <div className="flex flex-wrap gap-3">
            {DAYS.map((day) => {
              const checked = preferredDays.includes(day);
              return (
                <label
                  key={day}
                  className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 cursor-pointer text-sm capitalize transition-all hover:scale-105 ${
                    checked
                      ? "border-primary bg-primary/10 text-gray-900 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white/50 backdrop-blur text-gray-900"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleDay(day)}
                    className="hidden"
                  />
                  {day}
                </label>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      <div className="fixed bottom-[45px] left-6 right-6 z-50 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
        <Button variant="outline" onClick={onBack} className="w-full py-3 rounded-xl sm:w-auto sm:px-16">
          Retour
        </Button>
        <Button onClick={onSubmit} disabled={isSaving || !availability} className="w-full py-3 rounded-xl sm:w-auto sm:px-16">
          {isSaving ? "Enregistrement..." : "Terminer"}
        </Button>
      </div>
    </div>
  );
}
