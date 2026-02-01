"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProspectionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/prospection/pipeline");
  }, [router]);

  return null;
}
