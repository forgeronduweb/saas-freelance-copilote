"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnalysesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/analyses/rapports");
  }, [router]);

  return null;
}
