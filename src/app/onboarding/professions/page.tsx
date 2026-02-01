"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

const PROFESSION_OPTIONS = [
  "Développeur",
  "Community Manager",
  "Designer UI/UX",
  "Graphiste",
  "Rédacteur",
  "Monteur vidéo",
  "Marketeur",
  "Product Manager",
  "Data Analyst",
  "DevOps",
  "QA / Testeur",
  "Consultant",
];

export default function ProfessionsOnboardingPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, refetch } = useAuth();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [positions, setPositions] = useState<Array<{ top: number; left: number }>>([]);
  const [scatterHeight, setScatterHeight] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  const options = useMemo(() => {
    const arr = [...PROFESSION_OPTIONS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const el = containerRef.current;
    if (!el) return;

    const TILE_W = 160;
    const TILE_H = 48;
    const PADDING = 30;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width));
      const height = Math.max(480, Math.floor(window.innerHeight * 0.72));

      const placed: Array<{ top: number; left: number }> = [];

      // Version mobile : 2 colonnes alignées
      if (width < 768) {
        const COLS = 2;
        const GAP = 16;
        const availableWidth = width - 40; // margin
        const tileWidth = (availableWidth - GAP * (COLS - 1)) / COLS;
        
        for (let i = 0; i < options.length; i++) {
          const row = Math.floor(i / COLS);
          const col = i % COLS;
          const left = 20 + col * (tileWidth + GAP);
          const top = 20 + row * (TILE_H + GAP);
          
          placed.push({ top, left });
        }
        
        const lastRow = Math.floor((options.length - 1) / COLS);
        const totalHeight = 20 + (lastRow + 1) * (TILE_H + GAP);
        setScatterHeight(totalHeight);
      } 
      // Version desktop : positions aléatoires
      else {
        const collides = (t: number, l: number) => {
          for (const p of placed) {
            if (
              l < p.left + TILE_W + PADDING &&
              l + TILE_W + PADDING > p.left &&
              t < p.top + TILE_H + PADDING &&
              t + TILE_H + PADDING > p.top
            ) {
              return true;
            }
          }
          return false;
        };

        for (let i = 0; i < options.length; i++) {
          let top = 0;
          let left = 0;
          let attempts = 0;
          do {
            top = Math.floor(Math.random() * (height - TILE_H - 40));
            left = Math.floor(Math.random() * (width - TILE_W - 40));
            attempts++;
          } while (collides(top, left) && attempts < 200);
          placed.push({ top, left });
        }

        setScatterHeight(height);
      }

      setPositions(placed);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("resize", compute);
    };
  }, [options, isClient]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login?redirect=/onboarding/professions");
      return;
    }

    if (user?.onboardingCompleted) {
      router.replace("/dashboard");
      return;
    }

    setSelected(Array.isArray(user?.professions) ? user!.professions! : []);
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
      setError("Choisissez au moins une profession.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          step: 1,
          data: { professions: selected },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Une erreur est survenue");
        setIsSaving(false);
        return;
      }

      // Naviguer d'abord, refetch en arrière-plan
      router.push("/onboarding/experience");
      refetch();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="text-center flex-shrink-0">
        <h1 className="text-2xl font-medium">Choisissez vos professions</h1>
        <p className="text-sm text-muted-foreground mt-1">Vous pouvez sélectionner plusieurs options.</p>
      </div>

      {error && <p className="text-sm text-destructive flex-shrink-0">{error}</p>}

      <div
        ref={containerRef}
        className="relative w-full flex-1 min-h-0 overflow-hidden"
      >
        {isClient && options.map((profession, index) => {
          const checked = selected.includes(profession);
          const pos = positions[index];
          return (
            <label
              key={profession}
              className="absolute flex items-center gap-3 rounded-xl border border-input bg-background/80 backdrop-blur px-4 h-[48px] cursor-pointer hover:bg-accent transition-all"
              style={{ 
  top: pos?.top ?? 0, 
  left: pos?.left ?? 0,
  width: window.innerWidth < 768 ? 'calc(50% - 28px)' : '160px'
}}
            >
              <Checkbox checked={checked} onCheckedChange={() => toggle(profession)} />
              <span className="text-sm truncate">{profession}</span>
            </label>
          );
        })}
      </div>

      <div className="fixed bottom-[45px] left-6 right-6 z-50 flex justify-end">
        <Button onClick={onSubmit} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? "Enregistrement..." : "Suivant"}
        </Button>
      </div>
    </div>
  );
}
