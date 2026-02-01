"use client";

import React from "react";
import { usePathname } from "next/navigation";

const STEPS = [
  { path: "/onboarding/professions", label: "Professions" },
  { path: "/onboarding/experience", label: "Expérience" },
  { path: "/onboarding/skills", label: "Compétences" },
  { path: "/onboarding/availability", label: "Disponibilité" },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / STEPS.length) * 100 : 25;

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
      <main className="flex-1 w-full px-4 pt-8 pb-0 overflow-hidden">
        <div className="w-full h-full">{children}</div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur border-t">
        <div className="w-full px-6 py-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
