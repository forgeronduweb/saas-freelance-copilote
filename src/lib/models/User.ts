import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'freelance' | 'client' | 'admin';
  avatar?: string;
  phone?: string;
  location?: {
    country: string;
    city: string;
  };

  professions?: string[];
  onboardingCompleted?: boolean;
  
  // Champs spécifiques aux freelances
  skills?: string[];
  hourlyRate?: number;
  bio?: string;
  yearsOfExperience?: number;
  availability?: 'full-time' | 'part-time' | 'weekends' | 'evenings';
  preferredDays?: string[];
  onboardingStep?: number;
  portfolio?: {
    title: string;
    description: string;
    imageUrl: string;
    projectUrl?: string;
  }[];
  rating?: number;
  totalEarnings?: number;
  completedProjects?: number;
  planType?: 'gratuit' | 'premium' | 'pro-elite';
  
  // Champs spécifiques aux clients
  companyName?: string;
  companySize?: string;
  industry?: string;
  totalSpent?: number;
  
  // Champs communs
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  userType: {
    type: String,
    required: true,
    enum: ['freelance', 'client', 'admin'],
  },
  avatar: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  location: {
    country: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
  },

  professions: [{
    type: String,
    trim: true,
  }],
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  
  // Champs freelance
  skills: [{
    type: String,
    trim: true,
  }],
  hourlyRate: {
    type: Number,
    min: 0,
    default: null,
  },
  bio: {
    type: String,
    maxlength: 1000,
    default: null,
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    default: null,
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'evenings'],
    default: null,
  },
  preferredDays: [{
    type: String,
    enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
  }],
  onboardingStep: {
    type: Number,
    min: 1,
    max: 4,
    default: 1,
  },
  portfolio: [{
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    projectUrl: {
      type: String,
      default: null,
    },
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    min: 0,
    default: 0,
  },
  completedProjects: {
    type: Number,
    min: 0,
    default: 0,
  },
  planType: {
    type: String,
    enum: ['gratuit', 'premium', 'pro-elite'],
    default: 'gratuit',
  },
  
  // Champs client
  companyName: {
    type: String,
    default: null,
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: null,
  },
  industry: {
    type: String,
    default: null,
  },
  totalSpent: {
    type: Number,
    min: 0,
    default: 0,
  },
  
  // Champs communs
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index pour optimiser les recherches
UserSchema.index({ email: 1 });
UserSchema.index({ userType: 1 });
UserSchema.index({ skills: 1 });
UserSchema.index({ location: 1 });

// Méthodes virtuelles
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual('initials').get(function() {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

// Exporter le modèle
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
