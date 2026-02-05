"use client"

import Link from "next/link"
import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Une erreur s&apos;est produite</CardTitle>
          <CardDescription>
            Nous rencontrons un problème technique. Vous pouvez réessayer ou revenir au tableau de bord.
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="flex flex-col gap-2">
          <Button type="button" onClick={reset} className="w-full">
            Réessayer
          </Button>
          <Button asChild type="button" variant="outline" className="w-full">
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
