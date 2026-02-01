/**
 * Configuration centralisée pour Tuma
 * Toutes les variables d'environnement sont gérées ici
 * IMPORTANT: Ne jamais mettre de données sensibles ici - utiliser les variables d'environnement
 */

// Validation des variables d'environnement requises
const requiredEnvVars = [
  'JWT_SECRET',
  'NEXTAUTH_SECRET'
];

const isServer = typeof window === 'undefined';
const isProduction = process.env.NODE_ENV === 'production';
const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build';

// Valeur par défaut pour le build time et le développement
// En production runtime, les vraies variables seront utilisées
const DEFAULT_SECRET = process.env.NODE_ENV === 'production'
  ? ''
  : 'dev-placeholder-jwt-nextauth-secret';

// Vérifier que les variables requises sont définies (avertissement uniquement, pas d'erreur au build)
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    if (isServer && isProduction && !isProductionBuild) {
      throw new Error(`❌ Variable d'environnement manquante en production: ${envVar}`);
    }
    // Ne pas lancer d'erreur au build time - les variables seront injectées au runtime
    if (isServer && !isProduction) {
      console.warn(`⚠️  Variable d'environnement manquante: ${envVar}. Utilisation d'une valeur par défaut.`);
    }
  }
});

export const config = {
  // Base de données (désactivée pour l'authentification simple)
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/',
    name: 'Tuma',
    enabled: process.env.USE_DATABASE === 'true',
  },

  // Authentification
  auth: {
    jwtSecret: process.env.JWT_SECRET || DEFAULT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    sessionTimeout: process.env.SESSION_TIMEOUT || '7d',
  },

  // NextAuth
  nextAuth: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    secret: process.env.NEXTAUTH_SECRET || DEFAULT_SECRET,
  },

  // Email
  email: {
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    user: process.env.EMAIL_SERVER_USER,
    password: process.env.EMAIL_SERVER_PASSWORD,
    from: process.env.EMAIL_FROM,
  },

  // Upload de fichiers
  upload: {
    directory: process.env.UPLOAD_DIR || './public/uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB par défaut
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
  },

  // Paiement
  payment: {
    apiKey: process.env.PAYMENT_PROVIDER_API_KEY,
    secret: process.env.PAYMENT_PROVIDER_SECRET,
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET,
  },

  // Application
  app: {
    name: process.env.APP_NAME || 'Tuma',
    url: process.env.APP_URL || 'http://localhost:3000',
    supportEmail: process.env.SUPPORT_EMAIL,
    environment: process.env.NODE_ENV || 'development',
    debugMode: process.env.DEBUG_MODE === 'true',
  },

  // Limites de l'application
  limits: {
    // Freelances
    maxSkillsPerFreelance: 20,
    maxPortfolioItems: 10,
    maxBioLength: 1000,

    // Projets
    maxProjectTitleLength: 200,
    maxProjectDescriptionLength: 5000,
    maxApplicationsPerProject: 50,
    maxMessagesPerProject: 1000,

    // Général
    maxFileUploadsPerProject: 20,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // limite par fenêtre par IP
    },
  },

  // Catégories de services
  serviceCategories: {
    'developpement-web': {
      name: 'Développement Web',
      skills: ['JavaScript', 'React', 'Node.js', 'PHP', 'Python', 'HTML', 'CSS'],
    },
    'design-graphique': {
      name: 'Design Graphique',
      skills: ['Photoshop', 'Illustrator', 'Figma', 'UI/UX', 'Logo Design'],
    },
    'redaction-traduction': {
      name: 'Rédaction & Traduction',
      skills: ['Rédaction', 'Traduction', 'Copywriting', 'SEO Writing'],
    },
    'marketing-digital': {
      name: 'Marketing Digital',
      skills: ['SEO', 'Google Ads', 'Social Media', 'Email Marketing'],
    },
  },

  // Plans tarifaires
  plans: {
    gratuit: {
      name: 'Gratuit',
      price: 0,
      commission: 0.05, // 5%
      features: ['Profil de base', 'Candidatures limitées', 'Support communautaire'],
    },
    premium: {
      name: 'Premium',
      price: 5000, // FCFA
      commission: 0, // 0%
      features: ['Profil avancé', 'Candidatures illimitées', 'Support prioritaire', 'Badge Premium'],
    },
    'pro-elite': {
      name: 'Pro Elite',
      price: 15000, // FCFA
      commission: 0, // 0%
      features: ['Tout Premium', 'Mise en avant', 'Analytics avancées', 'Manager dédié'],
    },
  },

  // Devises supportées
  currencies: {
    primary: 'FCFA',
    supported: ['FCFA', 'USD', 'EUR'],
    exchangeRates: {
      USD: 600, // 1 USD = 600 FCFA (approximatif)
      EUR: 650, // 1 EUR = 650 FCFA (approximatif)
    },
  },
} as const;

// Types pour TypeScript
export type ServiceCategory = keyof typeof config.serviceCategories;
export type PlanType = keyof typeof config.plans;
export type Currency = keyof typeof config.currencies.exchangeRates | 'FCFA';

// Fonction utilitaire pour valider la configuration
export function validateConfig(): boolean {
  try {
    // Vérifications supplémentaires
    if (!config.database.uri.includes('mongodb')) {
      throw new Error('MONGODB_URI doit être une URI MongoDB valide');
    }

    if (config.auth.jwtSecret.length < 32) {
      console.warn('⚠️  JWT_SECRET devrait faire au moins 32 caractères pour une sécurité optimale');
    }

    if (config.app.environment === 'production' && config.app.debugMode) {
      console.warn('⚠️  DEBUG_MODE ne devrait pas être activé en production');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur de configuration:', error);
    return false;
  }
}

// Valider la configuration au démarrage
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') { // Côté serveur seulement
  validateConfig();
}
