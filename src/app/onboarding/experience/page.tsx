"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, Briefcase, DollarSign } from "lucide-react";

export default function ExperienceOnboardingPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, refetch } = useAuth();

  const [bio, setBio] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">("");
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login?redirect=/onboarding/experience");
      return;
    }

    if (user?.onboardingCompleted) {
      router.replace("/dashboard");
      return;
    }

    // Pré-remplir si déjà renseigné
    if (user?.bio) setBio(user.bio);
    if (user?.yearsOfExperience) setYearsOfExperience(user.yearsOfExperience);
    if (user?.hourlyRate) setHourlyRate(user.hourlyRate);
  }, [isLoading, isAuthenticated, user, router]);

  const onSubmit = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          step: 2,
          data: {
            bio: bio.trim() || null,
            yearsOfExperience: yearsOfExperience || null,
            hourlyRate: hourlyRate || null,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Une erreur est survenue");
        setIsSaving(false);
        return;
      }

      router.push("/onboarding/skills");
      refetch();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsSaving(false);
    }
  };

  const onBack = () => {
    router.push("/onboarding/professions");
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="text-center flex-shrink-0">
        <h1 className="text-2xl font-medium">Parlez-nous de vous</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ces informations aideront les clients à mieux vous connaître.
        </p>
      </div>

      {error && <p className="text-sm text-destructive flex-shrink-0">{error}</p>}

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-md mx-auto space-y-8">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <User className="w-4 h-4 text-primary" />
            Bio / Présentation
          </label>
          <div className="relative">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Décrivez votre parcours, vos spécialités..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all bg-white/50 backdrop-blur"
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {bio.length}/500
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="w-4 h-4 text-primary" />
              Années d'expérience
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={yearsOfExperience}
              onChange={(e) =>
                setYearsOfExperience(e.target.value ? parseInt(e.target.value) : "")
              }
              placeholder="Ex: 5"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50 backdrop-blur"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4 text-primary" />
              Taux horaire (FCFA)
            </label>
            <input
              type="number"
              min={0}
              value={hourlyRate}
              onChange={(e) =>
                setHourlyRate(e.target.value ? parseInt(e.target.value) : "")
              }
              placeholder="Ex: 15000"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50 backdrop-blur"
            />
          </div>
        </div>
      </div>
      </div>

      <div className="fixed bottom-[45px] left-6 right-6 z-50 flex justify-center gap-20">
        <Button variant="outline" onClick={onBack} className="px-16 py-3 rounded-xl">
          Retour
        </Button>
        <Button onClick={onSubmit} disabled={isSaving} className="px-16 py-3 rounded-xl">
          {isSaving ? "Enregistrement..." : "Suivant"}
        </Button>
      </div>
    </div>
  );
}
