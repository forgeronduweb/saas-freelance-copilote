import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
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

        if (!config.database.enabled) {
          throw new Error("Base de données non disponible");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          throw new Error("Aucun compte trouvé avec cet email");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }

        if (!user.isActive) {
          throw new Error("Compte désactivé");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.userType,
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
