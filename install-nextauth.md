# Installation NextAuth pour Next.js 15

## 1. Installer les dépendances

```bash
npm install next-auth
```

## 2. Variables d'environnement requises

Dans votre fichier `.env.local` :

```env
# NextAuth
NEXTAUTH_SECRET=dev-nextauth-secret-key-for-afrilance-platform-2024-minimum-32-chars
NEXTAUTH_URL=http://localhost:3000

# Pour la production sur Render :
# NEXTAUTH_URL=https://votre-app.onrender.com
```

## 3. Configuration du layout principal

Ajoutez le provider NextAuth dans votre `app/layout.tsx` :

```tsx
import NextAuthProvider from '@/components/providers/NextAuthProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
```

## 4. Utilisation dans vos composants

```tsx
import { useAuth } from '@/hooks/useAuth'

function MonComposant() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (isAuthenticated) {
    return <div>Bonjour {user?.name}</div>
  }
  
  return <div>Non connecté</div>
}
```

## 5. Protection des routes

Le middleware est déjà configuré pour fonctionner avec NextAuth et votre système JWT existant.

## 6. Déploiement sur Render

1. Ajoutez les variables d'environnement dans Render :
   - `NEXTAUTH_SECRET` : Générez une clé secrète forte
   - `NEXTAUTH_URL` : URL de votre app (ex: https://votre-app.onrender.com)
   - `MONGODB_URI` : Votre URI MongoDB Atlas

2. Le système fonctionnera automatiquement sans erreur JSON.

## 7. Bonnes pratiques

- ✅ Utilisez HTTPS en production
- ✅ Générez un NEXTAUTH_SECRET fort
- ✅ Configurez correctement NEXTAUTH_URL
- ✅ Testez localement avant le déploiement
