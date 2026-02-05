import Image from "next/image"
import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50/60 via-background to-background dark:from-yellow-500/10">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center p-6">

        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/15">
              <FileQuestion className="h-6 w-6 text-yellow-700 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-xl">Page introuvable</CardTitle>
            <CardDescription>
              La page que vous recherchez n&apos;existe pas (ou a été déplacée).
            </CardDescription>
          </CardHeader>
          <CardContent />
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Se connecter</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
