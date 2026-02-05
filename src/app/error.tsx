'use client'

import Image from "next/image"
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
    <div className="min-h-screen bg-gradient-to-b from-yellow-50/60 via-background to-background dark:from-yellow-500/10">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center p-6">
        <div className="mb-6 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Tuma"
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
          <span className="text-lg font-semibold">Tuma</span>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <TriangleAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Une erreur s&apos;est produite</CardTitle>
            <CardDescription>
              Nous rencontrons un problème technique. Vous pouvez réessayer ou revenir à l&apos;accueil.
            </CardDescription>
          </CardHeader>
          <CardContent />
          <CardFooter className="flex flex-col gap-2">
            <Button type="button" onClick={reset} className="w-full">
              Réessayer
            </Button>
            <Button asChild type="button" variant="outline" className="w-full">
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
