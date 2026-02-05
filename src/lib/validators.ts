/**
 * Système de validation centralisé pour Tuma
 * Utilise Zod pour une validation type-safe
 */

import { z } from 'zod';

// Schémas de base
export const emailSchema = z
  .string()
  .email('Format d\'email invalide')
  .min(1, 'Email requis')
  .max(254, 'Email trop long');

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
  .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Le mot de passe doit contenir au moins un caractère spécial');

export const nameSchema = z
  .string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(50, 'Le nom ne peut pas dépasser 50 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets');

export const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Format de téléphone invalide')
  .optional();

// Schémas d'authentification
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  userType: z.enum(['freelance', 'client']),
  phone: phoneSchema,
  companyName: z.string().max(100).optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  industry: z.string().max(100).optional(),
});

// Schémas pour les projets
export const projectSchema = z.object({
  title: z.string()
    .min(10, 'Le titre doit contenir au moins 10 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z.string()
    .min(50, 'La description doit contenir au moins 50 caractères')
    .max(5000, 'La description ne peut pas dépasser 5000 caractères'),
  category: z.enum(['developpement-web', 'design-graphique', 'redaction-traduction', 'marketing-digital']),
  budget: z.object({
    min: z.number().min(0, 'Le budget minimum doit être positif'),
    max: z.number().min(0, 'Le budget maximum doit être positif'),
    type: z.enum(['fixe', 'horaire']),
  }).refine(data => data.max >= data.min, {
    message: 'Le budget maximum doit être supérieur ou égal au minimum',
    path: ['max']
  }),
  deadline: z.string().datetime('Date limite invalide'),
  skillsRequired: z.array(z.string().min(1)).min(1, 'Au moins une compétence requise'),
  experienceLevel: z.enum(['debutant', 'intermediaire', 'expert']),
});

// Schémas pour le profil freelance
export const freelanceProfileSchema = z.object({
  bio: z.string().max(1000, 'La bio ne peut pas dépasser 1000 caractères').optional(),
  skills: z.array(z.string().min(1)).max(20, 'Maximum 20 compétences'),
  hourlyRate: z.number().min(0, 'Le taux horaire doit être positif').optional(),
  portfolio: z.array(z.object({
    title: z.string().min(1, 'Titre requis').max(100),
    description: z.string().min(1, 'Description requise').max(500),
    imageUrl: z.string().url('URL d\'image invalide'),
    projectUrl: z.string().url('URL de projet invalide').optional(),
  })).max(10, 'Maximum 10 éléments de portfolio'),
});

// Schémas pour les messages
export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Le message ne peut pas être vide')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères'),
  projectId: z.string().min(1, 'ID de projet requis'),
});

// Schémas pour les candidatures
export const applicationSchema = z.object({
  projectId: z.string().min(1, 'ID de projet requis'),
  coverLetter: z.string()
    .min(50, 'La lettre de motivation doit contenir au moins 50 caractères')
    .max(1000, 'La lettre de motivation ne peut pas dépasser 1000 caractères'),
  proposedRate: z.number().min(0, 'Le taux proposé doit être positif'),
  estimatedDuration: z.number().min(1, 'La durée estimée doit être d\'au moins 1 jour'),
});

// Schémas pour les évaluations
export const reviewSchema = z.object({
  projectId: z.string().min(1, 'ID de projet requis'),
  rating: z.number().min(1, 'Note minimum: 1').max(5, 'Note maximum: 5'),
  comment: z.string().max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères').optional(),
});

// Types TypeScript générés
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type FreelanceProfileInput = z.infer<typeof freelanceProfileSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;

// Fonction utilitaire pour valider et formater les erreurs
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue: z.ZodIssue) => issue.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Erreur de validation inconnue'] };
  }
}

// Middleware de validation pour les API routes
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateInput(schema, data);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.errors?.join(', ')}`);
    }
    return result.data!;
  };
}
