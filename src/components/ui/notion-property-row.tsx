"use client";

import type { ReactNode } from "react";

export function NotionPropertyRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div className="text-sm text-muted-foreground sm:w-28 sm:shrink-0">{label}</div>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
