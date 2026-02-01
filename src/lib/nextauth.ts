import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { config } from '@/lib/config';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        // Utiliser les utilisateurs statiques
        const user = config.staticUsers.find(
          u => u.email.toLowerCase() === credentials.email.toLowerCase()
        );

        if (!user) {
          throw new Error("Aucun compte trouvé avec cet email");
        }

        if (user.password !== credentials.password) {
          throw new Error("Mot de passe incorrect");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  secret: config.nextAuth.secret,
  
  debug: config.app.debugMode,
  
  events: {
    async signIn({ user, account, profile }) {
      console.log(`✅ Connexion réussie pour ${user.email}`);
    },
    async signOut({ session, token }) {
      console.log(`👋 Déconnexion de ${session?.user?.email || 'utilisateur'}`);
    },
  },
  
  // Configuration pour éviter les erreurs de CORS et JSON
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
