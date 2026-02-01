"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface NextAuthProviderProps {
  children: ReactNode;
}

export default function NextAuthProvider({ children }: NextAuthProviderProps) {
  return (
    <SessionProvider
      // Refetch session every 5 minutes
      refetchInterval={5 * 60}
      // Re-fetch session if window is focused
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
