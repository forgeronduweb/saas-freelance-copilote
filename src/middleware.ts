import { NextRequest, NextResponse } from 'next/server'

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/dashboard',
  '/onboarding',
  '/profile',
  '/projects',
  '/messages',
  '/settings'
]

// Routes publiques (pas besoin d'auth)
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/reset-password'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Ignorer les fichiers statiques et API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Vérifier si la route nécessite une authentification
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Récupérer le token depuis les cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Rediriger vers login si pas de token
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Le token existe - la validation complète se fait côté API
    // Cela évite les problèmes de compatibilité Edge Runtime avec crypto
    return NextResponse.next()
  }

  // Route publique ou non protégée
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|logo.png|api).*)',
  ],
}
