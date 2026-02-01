"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Hero from "@/components/hero"; 
import Benefits from "@/components/benefits";
import HowItWorks from "@/components/how-it-works";
import FAQ from "@/components/faq";
import Pricing from "@/components/pricing";
import CTAFinal from "@/components/cta-final";
import Footer from "@/components/footer";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <main>
      <Hero />
      <Benefits />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTAFinal />
      <Footer />
    </main>
  );
}
