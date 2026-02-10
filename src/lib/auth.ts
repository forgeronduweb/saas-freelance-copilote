import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '@/lib/models/User';
import { config } from '@/lib/config';

// Interface pour le payload JWT
export interface JWTPayload {
  userId: string;
  email: string;
  userType: 'freelance' | 'client' | 'admin';
  sessionId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Hache un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, config.auth.bcryptSaltRounds);
}

/**
 * Vérifie un mot de passe
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Génère un token JWT
 */
export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    userType: user.userType,
  };

  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  } as jwt.SignOptions);
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extrait le token du header Authorization
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Génère un mot de passe temporaire
 */
export function generateTempPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Valide la force d'un mot de passe
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }

  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
