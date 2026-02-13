"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

const SKILLS_BY_PROFESSION: Record<string, string[]> = {
  "Développeur": ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PHP", "Laravel", "WordPress", "SQL", "MongoDB", "AWS", "Docker", "Python", "Git"],
  "Designer": ["Figma", "Adobe XD", "Photoshop", "Illustrator", "Premiere Pro", "After Effects", "Sketch", "InDesign"],
  "Designer UI/UX": ["Figma", "Adobe XD", "Photoshop", "Illustrator", "React", "Next.js", "Sketch", "InVision"],
  "Consultant": ["Power BI", "Excel avancé", "Data Analysis", "SQL", "PowerPoint", "Présentation", "Notion", "Trello", "Asana"],
  "Photographe": ["Photoshop", "Lightroom", "Premiere Pro", "After Effects", "Illustrator", "Capture One"],
  "Graphiste": ["Photoshop", "Illustrator", "Premiere Pro", "After Effects", "Figma", "InDesign", "CorelDRAW"],
  "Vidéaste": ["Premiere Pro", "After Effects", "Photoshop", "Illustrator", "DaVinci Resolve", "Final Cut Pro"],
  "Monteur vidéo": ["Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro", "Photoshop", "Illustrator"],
  "Rédacteur": ["Copywriting", "Rédaction web", "SEO", "Google Analytics", "Content Marketing", "Blog"],
  "Community Manager": ["Community Management", "Facebook Ads", "Google Ads", "SEO", "Copywriting", "Social Media", "Instagram", "TikTok", "LinkedIn"],
  "Data Analyst": ["Data Analysis", "Excel avancé", "Power BI", "SQL", "Python", "R", "Tableau", "Google Analytics"],
  "DevOps": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Git", "Terraform", "Ansible", "Monitoring"],
  "QA / Testeur": ["Tests", "Test manuel", "Automatisation", "Cypress", "Playwright", "Selenium", "Jest", "Postman", "Bug tracking"],
  "Product Manager": ["Roadmap", "User Research", "Wireframing", "Analytics", "Notion", "Trello", "Asana", "Jira", "Communication"],
  "Marketeur": ["SEO", "Google Ads", "Facebook Ads", "Community Management", "Copywriting", "Rédaction web", "Google Analytics", "Email Marketing", "Marketing Automation"],
  "Chef de Projet": ["Power BI", "Excel avancé", "PowerPoint", "Notion", "Trello", "Asana", "Jira", "Slack", "Microsoft Project"],
  "Traducteur": ["Copywriting", "Rédaction web", "SEO", "Google Analytics", "CAT Tools", "MemoQ", "Trados"],
  "Marketing": ["SEO", "Google Ads", "Facebook Ads", "Community Management", "Copywriting", "Rédaction web", "Google Analytics", "Email Marketing", "Marketing Automation"],
  "Développeur Web": ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PHP", "Laravel", "WordPress", "SQL", "MongoDB", "AWS", "Docker"],
  "Designer UX/UI": ["Figma", "Adobe XD", "Photoshop", "Illustrator", "React", "Next.js", "Sketch", "InVision"],
  "Designer Graphique": ["Photoshop", "Illustrator", "Premiere Pro", "After Effects", "Figma", "InDesign", "CorelDRAW"],
  "Marketing Digital": ["SEO", "Google Ads", "Facebook Ads", "Community Management", "Copywriting", "Rédaction web", "Google Analytics"],
};

const ALL_SKILLS = Array.from(new Set(Object.values(SKILLS_BY_PROFESSION).flat()));

export default function SkillsOnboardingPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, refetch } = useAuth();

  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedProfessions, setStoredProfessions] = useState<string[]>([]);

  const options = useMemo(() => {
    const userProfessions = Array.isArray(user?.professions) && user.professions.length
      ? user.professions
      : storedProfessions;

    // Si aucune profession sélectionnée, afficher toutes les compétences
    if (userProfessions.length === 0) {
      return [...ALL_SKILLS].sort((a, b) => a.localeCompare(b, "fr"));
    }
    
    // Récupérer les compétences pertinentes pour les professions sélectionnées
    const relevantSkills = new Set<string>();
    userProfessions.forEach(profession => {
      const skills = SKILLS_BY_PROFESSION[profession];
      if (skills) {
        skills.forEach(skill => relevantSkills.add(skill));
      }
    });
    
    // Ajouter quelques compétences connexes pour plus de choix
    const allRelevantSkills = Array.from(relevantSkills);
    if (allRelevantSkills.length === 0) {
      return [...ALL_SKILLS].sort((a, b) => a.localeCompare(b, "fr"));
    }

    return allRelevantSkills.sort((a, b) => a.localeCompare(b, "fr"));
  }, [user?.professions, storedProfessions, isLoading]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setStoredProfessions(Array.isArray(parsed.professions) ? parsed.professions : []);
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login?redirect=/onboarding/skills");
      return;
    }

    if (user?.onboardingCompleted) {
      router.replace("/dashboard");
      return;
    }

    setSelected(Array.isArray(user?.skills) ? user.skills : []);
  }, [isLoading, isAuthenticated, user, router]);

  const toggle = (value: string) => {
    setSelected((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      return [...prev, value];
    });
  };

  const onSubmit = async () => {
    setError(null);

    if (!selected.length) {
      setError("Choisissez au moins une compétence.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          step: 3,
          data: { skills: selected },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Une erreur est survenue");
        setIsSaving(false);
        return;
      }

      router.push("/onboarding/availability");
      refetch();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsSaving(false);
    }
  };

  const onBack = () => {
    router.push("/onboarding/experience");
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="text-center flex-shrink-0">
        <h1 className="text-2xl font-medium">Vos compétences techniques</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionnez les outils et technologies que vous maîtrisez.
        </p>
        <div className="text-sm text-muted-foreground mt-2">
          {selected.length} sélectionnée(s)
        </div>
      </div>

      {error && <p className="text-sm text-destructive flex-shrink-0">{error}</p>}

      <div
        className="w-full flex-1 min-h-0 overflow-auto pt-6 pb-36"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {options.map((skill) => {
            const checked = selected.includes(skill);
            return (
              <label
                key={skill}
                className="flex items-center gap-3 rounded-xl border border-input bg-background/80 backdrop-blur px-4 h-[48px] cursor-pointer hover:bg-accent transition-all"
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(skill)} />
                <span className="text-sm truncate">{skill}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-[45px] left-6 right-6 z-50 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          Retour
        </Button>
        <Button onClick={onSubmit} disabled={isSaving || !selected.length} className="w-full sm:w-auto">
          {isSaving ? "Enregistrement..." : "Suivant"}
        </Button>
      </div>
    </div>
  );
}
