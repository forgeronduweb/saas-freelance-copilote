import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-normal text-yellow-600">404</span>
            </div>
            <CardTitle className="text-xl font-normal">Page introuvable</CardTitle>
            <CardDescription className="mt-1">
              La page que vous recherchez n&apos;existe pas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link 
              href="/" 
              className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors text-center block"
            >
              Retour à l&apos;accueil
            </Link>
            <Link 
              href="/login" 
              className="w-full py-2 px-4 border border-input bg-background text-foreground font-medium rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors text-center block"
            >
              Se connecter
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
