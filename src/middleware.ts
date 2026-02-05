import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

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

/**
 * Vérifie le token JWT avec jose (compatible Edge Runtime)
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('JWT_SECRET non défini')
      return false
    }
    
    const secretKey = new TextEncoder().encode(secret)
    await jwtVerify(token, secretKey)
    return true
  } catch (error) {
    return false
  }
}

export async function middleware(request: NextRequest) {
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

    // Valider le token JWT
    const isValid = await verifyToken(token)
    
    if (!isValid) {
      // Token invalide ou expiré - supprimer le cookie et rediriger
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('expired', '1')
      
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('auth-token')
      return response
    }

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
