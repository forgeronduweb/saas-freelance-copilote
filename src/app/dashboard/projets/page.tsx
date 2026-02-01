"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProjetsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/projets/missions");
  }, [router]);

  return null;
}
