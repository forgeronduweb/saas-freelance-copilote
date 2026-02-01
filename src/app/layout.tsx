import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Tuma - Gérez votre activité freelance",
  description: "La plateforme tout-en-un pour gérer votre activité freelance en Côte d'Ivoire : planning, clients, marketing, finance et reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <NextAuthProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
