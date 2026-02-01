import NextAuth from "next-auth";
import { authOptions } from "@/lib/nextauth";

// Configuration NextAuth pour App Router
const handler = NextAuth(authOptions);

// Export des méthodes HTTP pour App Router
export { handler as GET, handler as POST };

// Configuration pour éviter les erreurs de cache
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
