"use client";

import { useAuthContext, User } from "@/components/providers/AuthProvider";

export type { User };

export function useAuth() {
  return useAuthContext();
}
