import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import AnalyticsTracker from "@/components/analytics-tracker";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("tuma-theme")?.value;
  const htmlClassName = themeCookie === "dark" ? "dark" : undefined;

  return (
    <html lang="fr" className={htmlClassName} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var path = window.location && window.location.pathname ? window.location.pathname : "";
    if (path === "/") {
      document.documentElement.classList.remove("dark");
      return;
    }

    var raw = localStorage.getItem("appSettings");
    var settings = raw ? JSON.parse(raw) : null;
    var theme = settings && (settings.theme === "dark" || settings.theme === "light") ? settings.theme : null;

    if (!theme) {
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      theme = prefersDark ? "dark" : "light";
      var next = settings && typeof settings === "object" && settings !== null ? settings : {};
      next.theme = theme;
      if (!next.language) next.language = "fr";
      localStorage.setItem("appSettings", JSON.stringify(next));
    }

    document.cookie = "tuma-theme=" + theme + "; path=/; max-age=31536000; samesite=lax";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch (e) {}
})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <AnalyticsTracker />
        <NextAuthProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
