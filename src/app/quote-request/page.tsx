"use client";
import dynamic from 'next/dynamic';

const QuoteRequestForm = dynamic(() => import('@/components/QuoteRequestForm'), {
  ssr: false
});

export default function QuoteRequestPage() {
  return <QuoteRequestForm />;
}
