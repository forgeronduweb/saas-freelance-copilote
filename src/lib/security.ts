import { config } from '@/lib/config';

/**
 * Utilitaires de sécurité pour Tuma
 */

/**
 * Nettoie et valide les données d'entrée pour éviter les injections
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprime les scripts
    .replace(/javascript:/gi, '') // Supprime javascript:
    .replace(/on\w+\s*=/gi, '') // Supprime les event handlers
    .slice(0, 1000); // Limite la longueur
}

/**
 * Valide un email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Valide un numéro de téléphone (format international ou local)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Valide une URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Génère un identifiant sécurisé
 */
export function generateSecureId(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Masque les données sensibles pour les logs
 */
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) return data;
  
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'authorization',
    'credit_card', 'ssn', 'phone', 'email'
  ];
  
  const masked = { ...data };
  
  for (const key in masked) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      if (typeof masked[key] === 'string' && masked[key].length > 0) {
        masked[key] = '*'.repeat(Math.min(masked[key].length, 8));
      }
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  
  return masked;
}

/**
 * Valide les limites de taux (rate limiting)
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = config.limits.rateLimit.maxRequests,
  windowMs: number = config.limits.rateLimit.windowMs
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  // Nettoyer les entrées expirées
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime < now) {
      rateLimitStore.delete(k);
    }
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current || current.resetTime < now) {
    // Nouvelle fenêtre
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: new Date(now + windowMs)
    };
  }
  
  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(current.resetTime)
    };
  }
  
  current.count++;
  
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: new Date(current.resetTime)
  };
}

/**
 * Valide les permissions utilisateur
 */
export function validateUserPermissions(
  userType: 'freelance' | 'client',
  requiredPermissions: string[]
): boolean {
  const permissions = {
    freelance: [
      'view_own_profile',
      'edit_own_profile',
      'apply_to_projects',
      'view_projects',
      'upload_portfolio',
      'receive_messages'
    ],
    client: [
      'view_own_profile',
      'edit_own_profile',
      'create_projects',
      'view_freelancers',
      'hire_freelancers',
      'send_messages'
    ]
  };
  
  const userPermissions = permissions[userType] || [];
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

/**
 * Encode les données sensibles pour le stockage
 */
export function encodeForStorage(data: string): string {
  return Buffer.from(data).toString('base64');
}

/**
 * Décode les données sensibles du stockage
 */
export function decodeFromStorage(encodedData: string): string {
  try {
    return Buffer.from(encodedData, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

/**
 * Valide la configuration de sécurité
 */
export function validateSecurityConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Vérifier JWT Secret
  if (config.auth.jwtSecret.length < 32) {
    errors.push('JWT_SECRET doit faire au moins 32 caractères');
  }
  
  // Vérifier la configuration de production
  if (config.app.environment === 'production') {
    if (config.app.debugMode) {
      warnings.push('DEBUG_MODE ne devrait pas être activé en production');
    }
    
    if (!config.app.url.startsWith('https://')) {
      errors.push('APP_URL doit utiliser HTTPS en production');
    }
  }
  
  // Vérifier les limites
  if (config.limits.rateLimit.maxRequests > 1000) {
    warnings.push('La limite de taux est très élevée');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
