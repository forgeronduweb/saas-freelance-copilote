"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

 export default function FinancePage() {
   const router = useRouter();
 
   useEffect(() => {
     router.replace("/dashboard/finance/factures");
   }, [router]);
 
   return null;
 }
